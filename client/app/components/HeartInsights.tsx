"use client";
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Check, Heart, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { HeartSummary, insightsService, WeeklyReview } from '../services/insightsService';

function useHeart() {
  const [summary, setSummary] = useState<HeartSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setSummary(await insightsService.summary()); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not load activity.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); window.addEventListener('activityUpdated', load); return () => window.removeEventListener('activityUpdated', load); }, [load]);
  return { summary, error, loading, load };
}

export function DashboardOverview() {
  const { summary, error } = useHeart();
  return <div className="mb-7"><div className="grid sm:grid-cols-3 gap-3">{[
    { label: 'A little momentum', value: summary ? `${summary.current.tasks_completed}` : '—', unit: 'task completions', tone: 'bg-[#eef2e7]' },
    { label: 'Time you made space for', value: summary ? `${summary.current.focus_minutes}` : '—', unit: 'recorded focus minutes', tone: 'bg-[#f0ebf7]' },
    { label: 'Showing up counts', value: summary ? `${summary.current.active_days} / 7` : '—', unit: 'active days', tone: 'bg-[#f5efe5]' },
  ].map(card => <div key={card.label} className={`rounded-2xl p-5 ${card.tone}`}><p className="text-[11px] text-stone-600">{card.label}</p><p className="mt-3 text-3xl font-light text-stone-800 tabular-nums">{card.value}<span className="ml-2 text-[11px] text-stone-500 font-normal">{card.unit}</span></p></div>)}</div><div className="flex justify-between gap-3 mt-3 text-[10px] text-stone-500"><span>{error || 'Recorded activity · last seven local dates, including today'}</span><Link href="/insights" className="shrink-0 text-violet-700 inline-flex items-center gap-1">See your rhythm<ArrowRight size={12} /></Link></div></div>;
}

