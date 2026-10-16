from pathlib import Path
import sys
import unittest
from fastapi import HTTPException
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.weekly_review import build_review


def summary(days):
    current = {'active_days': days, 'tasks_created': 3, 'tasks_completed': 2, 'focus_started': 2, 'focus_completed': 1, 'focus_minutes': 25, 'clarity_score': None, 'completion_rate': 50}
    return {'current': current, 'previous': dict(current, active_days=0, focus_minutes=0), 'period': {'timezone': 'UTC'}}


class ReviewTests(unittest.IsolatedAsyncioTestCase):
    async def test_sparse_data_never_calls_a_model(self):
        async def forbidden(*args):
            self.fail('Sparse data should not generate a reflection')
        self.assertEqual((await build_review(summary(1), forbidden))['mode'], 'getting_started')

    async def test_uses_calculated_evidence_and_checks_references(self):
        async def generate(system, context):
            self.assertEqual(next(e['value'] for e in context['evidence'] if e['id'] == 'focus_minutes'), 25)
            self.assertNotIn('clarity_score', {e['id'] for e in context['evidence']})
            return {'observations': [{'text': 'You recorded 25 focus minutes.', 'evidence_ids': ['focus_minutes']}], 'experiment': 'Try one manageable focus session tomorrow.'}
        result = await build_review(summary(3), generate)
        self.assertEqual(result['mode'], 'ai')
        self.assertEqual(result['observations'][0]['evidence_ids'], ['focus_minutes'])
        async def bad(*args):
            return {'observations': [{'text': 'You improved.', 'evidence_ids': ['invented_metric']}], 'experiment': 'Do more.'}
        with self.assertRaises(HTTPException):
            await build_review(summary(3), bad)
