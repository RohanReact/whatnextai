import { Sparkles, CheckCircle, Lock, Brain, MessageSquare, History } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingScreen({ onGetUnstuck }: { onGetUnstuck: () => void }) {
  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Ambient Background Pulse */}
      <div className="absolute inset-0 hero-gradient pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Content Canvas */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center min-h-[819px] text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container font-label-sm text-sm mb-6">
            <Sparkles size={18} fill="currentColor" />
            Your Personal Navigation Intelligence
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl text-on-surface tracking-tight leading-tight">
            Stuck? Tell us what's going on — we'll show you what to do next.
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
            Describe your situation in plain words. Get multiple paths forward, explained simply. Calmly navigating your future with AI precision.
          </p>
          
          <div className="pt-8 flex flex-col items-center gap-6">
            <button 
              onClick={onGetUnstuck}
              className="group relative px-10 py-4 bg-primary-container text-[#050B14] font-display text-xl font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(244,162,97,0.3)]"
            >
              Get Unstuck →
            </button>
            
            <div className="flex items-center gap-4 text-slate-500 font-sans text-sm">
              <span className="flex items-center gap-1"><CheckCircle size={16} /> No account needed</span>
              <span className="h-4 w-[1px] bg-white/10"></span>
              <span className="flex items-center gap-1"><Lock size={16} /> Private & Secure</span>
            </div>
          </div>
        </motion.div>
        
        {/* Bento Preview Section */}
        <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-card glow-hover rounded-2xl p-8 transition-all duration-500 md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container">
                <Brain size={24} />
              </div>
              <span className="text-slate-500 text-sm font-sans">Logic Path A</span>
            </div>
            <h3 className="font-display text-2xl mb-2">Asymmetric Guidance</h3>
            <p className="text-on-surface-variant font-sans">Our AI doesn't just give one answer. It maps out three distinct paths—Safe, Bold, and Balanced—giving you the agency to choose your own destiny.</p>
          </div>
          
          <div className="glass-card glow-hover rounded-2xl p-8 transition-all duration-500">
            <div className="p-3 bg-secondary-container/10 rounded-xl text-secondary mb-6 inline-block">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-display text-2xl mb-2">Plain Language</h3>
            <p className="text-on-surface-variant font-sans">Complexity stripped away. We turn messy life problems into clear, actionable bullet points.</p>
          </div>
          
          <div className="glass-card glow-hover rounded-2xl p-8 transition-all duration-500">
            <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary mb-6 inline-block">
              <History size={24} />
            </div>
            <h3 className="font-display text-2xl mb-2">Path History</h3>
            <p className="text-on-surface-variant font-sans">Keep track of your decisions and see how far you've come on your journey to clarity.</p>
          </div>
          
          <div className="glass-card glow-hover rounded-2xl p-8 transition-all duration-500 md:col-span-2 relative overflow-hidden group">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
              alt="Digital Workspace"
            />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <h3 className="font-display text-2xl mb-2">Wise Navigation</h3>
              <p className="text-on-surface-variant font-sans">Built on a foundation of "Wise Navigator" philosophy—calm under pressure, modern in its intelligence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
