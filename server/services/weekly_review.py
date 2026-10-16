"""Optional AI explanations of deterministic metrics, with evidence IDs."""
from typing import List
from fastapi import HTTPException
from pydantic import BaseModel, Field, ValidationError
from services.ai_provider import generate_json


class Observation(BaseModel):
    text: str = Field(min_length=1, max_length=700)
    evidence_ids: List[str] = Field(min_length=1, max_length=5)


class Reflection(BaseModel):
    observations: List[Observation] = Field(min_length=1, max_length=3)
    experiment: str = Field(min_length=1, max_length=500)


def evidence_for(summary):
    labels = {'active_days': 'Active days', 'tasks_created': 'Tasks captured', 'tasks_completed': 'Task completion transitions',
              'focus_started': 'Focus sessions started', 'focus_completed': 'Focus sessions completed',
              'focus_minutes': 'Recorded focus minutes', 'clarity_score': 'Mean clarity rating', 'completion_rate': 'Focus completion percentage'}
    return [{'id': key, 'label': label, 'value': summary['current'][key], 'previous': summary['previous'][key]}
            for key, label in labels.items() if summary['current'][key] is not None]


async def build_review(summary, generate=generate_json):
    evidence = evidence_for(summary)
    if summary['current']['active_days'] < 2:
        return {'mode': 'getting_started', 'observations': [], 'experiment': 'Record activity on at least two days, then return for a weekly reflection.', 'evidence': evidence}
    system = (
        'You are a supportive planning coach. Return JSON with observations (1–3 objects with text and evidence_ids), '
        'and experiment (one small optional planning experiment). Use ONLY the supplied calculated evidence. '
        'Do not calculate new statistics, invent causes, diagnose mental health, equate more work with success, '
        'or claim the app improved productivity. Today is partial; comparisons are descriptive. '
        'Previous zero values are not proof of improvement and missing values mean unknown. '
        'Reference the supplied evidence IDs in each observation.evidence_ids array. Do not suggest medication or medical treatment.'
    )
    result = await generate(system, {'period': summary['period'], 'evidence': evidence})
    try:
        review = Reflection.model_validate(result)
    except ValidationError as exc:
        raise HTTPException(502, 'The weekly reflection was not valid. Your recorded metrics are still available.') from exc
    allowed = {item['id'] for item in evidence}
    if any(set(item.evidence_ids) - allowed for item in review.observations):
        raise HTTPException(502, 'The weekly reflection referenced unavailable evidence. Please retry.')
    return {'mode': 'ai', **review.model_dump(), 'evidence': evidence}
