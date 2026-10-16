"""Run from the repo root: python -m unittest discover -s server/tests -v"""
import json
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.security import HTTPBearer

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'server'))
from services.task_retrieval import retrieve_tasks
from services.task_rag import TaskRAGService

TASKS = [
    {'id': 1, 'user_id': 7, 'title': 'Algorithms exam', 'description': 'Review graphs', 'priority': 'high', 'estimated_duration': 45},
    {'id': 2, 'user_id': 7, 'title': 'Read history chapter', 'description': 'Ancient Rome', 'priority': 'low', 'estimated_duration': 30},
    {'id': 3, 'user_id': 8, 'title': 'Algorithms private exam', 'description': 'Another user secret', 'priority': 'high'},
]


class RetrievalTests(unittest.TestCase):
    def test_relevance_and_owner_filter(self):
        self.assertEqual([t['id'] for t in retrieve_tasks(TASKS, 7, 'algorithms exam')], [1])

    def test_empty_and_no_match(self):
        for query in ('', 'the and a', 'chemistry'):
            self.assertEqual(retrieve_tasks(TASKS, 7, query), [])
        self.assertEqual(retrieve_tasks([], 7, 'algorithms'), [])

    def test_generic_planning_and_limit(self):
        self.assertEqual([t['id'] for t in retrieve_tasks(TASKS, 7, 'what should I do next', 1)], [1])


class RAGTests(unittest.IsolatedAsyncioTestCase):
    async def test_retrieval_precedes_generation_and_citations_are_validated(self):
        calls = []
        async def generate(query, sources):
            calls.append(sources)
            return {'answer': 'Review graphs [task:1].', 'cited_task_ids': [1], 'action_items': ['Review graphs']}
        service = TaskRAGService(lambda owner: TASKS, generate)
        result = await service.answer(7, 'algorithms')
        self.assertEqual([s['task_id'] for s in calls[0]], [1])
        self.assertEqual(result['sources'][0]['task_id'], 1)
        self.assertNotIn('user_id', result['sources'][0])
        self.assertEqual(result['intent'], 'analyze')

    async def test_no_match_skips_model(self):
        async def forbidden(*args):
            self.fail('A no-match response must not call the model')
        result = await TaskRAGService(lambda owner: TASKS, forbidden).answer(7, 'chemistry')
        self.assertEqual(result['sources'], [])

    async def test_hallucinated_foreign_or_missing_citations_rejected(self):
        for ids in ([3], [999], []):
            async def generate(query, sources):
                return {'answer': 'Study.', 'cited_task_ids': ids}
            with self.assertRaises(HTTPException) as error:
                await TaskRAGService(lambda owner: TASKS, generate).answer(7, 'algorithms')
            self.assertEqual(error.exception.status_code, 502)

    async def test_inline_references_must_match_declared_sources(self):
        for answer in ('Use another task [task:3].', 'Use this task.', 'Use [task:1] and [task:999].'):
            async def generate(query, sources):
                return {'answer': answer, 'cited_task_ids': [1]}
            with self.assertRaises(HTTPException):
                await TaskRAGService(lambda owner: TASKS, generate).answer(7, 'algorithms')

    async def test_invalid_model_schema_rejected(self):
        async def generate(query, sources):
            return {'answer': '', 'cited_task_ids': [1]}
        with self.assertRaises(HTTPException):
            await TaskRAGService(lambda owner: TASKS, generate).answer(7, 'algorithms')

    async def test_context_is_bounded(self):
        tasks = [dict(TASKS[0], description='algorithms ' * 1000, password='private')]
        result = await TaskRAGService(lambda owner: tasks).search(7, 'algorithms')
        self.assertEqual(len(result[0]['description']), 1500)
        self.assertNotIn('password', result[0])

    async def test_cohere_v2_payload_and_response(self):
        def respond(request):
            payload = json.loads(request.content)
            self.assertEqual(str(request.url), 'https://api.cohere.com/v2/chat')
            self.assertEqual(payload['response_format'], {'type': 'json_object'})
            context = json.loads(payload['messages'][1]['content'])
            self.assertEqual(context['task_records'][0]['task_id'], 1)
            self.assertNotIn('Another user secret', request.content.decode())
            self.assertIn('untrusted data', payload['messages'][0]['content'])
            return httpx.Response(200, json={'message': {'content': [{'type': 'text', 'text': json.dumps({'answer': 'Review graphs [task:1].', 'cited_task_ids': [1]})}]}})
        original = httpx.AsyncClient
        def mock_client(**kwargs):
            return original(transport=httpx.MockTransport(respond), **kwargs)
        with patch.dict(os.environ, {'COHERE_API_KEY': 'test-only-key'}), patch('services.ai_provider.httpx.AsyncClient', side_effect=mock_client):
            result = await TaskRAGService(lambda owner: TASKS).answer(7, 'algorithms')
        self.assertEqual(result['sources'][0]['task_id'], 1)

    async def test_cohere_failures_and_missing_key(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(HTTPException) as error:
                await TaskRAGService(lambda owner: TASKS).answer(7, 'algorithms')
            self.assertEqual(error.exception.status_code, 503)
        original = httpx.AsyncClient
        for response in (httpx.Response(429, json={'detail': 'private provider error'}), httpx.Response(200, json={})):
            with patch.dict(os.environ, {'COHERE_API_KEY': 'test-only-key'}), patch('services.ai_provider.httpx.AsyncClient', side_effect=lambda **kwargs: original(transport=httpx.MockTransport(lambda req: response), **kwargs)):
                with self.assertRaises(HTTPException) as error:
                    await TaskRAGService(lambda owner: TASKS).answer(7, 'algorithms')
                self.assertEqual(error.exception.status_code, 502)
                self.assertNotIn('private provider error', error.exception.detail)


class RouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_auth_validation_and_caller_scoping(self):
        # Replace only the existing database-backed auth dependency, never the router or service.
        dependency = types.ModuleType('api.dependencies')
        bearer = HTTPBearer()
        dependency.get_current_user = bearer
        with patch.dict(sys.modules, {'api.dependencies': dependency}):
            from api.routes.rag import router, get_rag_service
        app = FastAPI()
        app.include_router(router, prefix='/api/rag')
        calls = []
        def load_tasks(owner):
            calls.append(owner)
            return TASKS
        app.dependency_overrides[get_rag_service] = lambda: TaskRAGService(load_tasks=load_tasks)
        async def signed_in_user():
            return types.SimpleNamespace(id=7)
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url='http://test') as client:
            self.assertIn((await client.post('/api/rag/search', json={'query': 'algorithms'})).status_code, (401, 403))
            app.dependency_overrides[bearer] = signed_in_user
            response = await client.post('/api/rag/search', json={'query': 'algorithms', 'user_id': 8})
            self.assertEqual(response.status_code, 200)
            self.assertEqual([s['task_id'] for s in response.json()['sources']], [1])
            self.assertEqual(calls, [7])
            for body in ({'query': ' '}, {'query': 'x', 'limit': 11}, {'query': 'x' * 2001}):
                self.assertEqual((await client.post('/api/rag/search', json=body)).status_code, 422)
            response = await client.post('/api/rag/ask', json={'query': 'chemistry'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['sources'], [])


if __name__ == '__main__':
    unittest.main()
