import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

import httpx
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('cop_mcp', ROOT / 'integrations/mcp/server.py')
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)


class MCPTests(unittest.IsolatedAsyncioTestCase):
    async def test_discovery_and_authenticated_tool_calls(self):
        calls = []
        def respond(request):
            calls.append(request)
            self.assertEqual(request.headers['authorization'], 'Bearer test-token')
            if request.url.path == '/api/todo/':
                return httpx.Response(200, json=[{'id': 1}])
            return httpx.Response(200, json={'sources': [{'task_id': 1}]})
        with patch.dict(os.environ, {'COP_API_TOKEN': 'test-token', 'COP_API_URL': 'http://127.0.0.1:8000'}):
            server = adapter.create_server(httpx.MockTransport(respond))
            tools = await server.list_tools()
            self.assertEqual({tool.name for tool in tools}, {'list_tasks', 'search_tasks', 'ask_tasks'})
            self.assertTrue(all(tool.annotations.readOnlyHint for tool in tools))
            for name, args in [('list_tasks', {}), ('search_tasks', {'query': 'exam'}), ('ask_tasks', {'query': 'exam'})]:
                await server.call_tool(name, args)
            self.assertEqual([r.url.path for r in calls], ['/api/todo/', '/api/rag/search', '/api/rag/ask'])
            self.assertEqual(json.loads(calls[1].content), {'query': 'exam', 'limit': 5})

    async def test_bad_config_and_expired_tokens_fail_safely(self):
        for env, status in [({'COP_API_TOKEN': ''}, 200), ({'COP_API_TOKEN': 'token', 'COP_API_URL': 'http://external.example'}, 200), ({'COP_API_TOKEN': 'token', 'COP_API_URL': 'http://127.0.0.1:8000'}, 401)]:
            with patch.dict(os.environ, env):
                server = adapter.create_server(httpx.MockTransport(lambda req: httpx.Response(status, json={'secret': 'do-not-echo'})))
                with self.assertRaises(Exception) as error:
                    await server.call_tool('list_tasks', {})
                self.assertNotIn('do-not-echo', str(error.exception))

    async def test_invalid_search_does_not_contact_api(self):
        def forbidden(request):
            self.fail('Invalid tool input should never reach the API')
        server = adapter.create_server(httpx.MockTransport(forbidden))
        with self.assertRaises(Exception):
            await server.call_tool('search_tasks', {'query': ' ', 'limit': 5})

    async def test_real_stdio_initialization_discovery_and_tool_error(self):
        params = StdioServerParameters(command=sys.executable, args=[str(ROOT / 'integrations/mcp/server.py')], env={'COP_API_TOKEN': ''})
        async with stdio_client(params) as (read, write):
            async with ClientSession(read, write) as session:
                result = await session.initialize()
                self.assertEqual(result.serverInfo.name, 'Clash of Plans')
                tools = await session.list_tools()
                self.assertEqual({tool.name for tool in tools.tools}, {'list_tasks', 'search_tasks', 'ask_tasks'})
                result = await session.call_tool('list_tasks', {})
                self.assertTrue(result.isError)
                self.assertIn('COP_API_TOKEN', result.content[0].text)
