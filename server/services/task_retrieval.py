"""Small, deterministic lexical retriever; no index service or embeddings required."""
import math
import re
from collections import Counter

STOP_WORDS = set('a an and are as at be can do for from how i in is it me my of on or please should the this to what which with would you'.split())
PLANNING_WORDS = {'next', 'prioritize', 'priorities', 'priority', 'plan', 'planning', 'tasks', 'task', 'todo', 'todos', 'work', 'focus', 'start', 'first', 'today'}


def tokens(text):
    return [word for word in re.findall(r"[\w]+", text.casefold()) if word not in STOP_WORDS]


def retrieve_tasks(tasks, user_id, query, limit=5):
    """Rank owned task text with BM25; generic planning uses priority as a fallback."""
    limit = max(1, min(limit, 10))
    # Defense in depth: even an incorrectly scoped caller cannot include another user's task.
    owned = [task.model_dump(mode='json') if hasattr(task, 'model_dump') else dict(task) for task in tasks]
    owned = [task for task in owned if task.get('user_id') == user_id]
    terms = set(tokens(query))
    if not owned or not terms:
        return []
    documents = [Counter(tokens(f"{task.get('title', '')} {task.get('description', '')} {task.get('priority', '')}")) for task in owned]
    average_length = sum(sum(doc.values()) for doc in documents) / len(documents) or 1
    frequencies = {term: sum(term in doc for doc in documents) for term in terms}
    results = []
    for task, doc in zip(owned, documents):
        score = 0.0
        for term in terms:
            count = doc[term]
            if count:
                inverse_frequency = math.log(1 + (len(documents) - frequencies[term] + 0.5) / (frequencies[term] + 0.5))
                score += inverse_frequency * count * 2.5 / (count + 1.5 * (0.25 + 0.75 * sum(doc.values()) / average_length))
        if score > 0:
            results.append((score, task))
    if not results and terms <= PLANNING_WORDS:
        results = [({'high': 3, 'medium': 2, 'low': 1}.get(task.get('priority'), 0), task) for task in owned]
    results.sort(key=lambda pair: (-pair[0], pair[1]['id']))
    return [task for _, task in results[:limit]]
