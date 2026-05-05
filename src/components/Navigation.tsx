import { Bell, User, Compass, Route, Bookmark, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function Header({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const tabs = ['Home', 'My Paths', 'Explore', 'History'];
  
  return (
    <header className="bg-[#050B14]/80 backdrop-blur-md border-b border-white/10 fixed top-0 w-full z-50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('Home')}>
          <span className="text-xl font-bold text-primary-container tracking-tighter font-display">WhatNext</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-display tracking-tight">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`transition-colors relative pb-1 ${
                activeTab === tab ? 'text-primary-container' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container"
                />
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button title="Notifications" aria-label="Notifications" className="text-slate-400 hover:bg-white/5 transition-all duration-300 p-2 rounded-full active:scale-95">
            <Bell size={20} />
          </button>
          <button title="Profile" aria-label="Profile" className="text-slate-400 hover:bg-white/5 transition-all duration-300 p-2 rounded-full active:scale-95">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const links = ['Privacy', 'Terms', 'Support', 'Twitter'];
  
  return (
    <footer className="bg-[#050B14] border-t border-white/5 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 font-display text-sm">
        <div className="flex items-center gap-6">
          <span className="text-primary-container font-bold">WhatNext</span>
          <p className="text-slate-500">© 2024 WhatNext AI Guidance. Calmly navigating your future.</p>
        </div>
        <div className="flex gap-8">
          {links.map((link) => (
            <a key={link} className="text-slate-500 hover:text-slate-300 transition-colors" href="#">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function MobileNav({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const items = [
    { id: 'Explore', icon: Compass, label: 'Guide' },
    { id: 'Paths', icon: Route, label: 'Paths' },
    { id: 'Saved', icon: Bookmark, label: 'Saved' },
    { id: 'Chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <nav className="md:hidden bg-[#1A2C40]/90 backdrop-blur-lg fixed bottom-0 w-full z-50 rounded-t-2xl border-t border-white/5 shadow-[0_-10px_30px_rgba(5,11,20,0.8)] flex justify-around items-center px-4 py-3 pb-safe-area">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center justify-center transition-all active:scale-90 px-4 py-1 rounded-xl ${
            activeTab === item.id ? 'text-primary-container bg-primary-container/10' : 'text-slate-500'
          }`}
        >
          <item.icon size={20} />
          <span className="font-display text-[10px] font-medium mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
