import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
import httpx
from fastapi import HTTPException
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.ai_provider import generate_json


class ProviderTests(unittest.IsolatedAsyncioTestCase):
    async def test_openai_and_local_compatible_responses(self):
        original = httpx.AsyncClient
        for provider, base in [('openai', 'https://api.openai.com/v1'), ('openai-compatible', 'http://localhost:11434/v1')]:
            def respond(request):
                self.assertEqual(str(request.url), base + '/chat/completions')
                payload = json.loads(request.content)
                self.assertEqual(payload['model'], 'configured-model')
                self.assertEqual(payload['response_format'], {'type': 'json_object'})
                self.assertEqual(payload['messages'][1]['content'], '{"value": 3}')
                self.assertIn('max_completion_tokens' if provider == 'openai' else 'max_tokens', payload)
                return httpx.Response(200, json={'choices': [{'message': {'content': '{"answer":"ok"}'}}]})
            config = {'AI_PROVIDER': provider, 'AI_MODEL': 'configured-model', 'AI_BASE_URL': base}
            if provider == 'openai':
                config['AI_API_KEY'] = 'test-key'
            with patch.dict(os.environ, config, clear=True), patch('services.ai_provider.httpx.AsyncClient', side_effect=lambda **kw: original(transport=httpx.MockTransport(respond), **kw)):
                self.assertEqual(await generate_json('Return JSON.', {'value': 3}), {'answer': 'ok'})

    async def test_invalid_config_and_malformed_output(self):
        for config in ({'AI_PROVIDER': 'unknown'}, {'AI_PROVIDER': 'openai'}, {'AI_PROVIDER': 'openai-compatible', 'AI_MODEL': 'test', 'AI_BASE_URL': 'http://remote.example/v1'}):
            with patch.dict(os.environ, config, clear=True), self.assertRaises(HTTPException) as error:
                await generate_json('JSON', {})
            self.assertEqual(error.exception.status_code, 503)
        original = httpx.AsyncClient
        for result in ({'choices': []}, {'choices': [{'message': {'content': '[]'}}]}, {'choices': [{'message': {'content': None}}]}):
            with patch.dict(os.environ, {'AI_PROVIDER': 'openai', 'AI_MODEL': 'test', 'AI_API_KEY': 'test'}, clear=True), patch('services.ai_provider.httpx.AsyncClient', side_effect=lambda **kw: original(transport=httpx.MockTransport(lambda req: httpx.Response(200, json=result)), **kw)), self.assertRaises(HTTPException) as error:
                await generate_json('JSON', {})
            self.assertEqual(error.exception.status_code, 502)
