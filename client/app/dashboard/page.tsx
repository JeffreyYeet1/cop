"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';
import WorkspaceShell from '../components/WorkspaceShell';
import { DashboardOverview } from '../components/HeartInsights';
import DailyTasks from '../DashComponents/DailyTasks';
import Calendar from '../DashComponents/Calendar';
import PekaPanel from '../components/PekaPanel';
export default function DashboardPage() {
  const [date, setDate] = useState('Your workspace');
  useEffect(() => { setDate(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })); }, []);
  return <WorkspaceShell><header className="flex flex-wrap justify-between items-end gap-5 mb-8"><div><p className="text-[10px] text-stone-400 uppercase tracking-[.2em]">{date}</p><h1 className="text-3xl sm:text-4xl font-medium tracking-tight mt-3">Make room for what matters.</h1><p className="text-sm text-stone-500 mt-3">A clear next step. A little space for the rest of your day.</p></div><Link href="/focus" className="flex gap-2 items-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600 hover:border-violet-300"><Leaf size={15} className="text-[#8c9e70]" />Find a little focus<ArrowRight size={14} /></Link></header><DashboardOverview /><div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6"><div className="space-y-6"><DailyTasks /><PekaPanel /></div><div className="min-w-0"><p className="text-[10px] text-stone-500 mb-3 px-1">Day plan · saved on this browser for this account · separate from Google Calendar</p><Calendar /></div></div></WorkspaceShell>;
}
