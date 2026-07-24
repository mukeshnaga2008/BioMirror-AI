import React from 'react';
import { Activity, Shield, Users, Target, Award, ArrowRight, Brain, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between text-gray-300">
      {/* background grid effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-cyan-950/40 px-8 flex items-center justify-between z-10 bg-[#030712]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#0077ff] flex items-center justify-center glow-border-cyan">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono font-bold tracking-widest text-white text-lg">BIOMIRROR AI</span>
        </div>
        <button 
          onClick={onEnter}
          className="px-5 py-2.5 bg-cyan-950/60 border border-cyan-400/30 hover:border-cyan-400 text-cyan-400 text-xs font-mono font-bold rounded-xl transition-all"
        >
          LAUNCH APPLICATION
        </button>
      </header>

      {/* Hero Section */}
      <main className="z-10 px-8 py-16 max-w-7xl mx-auto space-y-24">
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-400/20 text-[#00f2fe] text-xs font-mono rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> BioMirror OS v10.0 Online
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight">
            The Personal AI Health <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#0077ff] glow-text-cyan">Simulation Twin</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            See your health metrics in real-time, anticipate critical risks tomorrow, and securely collaborate with doctors through an interactive 3D digital model of your body.
          </p>
          <div className="pt-6">
            <button 
              onClick={onEnter}
              className="px-8 py-4 bg-gradient-to-r from-[#00f2fe] to-[#0077ff] hover:opacity-90 text-[#030712] font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 mx-auto btn-shimmer"
            >
              LAUNCH HEALTH ENGINE
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </section>

        {/* Vision, Mission, Problem Statements */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-400/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">The Problem</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Medical reports are static, complex PDFs full of numbers that patients cannot understand. This disconnect delays early preventative lifestyle interventions and creates clinical friction.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-400/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Our Vision</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We envision a world where clinical diagnoses are translated into an active visual narrative. Patients literally see their organs heal or flag alerts, putting prevention at the forefront.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-400/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Our Mission</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              To build a secure, zero-trust digital duplicate that maps personal biomarkers, models lifestyle projections, enables rapid doctor consultations, and offers emergency access.
            </p>
          </div>
        </section>

        {/* Developers Section */}
        <section className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-mono text-white tracking-wide">Meet the VITALSYNC Team</h2>
            <p className="text-xs text-gray-400">The engineers behind the BioMirror health duplicate framework.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {developers.map((dev) => (
              <div key={dev.name} className="glass-panel p-6 rounded-2xl text-center flex flex-col justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400/30 overflow-hidden bg-cyan-900/20 mb-4 mt-2">
                  <img src={dev.avatar} className="w-full h-full object-cover" alt={dev.name} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-mono text-white">{dev.name}</h4>
                  <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">{dev.role}</div>
                  <p className="text-[11px] text-gray-400/80 leading-relaxed pt-3 px-1">{dev.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-cyan-950/40 px-8 flex items-center justify-between text-xs text-gray-500 z-10 bg-[#030712]/30 backdrop-blur-md">
        <span>© {new Date().getFullYear()} BioMirror AI. All Rights Reserved.</span>
        <span>Powered by VITALSYNC</span>
      </footer>
    </div>
  );
};
export default LandingPage;
