"""One JSON-generation boundary for Cohere and OpenAI-compatible chat APIs."""
import json
import os
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException


async def generate_json(system, context):
    provider = os.getenv('AI_PROVIDER', 'cohere').lower()
    if provider not in {'cohere', 'openai', 'openai-compatible'}:
        raise HTTPException(503, 'AI_PROVIDER must be cohere, openai, or openai-compatible.')
    model = os.getenv('AI_MODEL') or (os.getenv('COHERE_RAG_MODEL', 'command-a-03-2025') if provider == 'cohere' else '')
    if not model:
        raise HTTPException(503, 'Set AI_MODEL to a JSON-capable model available from your provider.')
    base = os.getenv('AI_BASE_URL', 'https://api.cohere.com/v2' if provider == 'cohere' else 'https://api.openai.com/v1').rstrip('/')
    url = urlparse(base)
    local = url.hostname in {'localhost', '127.0.0.1', '::1'}
    if url.username or url.password or url.query or url.fragment or not url.hostname or not (url.scheme == 'https' or (url.scheme == 'http' and local)):
        raise HTTPException(503, 'AI_BASE_URL must use HTTPS, except for a local model server.')
    key = os.getenv('AI_API_KEY') or os.getenv('COHERE_API_KEY' if provider == 'cohere' else 'OPENAI_API_KEY')
    if not key and not local:
        raise HTTPException(503, 'Configure an AI_API_KEY for the selected provider.')
    payload = {'model': model, 'messages': [{'role': 'system', 'content': system},
               {'role': 'user', 'content': json.dumps(context)}], 'response_format': {'type': 'json_object'}}
    payload['max_completion_tokens' if provider == 'openai' else 'max_tokens'] = 1200
    if provider == 'cohere':
        payload['temperature'] = 0.2
    endpoint = '/chat' if provider == 'cohere' else '/chat/completions'
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
            response = await client.post(base + endpoint, json=payload,
                                         headers={'Authorization': f'Bearer {key}'} if key else {})
            response.raise_for_status()
            result = response.json()
        if provider == 'cohere':
            text = ''.join(block.get('text', '') for block in result['message']['content'] if block.get('type') == 'text')
        else:
            text = result['choices'][0]['message']['content']
        parsed = json.loads(text)
        if not isinstance(parsed, dict):
            raise ValueError('Expected a JSON object')
        return parsed
    except (httpx.HTTPError, KeyError, IndexError, AttributeError, TypeError, ValueError) as exc:
        raise HTTPException(502, 'AI assistance is temporarily unavailable. Please retry.') from exc
