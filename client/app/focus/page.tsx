import WorkspaceShell from '../components/WorkspaceShell';
import PomodoroTimer from '../DashComponents/PomodoroTimer';
import Link from 'next/link';
export default function FocusPage() {
  return <WorkspaceShell><header className="mb-8"><p className="text-[10px] tracking-[.2em] uppercase text-stone-400">Protect a little attention</p><h1 className="text-3xl sm:text-4xl tracking-tight font-medium mt-3">One thing is enough for now.</h1><p className="text-sm text-stone-500 mt-3">Choose a duration, settle into a task, and leave room for a break.</p></header><div className="max-w-2xl mx-auto"><PomodoroTimer /><p className="text-xs text-stone-500 text-center mt-5">Your recorded sessions help build your <Link href="/insights" className="text-violet-700 underline underline-offset-4">weekly rhythm</Link>.</p></div></WorkspaceShell>;
}
