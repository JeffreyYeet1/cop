# Configure AI providers

Task RAG and weekly reflections use the same JSON-generation adapter. Changing providers requires environment configuration, not application code. The original `/api/peka/*` hackathon endpoints remain separate legacy Cohere integrations; the updated dashboard uses `/api/rag/*`.

| Setting | Meaning |
| --- | --- |
| `AI_PROVIDER` | `cohere` (default), `openai`, or `openai-compatible` |
| `AI_MODEL` | A JSON-capable model available from the selected provider. Required outside Cohere. |
| `AI_API_KEY` | Server-side provider credential; never use a browser public variable. |
| `AI_BASE_URL` | API prefix. Defaults to `https://api.cohere.com/v2` or `https://api.openai.com/v1`. |

Existing `COHERE_API_KEY` and `COHERE_RAG_MODEL` settings continue to work. `OPENAI_API_KEY` is a fallback when using an OpenAI-format endpoint. Models must support chat messages and JSON object output; model access and behavior vary by provider. Application-level Pydantic validation remains in place.

For an OpenAI model, set `AI_PROVIDER=openai`, `AI_MODEL` to your selected model ID, and `AI_API_KEY`. This mode uses Chat Completions with `max_completion_tokens`. For another compatible server, select `openai-compatible`, set its `/v1` base URL and model ID; that mode uses `max_tokens`. Both request JSON object output. No temperature setting is forced on compatible models.

A local JSON-capable model server can use `AI_PROVIDER=openai-compatible` and `AI_BASE_URL=http://localhost:11434/v1`; set `AI_MODEL` to a model actually installed there. Loopback endpoints may omit a key. Nonlocal endpoints require HTTPS and a key. Redirects are disabled. No automatic cross-provider fallback sends data to an unexpected provider.

Reference: [OpenAI Chat Completions format](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create), [Cohere v2 Chat](https://docs.cohere.com/reference/chat).
