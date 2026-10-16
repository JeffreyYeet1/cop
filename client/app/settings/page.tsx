"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
import WorkspaceShell from '../components/WorkspaceShell';
import { api } from '../services/api';

interface Profile { name: string; email: string; created_at?: string | null }
export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [zone, setZone] = useState('Your local timezone');
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    api<Profile>('/users/me/').then(setProfile).catch(failure => setError(failure instanceof Error ? failure.message : 'Could not load your profile.'));
  }, []);
  return <WorkspaceShell><header className="mb-8"><p className="text-[10px] uppercase tracking-[.2em] text-stone-400">Your workspace, your pace</p><h1 className="text-3xl sm:text-4xl font-medium tracking-tight mt-3">Keep things personal.</h1><p className="text-sm text-stone-500 mt-3">Your account and the activity behind your insights.</p></header><div className="max-w-2xl space-y-6"><section className="rounded-2xl border border-stone-200 bg-white p-6"><UserRound size={23} className="text-violet-500" /><h2 className="text-lg font-medium mt-4">Your account</h2>{error && <p role="alert" className="text-sm text-red-700 mt-4">{error}</p>}<dl className="mt-6 divide-y divide-stone-100">{[['Name', profile?.name || '—'], ['Email', profile?.email || '—'], ['Timezone', zone]].map(([label,value]) => <div key={label} className="py-4 flex flex-wrap justify-between gap-3 text-sm"><dt className="text-stone-500">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl></section><section className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-medium">What your insights use</h2><p className="text-sm text-stone-500 leading-relaxed mt-3">Task creation and completion, recorded focus sessions, and optional clarity check-ins. Weekly reflections use calculated activity figures. Your task questions send relevant task details to the model provider configured by the server.</p><p className="text-xs text-stone-500 mt-4 leading-relaxed">Day plans stay on this browser, separated by account and date. Focus timers retain their state here until their activity is saved. Sign out on shared devices.</p></section><button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userInfo'); router.push('/login'); }} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm text-stone-600"><LogOut size={16} />Sign out</button></div></WorkspaceShell>;
}
