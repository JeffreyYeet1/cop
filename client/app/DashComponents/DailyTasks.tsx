"use client";
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Clock3, GripVertical, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Task, Priority } from '../types';
import { todoService } from '../services/todoService';

const empty = { title: '', description: '', priority: 'medium' as Priority, estimated_duration: 30 };
export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [filter, setFilter] = useState<'open' | 'all' | 'done'>('open');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = async () => {
    try { setTasks(await todoService.getAllTodos()); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not load tasks.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); window.addEventListener('taskUpdated', refresh); return () => window.removeEventListener('taskUpdated', refresh); }, []);
  const changed = () => window.dispatchEvent(new Event('activityUpdated'));
  const open = (task?: Task) => {
    setEditing(task?.id || null); setForm(task ? { title: task.title, description: task.description, priority: task.priority, estimated_duration: task.estimated_duration || 30 } : empty); setFormError(''); dialog.current?.showModal();
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setFormError('');
    try {
      const task = editing ? await todoService.updateTodo(editing, form) : await todoService.createTodo(form);
      setTasks(previous => editing ? previous.map(item => item.id === task.id ? task : item) : [...previous, task]);
      dialog.current?.close(); changed();
    } catch (failure) { setFormError(failure instanceof Error ? failure.message : 'Could not save the task.'); }
    finally { setSaving(false); }
  };
  const complete = async (task: Task) => {
    setPending(task.id); setError('');
    try { const updated = await todoService.setCompletion(task.id, !task.completed_at); setTasks(previous => previous.map(item => item.id === updated.id ? updated : item)); changed(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save completion.'); }
    finally { setPending(null); }
  };
  const remove = async (task: Task) => {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setPending(task.id);
    try { await todoService.deleteTodo(task.id); setTasks(previous => previous.filter(item => item.id !== task.id)); changed(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not delete the task.'); }
    finally { setPending(null); }
  };
  const visible = tasks.filter(task => filter === 'all' || (filter === 'done' ? !!task.completed_at : !task.completed_at));
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 min-w-0" aria-labelledby="tasks-title">
    <header className="flex justify-between gap-3 items-center"><div><h2 id="tasks-title" className="font-semibold text-base">Your priorities</h2><p className="text-xs text-stone-500 mt-1">Start with one manageable next step.</p></div><button onClick={() => open()} className="flex items-center gap-2 rounded-lg bg-violet-700 px-3 py-2 text-xs text-white hover:bg-violet-800"><Plus size={15} />Add task</button></header>
    <div className="flex gap-1 border-b border-stone-100 mt-5 pb-3">{(['open', 'all', 'done'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-xs capitalize ${filter === value ? 'bg-stone-100 text-stone-800' : 'text-stone-500'}`}>{value === 'open' ? 'To do' : value}</button>)}</div>
    {error && <div role="alert" className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 mt-4">{error}<button onClick={refresh} className="underline ml-3">Retry</button></div>}
    {loading ? <p role="status" className="flex gap-2 text-sm text-stone-500 py-10"><Loader2 className="animate-spin" size={17} />Loading your tasks…</p> : visible.length === 0 ? <div className="py-14 text-center"><div className="rounded-full bg-[#f0f3e8] w-11 h-11 mx-auto mb-4 flex items-center justify-center text-[#8b9a71]"><Check size={20} /></div><p className="text-sm text-stone-600">{tasks.length ? 'A little breathing room.' : 'A clearer day starts here.'}</p><p className="text-xs text-stone-500 mt-2">{tasks.length ? 'Switch tabs to see the rest of your list.' : 'Capture a task, give it some time, and take it from there.'}</p></div> : <ul className="divide-y divide-stone-100">{visible.map(task => <li key={task.id} id={`task-${task.id}`} draggable={!task.completed_at} onDragStart={event => { event.dataTransfer.setData('application/json', JSON.stringify({ type: 'task', data: { ...task, duration: task.estimated_duration || 30 } })); }} className="py-4 flex items-start gap-3 group">
      <button disabled={pending === task.id} onClick={() => complete(task)} aria-label={task.completed_at ? `Reopen ${task.title}` : `Complete ${task.title}`} aria-pressed={!!task.completed_at} className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center disabled:opacity-40 ${task.completed_at ? 'bg-violet-600 text-white border-violet-600' : 'border-stone-300 hover:border-violet-400'}`}>{task.completed_at && <Check size={12} />}</button>
      <div className="min-w-0 flex-1"><p className={`text-sm break-words ${task.completed_at ? 'line-through text-stone-400' : 'text-stone-800'}`}>{task.title}</p>{task.description && <p className="text-xs text-stone-500 mt-1.5 break-words line-clamp-2">{task.description}</p>}<div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-stone-500"><span className={`rounded px-1.5 py-0.5 ${task.priority === 'high' ? 'bg-amber-50 text-amber-800' : task.priority === 'medium' ? 'bg-violet-50 text-violet-700' : 'bg-stone-100 text-stone-600'}`}>{task.priority} priority</span><span className="inline-flex items-center gap-1"><Clock3 size={11} />{task.estimated_duration || 30} min</span></div></div>
      <div className="flex gap-1"><button aria-label={`Edit ${task.title}`} onClick={() => open(task)} className="p-1.5 text-stone-400 hover:text-violet-700"><Pencil size={14} /></button><button disabled={pending === task.id} aria-label={`Delete ${task.title}`} onClick={() => remove(task)} className="p-1.5 text-stone-400 hover:text-red-600"><Trash2 size={14} /></button></div>
    </li>)}</ul>}
    <p className="text-[10px] text-stone-400 mt-3 flex gap-1.5 items-center"><GripVertical size={12} />Drag an open task into your day plan.</p>
    <dialog ref={dialog} aria-labelledby="task-dialog-title" className="rounded-2xl border border-stone-200 p-6 w-[calc(100%-2rem)] max-w-md backdrop:bg-stone-900/20 shadow-xl" onCancel={event => { if (saving) event.preventDefault(); }}><form onSubmit={save}><div className="flex items-center justify-between mb-6"><h2 id="task-dialog-title" className="font-semibold text-lg">{editing ? 'Edit task' : 'Make a little plan'}</h2><button type="button" aria-label="Close task form" disabled={saving} onClick={() => dialog.current?.close()}><X size={18} /></button></div><label className="block text-xs text-stone-600">What needs doing?<input required maxLength={200} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="block w-full border border-stone-200 rounded-lg p-3 mt-2 text-sm" autoFocus /></label><label className="block text-xs text-stone-600 mt-4">A little context<textarea value={form.description} maxLength={3000} onChange={event => setForm({ ...form, description: event.target.value })} rows={3} className="block w-full border border-stone-200 rounded-lg p-3 mt-2 text-sm" /></label><div className="grid grid-cols-2 gap-4 mt-4"><label className="text-xs text-stone-600">Priority<select value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value as Priority })} className="block w-full border rounded-lg p-2 mt-2">{['low','medium','high'].map(value => <option key={value}>{value}</option>)}</select></label><label className="text-xs text-stone-600">Minutes<input type="number" required min={1} max={1440} value={form.estimated_duration} onChange={event => setForm({ ...form, estimated_duration: Number(event.target.value) })} className="block w-full border rounded-lg p-2 mt-2" /></label></div>{formError && <p role="alert" className="text-xs text-red-700 mt-4">{formError}</p>}<button disabled={saving || !form.title.trim()} className="w-full rounded-xl bg-violet-700 text-white py-3 text-sm mt-6 disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save changes' : 'Add to my list'}</button></form></dialog>
  </section>;
}
