"use client";
import { useEffect, useRef, useState } from 'react';
import { Check, Clock3, Pause, Play, RotateCcw } from 'lucide-react';
import { insightsService } from '../services/insightsService';
import { focusStorageKey, remainingSeconds } from '../../lib/focusClock';

type Timer = { id: string | null; planned: number; remaining: number; deadline: number | null; phase: 'idle' | 'starting' | 'running' | 'paused' | 'pending' | 'saved'; outcome?: 'completed' | 'abandoned' | 'interrupted' };
const fresh = (minutes: number): Timer => ({ id: null, planned: minutes * 60, remaining: minutes * 60, deadline: null, phase: 'idle' });

export default function PomodoroTimer() {
  const [timer, setTimer] = useState<Timer>(fresh(25));
  const [duration, setDuration] = useState(25);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef<string | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    key.current = focusStorageKey(localStorage.getItem('token'));
    try {
      const saved = JSON.parse(localStorage.getItem(key.current || '') || 'null') as Timer | null;
      if (saved && typeof saved.id === 'string' && Number.isFinite(saved.planned) && saved.planned >= 60 && saved.planned <= 14400 && Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.planned && ['starting', 'running', 'paused', 'pending', 'saved'].includes(saved.phase)) {
        const remaining = saved.phase === 'running' && Number.isFinite(saved.deadline) ? remainingSeconds(saved.deadline!) : saved.remaining;
        setTimer({ ...saved, remaining, phase: remaining === 0 && saved.phase === 'running' ? 'pending' : saved.phase, outcome: remaining === 0 ? 'completed' : saved.outcome });
        setDuration(saved.planned / 60);
      }
    } catch { /* Invalid local state must not prevent a new session. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !key.current || mode !== 'focus') return;
    try { localStorage.setItem(key.current, JSON.stringify(timer)); }
    catch { setError('Browser storage is unavailable. Keep this page open until the session is saved.'); }
  }, [timer, ready, mode]);

  useEffect(() => {
    if (timer.phase !== 'running' || timer.deadline === null) return;
    const tick = () => setTimer(previous => {
      if (previous.phase !== 'running' || previous.deadline === null) return previous;
      const remaining = remainingSeconds(previous.deadline!);
      return { ...previous, remaining, phase: remaining === 0 ? (mode === 'focus' ? 'pending' : 'saved') : 'running', outcome: remaining === 0 ? 'completed' : undefined };
    });
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [timer.phase, timer.deadline, mode]);

  const finish = async (outcome: 'completed' | 'abandoned') => {
    if (!timer.id || saving.current) return;
    saving.current = true; setBusy(true); setError('');
    const remaining = timer.phase === 'running' ? remainingSeconds(timer.deadline!) : timer.remaining;
    setTimer(previous => ({ ...previous, remaining, phase: 'pending', deadline: null, outcome }));
    try {
      const session = await insightsService.finishFocus(timer.id, outcome, timer.planned - remaining);
      setTimer(previous => ({ ...previous, phase: 'saved', outcome: session.status === 'completed' ? 'completed' : session.status === 'interrupted' ? 'interrupted' : 'abandoned' }));
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save this session. Please retry.'); }
    finally { saving.current = false; setBusy(false); }
  };
  useEffect(() => {
    if (ready && timer.phase === 'pending' && timer.outcome === 'completed') void finish('completed');
    // One automatic attempt; failed saves require the retry button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, timer.phase]);

  const start = async () => {
    setBusy(true); setError('');
    try {
      if (timer.phase === 'paused' || mode !== 'focus') {
        setTimer(previous => ({ ...previous, phase: 'running', deadline: Date.now() + previous.remaining * 1000 }));
      } else {
        const id = timer.id || crypto.randomUUID();
        setTimer(previous => ({ ...previous, id, phase: 'starting' }));
        const session = await insightsService.startFocus(id, timer.planned);
        if (session.status !== 'active') setTimer(previous => ({ ...previous, phase: 'saved', outcome: session.status }));
        else {
          const remaining = session.id === id ? timer.remaining : Math.max(0, session.planned_seconds - session.actual_seconds);
          setTimer({ id: session.id, planned: session.planned_seconds, remaining, phase: 'running', deadline: Date.now() + remaining * 1000 });
          setDuration(session.planned_seconds / 60);
        }
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not start the session.'); }
    finally { setBusy(false); }
  };
  // Keep the latest clock snapshot without restarting the heartbeat interval on every tick.
  const latest = useRef(timer);
  latest.current = timer;
  useEffect(() => {
    if (!ready || mode !== 'focus' || !timer.id || !['running', 'paused'].includes(timer.phase)) return;
    let alive = true;
    let sending = false;
    const heartbeat = async () => {
      const current = latest.current;
      if (sending || !current.id || !['running', 'paused'].includes(current.phase)) return;
      sending = true;
      try {
        const remaining = current.phase === 'running' ? remainingSeconds(current.deadline!) : current.remaining;
        const session = await insightsService.heartbeat(current.id, current.planned - remaining);
        if (!alive) return;
        if (session.status !== 'active') {
          setTimer(previous => ({ ...previous, phase: 'saved', deadline: null, outcome: session.status === 'completed' ? 'completed' : session.status === 'interrupted' ? 'interrupted' : 'abandoned' }));
        }
      } catch (failure) {
        if (alive) setError('Heartbeat could not be saved. Reconnect soon; a session without a heartbeat for 10 minutes is interrupted.');
      } finally { sending = false; }
    };
    void heartbeat();
    const interval = setInterval(heartbeat, 30000);
    const visible = () => { if (document.visibilityState === 'visible') void heartbeat(); };
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('online', heartbeat);
    return () => { alive = false; clearInterval(interval); document.removeEventListener('visibilitychange', visible); window.removeEventListener('online', heartbeat); };
  }, [ready, mode, timer.id, timer.phase]);
  const active = !['idle', 'saved'].includes(timer.phase);
  const progress = (timer.planned - timer.remaining) / timer.planned * 100;
  return <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm" aria-labelledby="timer-title">
    <div className="flex flex-wrap justify-center gap-2 mb-9">{(['focus', 'short', 'long'] as const).map(value => <button key={value} disabled={active || busy} onClick={() => { setMode(value); setError(''); setTimer(fresh(value === 'focus' ? duration : value === 'short' ? 5 : 15)); }} aria-pressed={mode === value} className={`rounded-full px-4 py-2 text-sm disabled:opacity-50 ${mode === value ? 'bg-violet-100 text-violet-800' : 'text-stone-500 hover:bg-stone-100'}`}>{value === 'focus' ? 'Focus' : value === 'short' ? 'Short break' : 'Long break'}</button>)}</div>
    <div className="text-center"><p className="text-xs uppercase tracking-[.2em] text-stone-400">One thing at a time</p><h2 id="timer-title" className="text-xl mt-3 text-stone-800">{mode === 'focus' ? 'Make a little space to focus.' : 'Take a moment for yourself.'}</h2>
      <div className="text-7xl sm:text-8xl font-light tracking-tight tabular-nums my-9 text-stone-800" role="timer" aria-label="Time remaining">{Math.floor(timer.remaining / 60).toString().padStart(2, '0')}:{(timer.remaining % 60).toString().padStart(2, '0')}</div>
      <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden max-w-xs mx-auto"><div className="h-full bg-violet-400" style={{ width: `${progress}%` }} /></div>
      {timer.phase === 'saved' ? <div className="my-7"><p className="text-emerald-700 text-sm flex items-center justify-center gap-2"><Check size={16} />{mode !== 'focus' ? 'Break finished.' : timer.outcome === 'completed' ? 'Session saved. Well done for showing up.' : timer.outcome === 'interrupted' ? 'Session interrupted after its heartbeat stopped. You can start fresh.' : 'Time recorded. You can start fresh.'}</p><button onClick={() => setTimer(fresh(mode === 'focus' ? duration : mode === 'short' ? 5 : 15))} className="mt-4 text-sm text-violet-700 underline underline-offset-4">Start a new session</button></div> : <div className="flex flex-wrap justify-center gap-3 my-7">
        {timer.phase === 'running' ? <button onClick={() => setTimer(previous => ({ ...previous, remaining: remainingSeconds(previous.deadline!), deadline: null, phase: 'paused' }))} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-white"><Pause size={18} />Pause</button> : timer.phase === 'pending' ? <button disabled={busy} onClick={() => finish(timer.outcome === 'abandoned' ? 'abandoned' : 'completed')} className="rounded-xl bg-violet-700 px-6 py-3 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Retry save'}</button> : <button disabled={busy || !ready} onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-white disabled:opacity-50"><Play size={17} />{busy ? 'Starting…' : timer.phase === 'paused' ? 'Resume' : timer.phase === 'starting' ? 'Retry start' : 'Start session'}</button>}
        {active && timer.phase !== 'pending' && timer.phase !== 'starting' && <button disabled={busy} onClick={() => mode === 'focus' ? finish('abandoned') : setTimer(fresh(mode === 'short' ? 5 : 15))} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600"><RotateCcw size={15} />End early</button>}
      </div>}
      {error && <p role="alert" className="text-sm text-red-700 max-w-sm mx-auto mb-5">{error}</p>}
      {mode === 'focus' && !active && <label className="text-sm text-stone-500 inline-flex gap-3 items-center">Focus duration<input aria-label="Focus duration in minutes" type="number" min={1} max={240} value={duration} onChange={event => { const value = Math.max(1, Math.min(240, Number(event.target.value) || 1)); setDuration(value); setTimer(fresh(value)); }} className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-stone-800" />minutes</label>}
      <p className="mt-6 text-xs text-stone-500 leading-relaxed flex justify-center gap-2"><Clock3 size={14} />Focus sessions save to your activity history. Breaks stay private to this timer.</p>
    </div>
  </section>;
}
