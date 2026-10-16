"use client";
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
interface Answer { message: string; action_items: string[]; sources: { task_id: number; title: string; description: string }[] }
export default function PekaPanel() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'o') { event.preventDefault(); input.current?.focus(); input.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); } };
    document.addEventListener('keydown', shortcut); return () => document.removeEventListener('keydown', shortcut);
  }, []);
  const ask = async (event: FormEvent) => {
    event.preventDefault(); if (!query.trim()) return;
    setBusy(true); setError('');
    try { setAnswer(await api<Answer>('/rag/ask', { method: 'POST', body: JSON.stringify({ query: query.trim(), limit: 5 }) })); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not reach Peka.'); }
    finally { setBusy(false); }
  };
  return <section className="rounded-2xl border border-violet-200 bg-[#f3eff8] p-5 sm:p-6" aria-labelledby="peka-title"><div className="flex items-center gap-2 text-violet-700"><Sparkles size={18} /><h2 id="peka-title" className="text-sm font-medium">A clearer next step, with Peka.</h2><kbd className="ml-auto text-[10px] border border-violet-200 rounded px-1.5 py-1 hidden sm:block">⌘ / Ctrl O</kbd></div><p className="text-xs text-stone-600 mt-2 leading-relaxed">Ask about your saved tasks. Peka retrieves relevant details and shows its sources.</p><div className="flex flex-wrap gap-2 mt-4">{['What should I do next?', 'Which tasks have high priority?'].map(text => <button key={text} onClick={() => { setQuery(text); input.current?.focus(); }} className="text-[10px] rounded-full bg-white/70 border border-violet-100 px-3 py-1.5 text-violet-800">{text}</button>)}</div><form onSubmit={ask} className="flex gap-2 mt-4 bg-white rounded-xl border border-violet-200 p-2"><label htmlFor="peka-question" className="sr-only">Question about your saved tasks</label><input id="peka-question" ref={input} value={query} maxLength={2000} onChange={event => setQuery(event.target.value)} placeholder="What’s on your mind?" className="min-w-0 flex-1 px-2 text-sm bg-transparent outline-none" /><button disabled={busy || !query.trim()} aria-label="Ask Peka" className="rounded-lg bg-violet-700 text-white p-2 disabled:opacity-40">{busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={17} />}</button></form>{error && <p role="alert" className="text-xs text-red-700 mt-4">{error}</p>}{answer && <div aria-live="polite" className="mt-5 pt-5 border-t border-violet-200"><p className="text-sm leading-relaxed whitespace-pre-wrap">{answer.message}</p>{answer.action_items.length > 0 && <ul className="list-disc pl-5 text-xs text-stone-600 leading-relaxed mt-3 space-y-1">{answer.action_items.map((item,index) => <li key={index}>{item}</li>)}</ul>}{answer.sources.length > 0 && <details className="mt-4 text-xs text-violet-800"><summary className="cursor-pointer">Based on {answer.sources.length} saved task{answer.sources.length === 1 ? '' : 's'}</summary><ul className="mt-2 space-y-2">{answer.sources.map(source => <li key={source.task_id}><strong className="font-medium">[task:{source.task_id}] {source.title}</strong><p className="text-stone-500 mt-1">{source.description}</p></li>)}</ul></details>}</div>}</section>;
}
