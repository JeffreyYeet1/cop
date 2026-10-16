# Use task RAG and MCP

## RAG endpoints

Start the configured backend using the [README](../README.md). The new endpoints use the existing bearer authentication and saved tasks; they need no database migration.

| Endpoint | Body | Result |
| --- | --- | --- |
| `POST /api/rag/search` | `{"query":"algorithms exam","limit":5}` | Matching task source records; no model call |
| `POST /api/rag/ask` | `{"query":"What should I review for my algorithms exam?","limit":5}` | An answer, action items, and cited task sources |

Questions must contain 1–2,000 characters. Limits range from 1 to 10. The API derives ownership from the caller's token, not the request body. Use a title or subject for keyword search, or a broad planning question such as “what should I do next” for priority-based selection.

Generation uses the [configurable AI adapter](ai-providers.md). The default Cohere configuration remains compatible with `COHERE_API_KEY` and `COHERE_RAG_MODEL`; OpenAI and compatible JSON-capable servers are also supported. The new path does not use the original assistant's legacy `generate` interface. No-match answers and search work without a model key.

Example request in a shell where `COP_API_TOKEN` already contains your app token:

```sh
curl --fail-with-body http://127.0.0.1:8000/api/rag/ask \
  -H "Authorization: Bearer ${COP_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"query":"What should I review for my algorithms exam?","limit":5}'
```

An answer returns the existing assistant-style fields (`intent`, `message`, `action_items`, `timestamp`, and `task_details`) plus `sources`. Each source includes a task ID, title, description, priority, and estimated duration. The model is asked to reference supporting IDs as `[task:123]` in its answer.

## Local MCP setup

Use Python 3.11+ and a separate environment for the adapter:

```sh
python3 -m venv integrations/mcp/.venv
integrations/mcp/.venv/bin/pip install -r integrations/mcp/requirements.txt
```

Supply these environment variables through your MCP client's local configuration or secret store:

| Variable | Value |
| --- | --- |
| `COP_API_URL` | Defaults to `http://127.0.0.1:8000`. Use HTTPS for remote APIs. |
| `COP_API_TOKEN` | A current bearer token obtained by signing into Clash of Plans. |

The adapter uses that user's permissions. It does not require a Supabase key or Cohere key locally; generation credentials remain on the backend. Refresh the token when it expires. Keep real tokens out of committed configuration.

A typical stdio client configuration looks like this; replace the absolute checkout path and configure the token privately in your client:

```json
{
  "mcpServers": {
    "clash-of-plans": {
      "command": "/absolute/path/to/cop/integrations/mcp/.venv/bin/python",
      "args": ["/absolute/path/to/cop/integrations/mcp/server.py"],
      "env": {
        "COP_API_URL": "http://127.0.0.1:8000",
        "COP_API_TOKEN": "YOUR_LOCAL_USER_TOKEN"
      }
    }
  }
}
```

After the client initializes, it can discover:

- `list_tasks()` — list the signed-in user's tasks.
- `search_tasks(query, limit=5)` — retrieve matching tasks.
- `ask_tasks(query, limit=5)` — retrieve tasks and get a generated answer with sources.

All tools are read-only. The adapter does not create tasks, edit calendars, or open an HTTP port. It is launched by an MCP client; running it alone in a terminal waits for protocol messages on stdin.

## Run the checks

The test environment includes the MCP SDK and FastAPI. It is deliberately separate from the backend's pinned legacy dependencies:

```sh
python3 -m venv /tmp/cop-checks
/tmp/cop-checks/bin/pip install -r integrations/mcp/requirements.txt fastapi==0.109.2
/tmp/cop-checks/bin/python -m unittest discover -s server/tests -v
```

The suite uses fake user/task data and mocked HTTP model responses, plus a real MCP subprocess for initialization and discovery. It never calls paid model inference or your production database. Live generation still requires a configured backend, a valid user token, saved matching tasks, and access to the configured model.