export default function HeartInsights() {
  const { summary, error, loading, load } = useHeart();
  const [score, setScore] = useState<number | null>(null);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const checkin = async () => {
    if (!score) return;
    setCheckinBusy(true); setFeedback('');
    try { await insightsService.checkin(score); setFeedback('Saved for today. You can change it any time today.'); setReview(null); await load(); }
    catch (failure) { setFeedback(failure instanceof Error ? failure.message : 'Could not save your check-in.'); }
    finally { setCheckinBusy(false); }
  };
  const reflect = async () => {
    setReviewBusy(true); setReviewError('');
    try { setReview(await insightsService.review()); }
    catch (failure) { setReviewError(failure instanceof Error ? failure.message : 'Could not generate a reflection.'); }
    finally { setReviewBusy(false); }
  };
  if (loading) return <p role="status" className="flex items-center gap-2 text-stone-500 py-12"><Loader2 size={18} className="animate-spin" />Gathering your recorded activity…</p>;
  if (!summary) return <div role="alert" className="rounded-2xl border border-stone-200 bg-white p-8"><p className="text-sm text-stone-600">{error}</p><p className="text-xs text-stone-500 mt-2">Your activity will appear here once you sign in and the activity database is configured.</p><button onClick={load} className="text-sm text-violet-700 mt-4 inline-flex items-center gap-2"><RefreshCw size={14} />Try again</button></div>;
  const { heart, current } = summary;
  const cards = [
    { letter: 'H', label: 'Happiness', value: heart.happiness.score === null ? '—' : `${heart.happiness.score} / 5`, detail: heart.happiness.responses ? `Clarity rating · ${heart.happiness.responses} check-in${heart.happiness.responses === 1 ? '' : 's'}` : 'Optional clarity check-in below', tone: 'bg-rose-50 text-rose-700' },
    { letter: 'E', label: 'Engagement', value: `${heart.engagement.active_days} / 7`, detail: `${heart.engagement.previous_active_days} active days in the prior period`, tone: 'bg-violet-50 text-violet-700' },
    { letter: 'A', label: 'Adoption', value: `${Number(!!heart.adoption.first_task_at) + Number(!!heart.adoption.first_focus_at)} / 2`, detail: 'First task + first focus session', tone: 'bg-amber-50 text-amber-700' },
    { letter: 'R', label: 'Retention', value: heart.retention.returned === null ? '—' : heart.retention.returned ? 'Returned' : 'Not yet', detail: heart.retention.returned === null ? 'Needs activity in the prior period' : 'Activity in adjacent seven-day periods', tone: 'bg-emerald-50 text-emerald-700' },
    { letter: 'T', label: 'Task success', value: heart.task_success.completion_rate === null ? '—' : `${heart.task_success.completion_rate}%`, detail: `${current.focus_completed} of ${current.focus_started} focus sessions completed`, tone: 'bg-sky-50 text-sky-700' },
  ];
  const max = Math.max(30, ...summary.series.map(day => day.focus_minutes));
  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3 text-xs text-stone-500"><p>Last seven local dates · {summary.period.timezone} · today is partial</p><button onClick={() => { setReview(null); void load(); }} className="inline-flex gap-1.5 items-center text-violet-700"><RefreshCw size={12} />Refresh</button></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">{cards.map(card => <article key={card.letter} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-stone-500"><span className={`rounded-md w-6 h-6 flex items-center justify-center font-semibold ${card.tone}`}>{card.letter}</span>{card.label}</div><p className="text-2xl tracking-tight font-medium my-5">{card.value}</p><p className="text-[11px] text-stone-500 leading-relaxed">{card.detail}</p></article>)}</div>
    <div className="grid xl:grid-cols-[1.3fr_1fr] gap-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-base">Your weekly rhythm</h2><p className="text-xs text-stone-500 mt-1">Recorded focus minutes, grouped by session start date.</p></div><BarChart3 size={19} className="text-violet-400" /></div><div className="h-48 flex items-end gap-3 mt-8" role="img" aria-label={summary.series.map(day => `${day.date}: ${day.focus_minutes} focus minutes`).join('; ')}>{summary.series.map(day => <div key={day.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] text-stone-500 tabular-nums">{day.focus_minutes || '·'}</span><div className="w-full max-w-10 rounded-t-lg bg-violet-300" style={{ height: `${Math.max(2, day.focus_minutes / max * 140)}px`, opacity: day.focus_minutes ? 1 : .25 }} /><span className="text-[10px] text-stone-500">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span></div>)}</div><details className="mt-5 text-xs text-stone-500"><summary className="cursor-pointer">View the numbers</summary><table className="w-full mt-3 text-left"><thead><tr><th className="py-2 font-medium">Date</th><th className="font-medium">Minutes</th><th className="font-medium">Task completions</th></tr></thead><tbody>{summary.series.map(day => <tr key={day.date} className="border-t border-stone-100"><td className="py-2">{day.date}</td><td>{day.focus_minutes}</td><td>{day.tasks_completed}</td></tr>)}</tbody></table></details></section>
      <section className="rounded-2xl border border-[#dce4d0] bg-[#f0f4e9] p-6"><Heart size={21} className="text-[#839b67]" /><h2 className="text-lg font-medium mt-5">A plan should feel manageable.</h2><p className="text-sm text-stone-600 leading-relaxed mt-3">How clear does your plan feel today?</p><fieldset className="mt-5"><legend className="sr-only">Clarity rating, from one to five</legend><div className="flex gap-2">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-pressed={score === value} aria-label={`${value} out of 5${value === 1 ? ', unclear' : value === 5 ? ', very clear' : ''}`} onClick={() => setScore(value)} className={`w-10 h-10 rounded-xl text-sm border ${score === value ? 'bg-[#607c48] border-[#607c48] text-white' : 'bg-white/70 border-[#d9e1ce] text-stone-600'}`}>{value}</button>)}</div></fieldset><div className="flex justify-between max-w-[232px] text-[10px] text-stone-500 mt-2"><span>Unclear</span><span>Very clear</span></div><button disabled={!score || checkinBusy} onClick={checkin} className="mt-5 rounded-lg bg-[#607c48] text-white px-4 py-2 text-xs disabled:opacity-40">{checkinBusy ? 'Saving…' : 'Save today’s check-in'}</button><p className="text-[10px] text-stone-500 leading-relaxed mt-4">Optional. One response per local day. This is your reflection, not a health assessment.</p>{feedback && <p role="status" className="text-xs text-stone-700 mt-3">{feedback}</p>}</section>
    </div>
    <section className="rounded-2xl border border-[#e0d6ed] bg-[#f1edf7] p-6 sm:p-8"><div className="flex flex-wrap justify-between gap-4"><div><div className="flex gap-2 items-center text-xs text-violet-700"><Sparkles size={16} />A little perspective</div><h2 className="text-xl font-medium mt-3">Look back. Choose one small experiment.</h2><p className="text-xs text-stone-600 mt-3 max-w-xl leading-relaxed">An optional AI reflection uses the figures above to describe patterns and suggest a manageable next step. You decide what fits.</p></div><button disabled={reviewBusy} onClick={reflect} className="self-start inline-flex gap-2 items-center bg-white rounded-xl border border-violet-200 px-4 py-3 text-xs text-violet-800 disabled:opacity-50">{reviewBusy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}{reviewBusy ? 'Reflecting…' : review ? 'Refresh reflection' : 'Reflect on my week'}</button></div>{reviewError && <p role="alert" className="text-sm text-red-700 mt-5">{reviewError}</p>}{review && <div className="mt-6 border-t border-violet-200 pt-6"><div className="grid md:grid-cols-3 gap-4">{review.observations.map((observation,index) => <article key={index} className="bg-white/70 p-4 rounded-xl"><p className="text-sm leading-relaxed">{observation.text}</p><p className="text-[10px] mt-3 text-violet-700">{observation.evidence_ids.map(id => { const fact = review.evidence.find(item => item.id === id); return fact ? `${fact.label}: ${fact.value}` : ''; }).join(' · ')}</p></article>)}</div><p className="text-sm mt-5"><span className="font-medium">{review.mode === 'getting_started' ? 'A place to begin: ' : 'One experiment: '}</span>{review.experiment}</p><p className="text-[10px] text-stone-500 mt-3">Based on recorded app activity. AI interpretations may be mistaken; these figures do not prove changes in productivity or wellbeing.</p></div>}</section>
    <details className="rounded-xl border border-stone-200 p-5 text-xs text-stone-500 leading-relaxed"><summary className="cursor-pointer font-medium text-stone-700">What does HEART mean here?</summary><p className="mt-3">Happiness, Engagement, Adoption, Retention, and Task success: a framework for understanding an experience. These are personal signals, not a score of your worth. Missing ratings and absent comparison periods stay unknown. Active sessions count in the completion denominator; ended-early sessions contribute recorded minutes.</p><a href="https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/" className="inline-flex gap-2 items-center underline mt-3 text-violet-700">Read Google’s HEART paper<ArrowRight size={12} /></a></details>
  </div>;
}
