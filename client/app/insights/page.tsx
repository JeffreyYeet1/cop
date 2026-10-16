import WorkspaceShell from '../components/WorkspaceShell';
import HeartInsights from '../components/HeartInsights';
export default function InsightsPage() {
  return <WorkspaceShell><header className="mb-8"><p className="text-[10px] uppercase tracking-[.2em] text-stone-400">Understand your rhythm</p><h1 className="text-3xl sm:text-4xl font-medium tracking-tight mt-3">A little perspective on your week.</h1><p className="text-sm text-stone-500 mt-3 max-w-xl leading-relaxed">See what you made time for, how your plan felt, and what you might try next. Small observations, at your pace.</p></header><HeartInsights /></WorkspaceShell>;
}
