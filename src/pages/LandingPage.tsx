import React from 'react';
import { Activity, Shield, Users, Target, Award, ArrowRight, Brain, Zap, Cpu, FileSpreadsheet, Lock } from 'lucide-react';

interface Developer {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

const developers: Developer[] = [
  {
    name: "MUKESH M",
    role: "System Architect & AI Engineer",
    avatar: "/user_avatar_1784908530272.jpg",
    bio: "Specializes in WebGL neural twins, medical entity extraction models, and secure audit architecture."
  },
  {
    name: "MUGIL P S",
    role: "Lead 3D & Graphics Developer",
    avatar: "/user_avatar_1784908530272.jpg",
    bio: "Designs low-latency Three.js skeleton rigs, vector line shading, and horizontal holographic orbits."
  },
  {
    name: "MEGHA G",
    role: "Clinical Data Analyst",
    avatar: "/user_avatar_1784908530272.jpg",
    bio: "Orchestrates reference range calibrations, disease mapping indices, and diagnostic pipelines."
  },
  {
    name: "PRABAVATHI D",
    role: "Security & Consent Engineer",
    avatar: "/user_avatar_1784908530272.jpg",
    bio: "Builds emergency SOS protocols, temporary QR auth links, and patient confidentiality firewalls."
  }
];

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen grand-hologram-bg relative overflow-hidden flex flex-col justify-between text-gray-300 font-sans">
      {/* background grid effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.015)_1px,transparent_1px)] bg-[size:45px_45px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-cyan-950/30 px-8 flex items-center justify-between z-10 bg-[#030712]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0077ff] flex items-center justify-center glow-border-cyan">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-mono font-bold tracking-widest text-white text-lg">BIOMIRROR AI</span>
        </div>
        <button 
          onClick={onEnter}
          className="px-6 py-2.5 bg-cyan-950/60 border border-cyan-400/30 hover:border-cyan-400 text-cyan-400 text-xs font-mono font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/5 cursor-pointer"
        >
          LAUNCH APPLICATION
        </button>
      </header>

      {/* Main Content */}
      <main className="z-10 px-6 py-16 max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-950/40 border border-cyan-400/20 text-[#00f2fe] text-[10px] font-mono rounded-full uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> BioMirror Health Operating System v11.0
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight font-sans">
            The World's Most Advanced <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#0077ff] glow-text-cyan">AI Medical Digital Twin</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            See your body in real-time, predict chronic metabolic risks, and simulate thousands of lifestyle interventions dynamically using a photorealistic, clinical-grade 3D duplicate.
          </p>
          <div className="pt-6">
            <button 
              onClick={onEnter}
              className="px-8 py-4 bg-gradient-to-r from-[#00f2fe] to-[#0077ff] hover:opacity-95 text-[#030712] font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 mx-auto btn-shimmer cursor-pointer"
            >
              LAUNCH HEALTH CORE
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </section>

        {/* Project Details Section (Top to Bottom Explanation) */}
        <section className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-wide uppercase">Core Architecture & Capabilities</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              BioMirror AI aggregates biometric parameters, clinical laboratory PDF reports, and real-time inputs to model and simulate personal health outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-cyan-950/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-400/20 flex items-center justify-center">
                <Brain className="w-5.5 h-5.5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">3D Anatomical Twin</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Renders a glowing 3D crystal surface mapping the skeleton, muscles, arterial circulation, neural networks, and internal organ textures loaded directly from clinical assets.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan-950/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-400/20 flex items-center justify-center">
                <Cpu className="w-5.5 h-5.5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Simulation Engine</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Runs a dynamic Monte Carlo simulator testing 1,000+ combinations of sleep, nutrition, water intake, and physical activity to identify the optimal long-term strategy.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan-950/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-400/20 flex items-center justify-center">
                <FileSpreadsheet className="w-5.5 h-5.5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Lab Report Extraction</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Extracts data from blood panels, metabolic markers, and organ health scores, highlighting abnormal indices with red and amber volumetric glows.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan-950/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-400/20 flex items-center justify-center">
                <Lock className="w-5.5 h-5.5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Zero-Trust Security</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Protects user medical details with cryptographic signature tokens, customizable permission durations, and temporary QR credentials for emergency consultations.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-12 pt-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-wide uppercase">Meet the VITALSYNC Team</h2>
            <p className="text-xs text-gray-400">The software engineers behind the BioMirror health duplicate framework.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {developers.map((dev) => (
              <div key={dev.name} className="glass-panel p-6 rounded-2xl text-center flex flex-col justify-between items-center relative overflow-hidden group hover:border-[#00f2fe]/40 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />
                <div className="w-32 h-32 rounded-full border-2 border-cyan-400/20 overflow-hidden bg-cyan-900/10 mb-6 mt-4 relative glow-border-cyan group-hover:border-cyan-400 transition-all duration-300">
                  <img src={dev.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={dev.name} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold font-mono text-white">{dev.name}</h4>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">{dev.role}</div>
                  <p className="text-xs text-gray-400 leading-relaxed pt-3 px-2 border-t border-cyan-950/40">{dev.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-20 border-t border-cyan-950/30 px-8 flex items-center justify-between text-xs text-gray-500 z-10 bg-[#030712]/40 backdrop-blur-md">
        <span>© {new Date().getFullYear()} BioMirror AI. All Rights Reserved.</span>
        <span className="font-mono text-cyan-400/80">POWERED BY VITALSYNC</span>
      </footer>
    </div>
  );
};

export default LandingPage;
