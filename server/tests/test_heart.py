from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from fastapi import HTTPException
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.heart import summarize, get_zone, validate_finish

NOW = datetime(2026, 10, 16, 18, tzinfo=timezone.utc)


class HeartTests(unittest.TestCase):
    def test_empty_is_unknown_not_zero_satisfaction_or_retention(self):
        result = summarize({'events': [], 'sessions': [], 'checkins': []}, 7, 'America/Toronto', NOW)
        self.assertIsNone(result['heart']['happiness']['score'])
        self.assertIsNone(result['heart']['retention']['returned'])
        self.assertIsNone(result['heart']['task_success']['completion_rate'])
        self.assertEqual(len(result['series']), 7)

    def test_cohorts_timezone_and_owner_isolation(self):
        data = {'events': [
            {'user_id': 7, 'kind': 'task_created', 'created_at': '2026-10-11T02:00:00Z'},
            {'user_id': 7, 'kind': 'task_completed', 'created_at': '2026-10-15T12:00:00Z'},
            {'user_id': 7, 'kind': 'task_created', 'created_at': '2026-10-05T12:00:00Z'},
            {'user_id': 8, 'kind': 'task_completed', 'created_at': '2026-10-15T12:00:00Z'}],
            'sessions': [{'user_id': 7, 'started_at': '2026-10-15T12:00:00Z', 'status': 'completed', 'actual_seconds': 1500},
                         {'user_id': 7, 'started_at': '2026-10-16T12:00:00Z', 'status': 'active', 'actual_seconds': 0}],
            'checkins': [{'user_id': 7, 'local_date': '2026-10-15', 'score': 4}, {'user_id': 8, 'local_date': '2026-10-15', 'score': 1}]}
        result = summarize(data, 7, 'America/Toronto', NOW)
        self.assertEqual(result['series'][0]['date'], '2026-10-10')
        self.assertEqual(result['series'][0]['tasks_created'], 1)
        self.assertEqual(result['current']['active_days'], 3)
        self.assertEqual(result['current']['tasks_completed'], 1)
        self.assertEqual(result['current']['focus_minutes'], 25)
        self.assertEqual(result['heart']['task_success']['completion_rate'], 50)
        self.assertEqual(result['heart']['happiness']['score'], 4)
        self.assertTrue(result['heart']['retention']['returned'])

    def test_timezone_validation_and_dst(self):
        with self.assertRaises(HTTPException):
            get_zone('not/a-zone')
        now = datetime(2026, 11, 3, 12, tzinfo=timezone.utc)
        result = summarize({'events': [], 'sessions': [], 'checkins': []}, 7, 'America/Toronto', now)
        self.assertIn('-04:00', result['period']['start'])
        self.assertIn('-05:00', result['period']['end'])
        self.assertEqual(len({day['date'] for day in result['series']}), 7)

    def test_focus_validation_retries_and_early_finish(self):
        session = {'status': 'active', 'started_at': '2026-10-16T17:00:00Z', 'planned_seconds': 1500}
        self.assertIsNone(validate_finish(session, 'completed', 1500, NOW))
        with self.assertRaises(HTTPException):
            validate_finish(session, 'completed', 100, NOW)
        with self.assertRaises(HTTPException):
            validate_finish(dict(session, started_at='2026-10-16T17:59:59Z'), 'completed', 1500, NOW)
        self.assertIsNone(validate_finish(session, 'abandoned', 100, NOW))
        self.assertEqual(validate_finish(dict(session, status='completed'), 'abandoned', 0, NOW)['status'], 'completed')
        with self.assertRaises(HTTPException):
            validate_finish(None, 'completed', 1500, NOW)
