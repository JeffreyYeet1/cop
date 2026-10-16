"use client";
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, CalendarDays, Clock3, Github, Layers3, LayoutDashboard, LogOut, Settings } from 'lucide-react';

const navigation = [
  { href: '/dashboard', label: 'My day', icon: LayoutDashboard },
  { href: '/focus', label: 'Focus', icon: Clock3 },
  { href: '/insights', label: 'My insights', icon: BarChart3 },
  { href: '/calendar', label: 'Google Calendar', icon: CalendarDays },
  { href: '/settings', label: 'Settings', icon: Settings },
];
export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Your workspace');
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(!!localStorage.getItem('token'));
    try { const info = JSON.parse(localStorage.getItem('userInfo') || '{}'); if (info.name) setName(info.name); } catch { /* Use a neutral account label. */ }
  }, []);
  return <div className="min-h-screen bg-[#f7f8f4] text-stone-800">
    <a href="#workspace-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3">Skip to workspace</a>
    <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 border-b lg:border-b-0 lg:border-r border-stone-200 bg-[#fcfcf9] flex flex-col z-20">
      <Link href="/" className="flex items-center gap-2 px-6 py-6 text-base font-semibold tracking-tight"><Layers3 size={22} className="text-violet-600" />Clash of Plans<span className="text-violet-500 -ml-2">.</span></Link>
      <p className="hidden lg:block text-[10px] tracking-[.2em] text-stone-400 px-6 mt-5 mb-3 uppercase">A little more headspace</p>
      <nav aria-label="Workspace" className="flex lg:flex-col overflow-x-auto gap-1 px-3 pb-3 lg:pb-0">{navigation.map(({ href, label, icon: Icon }) => <Link href={href} key={href} aria-current={path === href ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm whitespace-nowrap ${path === href ? 'bg-violet-100/70 text-violet-800 font-medium' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}><Icon size={18} />{label}</Link>)}</nav>
      <div className="hidden lg:block mt-auto p-5"><div className="rounded-2xl border border-stone-200 p-4 mb-5 bg-white"><p className="text-xs font-medium">Small steps count.</p><p className="text-xs text-stone-500 leading-relaxed mt-2">A manageable plan leaves room for the rest of your life.</p><Link href="/insights" className="inline-block mt-3 text-xs text-violet-700">Explore your weekly rhythm →</Link></div><div className="flex items-center gap-3 border-t border-stone-200 pt-5"><span className="rounded-full bg-[#e9ecdf] w-9 h-9 flex items-center justify-center text-sm text-stone-600">{name.slice(0, 1).toUpperCase()}</span><p className="text-xs flex-1 truncate">{name}</p>{signedIn ? <button aria-label="Sign out" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userInfo'); router.push('/login'); }} className="text-stone-400 hover:text-stone-700"><LogOut size={16} /></button> : <Link href="/login" className="text-xs text-violet-700">Sign in</Link>}</div></div>
    </aside>
    <main id="workspace-main" className="lg:ml-60 px-5 sm:px-8 xl:px-12 py-8 sm:py-10 max-w-[1800px]">
      {!signedIn && <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600">Your personal activity stays with your account. <Link href="/login" className="text-violet-700 underline">Sign in</Link> to save tasks and focus sessions.</div>}
      {children}
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5 text-[11px] text-stone-400"><span>A little structure. A little room to breathe.</span><a href="https://github.com/JeffreyYeet1/cop" className="inline-flex items-center gap-2 hover:text-stone-600"><Github size={13} />Built in the open</a></footer>
    </main>
  </div>;
}
