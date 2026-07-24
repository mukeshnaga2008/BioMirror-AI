import React, { useState, useEffect } from 'react';
import { useHealthStore } from './store/healthStore';
import DigitalTwin from './components/DigitalTwin';
import LandingPage from './pages/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, User, Upload, Clock, Shield, Sliders, Settings, Info,
  AlertTriangle, Share2, CheckCircle2, Lock, Phone,
  ArrowRight, Search, Menu, Grid, FileSpreadsheet, Bell, Zap, Eye,
  RefreshCw, Check, X, ArrowLeft, Download, ShieldAlert,
  Calendar, Volume2, VolumeX, AlertOctagon, HelpCircle, EyeOff, Sparkles, HeartPulse
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_BASE = 'http://localhost:8000';

// Active Web Audio API alarm sound synthesizer
let audioCtx: AudioContext | null = null;
let oscNode: OscillatorNode | null = null;
let modulatorNode: OscillatorNode | null = null;

const playSirenSound = (active: boolean) => {
  if (active) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      
      oscNode = audioCtx.createOscillator();
      modulatorNode = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const modulatorGain = audioCtx.createGain();

      oscNode.type = 'sawtooth';
      oscNode.frequency.value = 600; // Carrier pitch

      modulatorNode.type = 'sine';
      modulatorNode.frequency.value = 2.0; // Modulation speed (Hz)
      modulatorGain.gain.value = 250; // Sweep depth (Hz)

      modulatorNode.connect(modulatorGain);
      modulatorGain.connect(oscNode.frequency);
      
      oscNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // safe volume

      oscNode.start();
      modulatorNode.start();
    } catch (e) {
      console.warn("AudioContext playback blocked or failed", e);
    }
  } else {
    if (audioCtx) {
      try {
        oscNode?.stop();
        modulatorNode?.stop();
        audioCtx.close();
      } catch (e) {}
      audioCtx = null;
      oscNode = null;
      modulatorNode = null;
    }
  }
};

export default function App() {
  const {
    currentScreen,
    setScreen,
    login,
    logout,
    user,
    organs,
    selectedOrgan,
    setSelectedOrgan,
    systemVisibility,
    toggleSystemVisibility,
    reports,
    uploadReport,
    ocrLogs,
    ocrProgress,
    extractedBiomarkers,
    healthScore,
    timelineEvents,
    doctorShares,
    createDoctorShare,
    revokeDoctorShare,
    emergencyModeActive,
    toggleEmergencyMode,
    simulationParams,
    simulatedScore,
    simulationActive,
    updateSimulationParam,
    runSimulation,
    resetSimulation,
    optimizedStrategies,
    optimizationRunning,
    runOptimizationEngine,
    notifications,
    markNotificationRead,
    theme,
    aiStyle,
    voiceEnabled,
    updateSettings,
    updateOnboardingUser,
    registerUser
  } = useHealthStore();

  // Local UI states
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dragActive, setDragActive] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [forgotPasswordNewPass, setForgotPasswordNewPass] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Doctor Share inputs
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docDuration, setDocDuration] = useState('24 Hours');
  const [docPermissions, setDocPermissions] = useState<string[]>(['AI Summary', 'Digital Twin', 'Laboratory Reports']);
  const [activeDoctorPreview, setActiveDoctorPreview] = useState(false);

  // Onboarding local forms
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardPassword, setOnboardPassword] = useState('');
  const [onboardAge, setOnboardAge] = useState(24);
  const [onboardHeight, setOnboardHeight] = useState(178);
  const [onboardWeight, setOnboardWeight] = useState(76);
  const [onboardGender, setOnboardGender] = useState('Male');
  const [onboardBlood, setOnboardBlood] = useState('O+');

  // SOS Scan Overlay Mock
  const [sosScanActive, setSosScanActive] = useState(false);

  // Handle siren audio toggle
  useEffect(() => {
    playSirenSound(emergencyModeActive);
    return () => playSirenSound(false);
  }, [emergencyModeActive]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadReport(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadReport(file);
    }
  };

  // Real API OTP Handlers
  const requestOtpFromApi = async (email: string, purpose: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      if (!response.ok) throw new Error("Failed to request verification token");
      const data = await response.json();
      setGeneratedOtp(data.simulatedOtp);
      alert(`[BIOMIRROR SYSTEM] Secure Verification token transmitted: ${data.simulatedOtp}`);
    } catch (e) {
      console.error(e);
      alert("Error initiating authentication pipeline. Running in local simulation mode.");
      const fallback = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallback);
      alert(`[BIOMIRROR LOCAL] Simulated OTP: ${fallback}`);
    }
  };

  const verifyOtpFromApi = async (email: string, enteredOtp: string, onSuccess: (token: string) => void) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp })
      });
      if (!response.ok) throw new Error("Invalid verification code");
      const data = await response.json();
      onSuccess(data.token);
    } catch (e) {
      console.error(e);
      if (enteredOtp === generatedOtp) {
        onSuccess(`mock_token_${Date.now()}`);
      } else {
        alert("Invalid verification code. Please request a new token.");
      }
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);
    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const triggerForgotPasswordReset = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          password: forgotPasswordNewPass,
          otp: forgotPasswordOtp
        })
      });
      if (!response.ok) throw new Error("Password reset failed");
      alert("Security credentials updated successfully.");
      setForgotPasswordOpen(false);
    } catch (e) {
      alert("Failed to reset password. Please check your recovery token.");
    }
  };

  // Asset paths
  const medmirrorOrb = '/medmirror_orb_1784908514244.jpg';
  const userAvatar = '/user_avatar_1784908530272.jpg';

  const trendData = [
    { name: 'Jan', score: 82 },
    { name: 'Feb', score: 84 },
    { name: 'Mar', score: 88 },
    { name: 'Apr', score: 87 },
    { name: 'May', score: 91 },
    { name: 'Jun', score: 90 },
    { name: 'Today', score: healthScore }
  ];

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  const renderPage = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <div className="min-h-screen flex flex-col md:flex-row relative bg-[#030712]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.02)_1px,transparent_1px)] bg-[size:35px_35px] opacity-[0.4]" />

            {/* Left Side: Upgraded 3D Anatomy Model (65%) */}
            <div className="w-full md:w-2/3 relative flex flex-col justify-between p-8 border-r border-cyan-950/40">
              {/* Floating Indicators */}
              <div className="absolute top-8 left-8 flex flex-col gap-3.5 z-10">
                <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono tracking-wider text-cyan-400">Digital Twin: <strong className="text-white">ONLINE</strong></span>
                </div>
                <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono tracking-wider text-cyan-400">Cardio Output: <strong className="text-white">95%</strong></span>
                </div>
              </div>

              {/* 3D Model View */}
              <div className="flex-1 flex items-center justify-center relative mt-16 md:mt-0">
                <div className="w-full h-full max-w-[500px] max-h-[500px]">
                  <DigitalTwin />
                </div>
              </div>

              {/* Hero branding */}
              <div className="z-10 bg-gradient-to-t from-[#030712] via-[#030712]/95 to-transparent pt-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Activity className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-wider text-white font-mono">BIOMIRROR AI</h1>
                </div>
                <p className="text-cyan-400/80 text-sm font-medium tracking-wide mt-2">
                  Interactive holographic duplicate tracking metabolic, skeletal, vascular, and neural parameters.
                </p>
              </div>
            </div>

            {/* Right Side: Welcome + Authentication (35%) */}
            <div className="w-full md:w-1/3 bg-[#030712] flex items-center justify-center p-6 md:p-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              {!otpSent ? (
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md glass-panel p-8 rounded-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-400/30 flex items-center justify-center mb-4">
                      <Lock className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide text-white">Enter Your Universe</h2>
                    <p className="text-xs text-gray-400/70 mt-1">BioMirror Health Operating System v11.0</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono tracking-wider text-cyan-400/80 mb-2 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@gmail.com" 
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 focus:border-cyan-400/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono tracking-wider text-cyan-400/80 mb-2 uppercase">Password</label>
                      <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 focus:border-cyan-400/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400/70 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-cyan-400 rounded" />
                        <span>Remember Me</span>
                      </label>
                      <button 
                        onClick={() => setForgotPasswordOpen(true)}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        if (loginEmail) {
                          setOtpSent(true);
                          requestOtpFromApi(loginEmail, 'login');
                        } else {
                          alert("Please enter your email address.");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#00f2fe] to-[#0077ff] hover:opacity-90 text-[#030712] font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 btn-shimmer"
                    >
                      BEGIN MY HEALTH JOURNEY
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cyan-950/40"></div></div>
                      <span className="relative bg-[#0d1326] px-3 text-xs text-gray-400/40 font-mono">OR</span>
                    </div>

                    <button 
                      onClick={() => setScreen('onboarding')}
                      className="w-full bg-[#0a0f1e]/60 border border-cyan-400/20 hover:border-cyan-400/50 text-cyan-400 font-semibold py-3.5 rounded-xl transition-all"
                    >
                      CREATE NEW DIGITAL TWIN
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full max-w-md glass-panel p-8 rounded-2xl relative"
                >
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-400/30 flex items-center justify-center mb-4">
                      <ShieldAlert className="w-7 h-7 text-[#00f2fe] animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide text-white">Enter Security Token</h2>
                    <p className="text-xs text-cyan-400/60 mt-1.5 font-mono">OTP Sent to {loginEmail}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between gap-2">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-12 h-14 bg-[#0a0f1e]/80 border border-cyan-950/50 focus:border-cyan-400/80 text-white rounded-xl text-center text-xl font-bold font-mono focus:outline-none transition-all"
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        const entered = otpCode.join('');
                        verifyOtpFromApi(loginEmail, entered, (token) => {
                          login(loginEmail, token);
                        });
                      }}
                      className="w-full bg-gradient-to-r from-emerald-400 to-[#00f2fe] hover:opacity-90 text-[#030712] font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                      VERIFY & DEPLOY DIGITAL TWIN
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="text-center text-xs text-gray-400/60">
                      Didn't receive code? <button onClick={() => requestOtpFromApi(loginEmail, 'login')} className="text-cyan-400 hover:underline">Resend OTP</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
              {forgotPasswordOpen && (
                <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-sm glass-panel p-6 rounded-2xl relative"
                  >
                    <button 
                      onClick={() => setForgotPasswordOpen(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-bold text-white font-mono mb-2">Reset Password</h3>
                    
                    <div className="space-y-3 mt-4">
                      <input 
                        type="email" 
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => requestOtpFromApi(forgotPasswordEmail, 'reset')}
                        className="w-full py-2 bg-cyan-950/50 hover:bg-cyan-950 border border-cyan-400/25 text-cyan-400 font-mono text-xs rounded-xl"
                      >
                        REQUEST OTP
                      </button>

                      <input 
                        type="text" 
                        value={forgotPasswordOtp}
                        onChange={(e) => setForgotPasswordOtp(e.target.value)}
                        placeholder="Verification Code"
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      />

                      <input 
                        type="password" 
                        value={forgotPasswordNewPass}
                        onChange={(e) => setForgotPasswordNewPass(e.target.value)}
                        placeholder="New Password"
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      />

                      <button 
                        onClick={triggerForgotPasswordReset}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-[#0077ff] text-[#030712] font-mono text-xs font-bold rounded-xl"
                      >
                        UPDATE CREDENTIALS
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'onboarding':
        return (
          <div className="min-h-screen flex flex-col md:flex-row relative bg-[#030712]">
            {/* Left Panel: Continuous Twin Render */}
            <div className="w-full md:w-2/3 bg-[#030712] relative flex flex-col justify-between p-8 border-r border-cyan-950/40">
              {/* Onboarding Live Status */}
              <div className="absolute top-8 left-8 z-10 w-72 glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">Live AI Twin Sync Status</h3>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span>Identity:</span>
                    <span className={onboardingStage > 2 ? "text-emerald-400" : "text-gray-500"}>
                      ● {onboardingStage > 2 ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vascular Matrix:</span>
                    <span className={onboardingStage > 3 ? "text-emerald-400" : "text-gray-500"}>
                      ● {onboardingStage > 3 ? "CALIBRATED" : "WAITING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organ Weight Parameters:</span>
                    <span className={onboardingStage > 4 ? "text-emerald-400" : "text-gray-500"}>
                      ● {onboardingStage > 4 ? "MAPPED" : "WAITING"}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-cyan-950/40 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full transition-all duration-500" 
                    style={{ width: onboardingStage === 1 ? '10%' : onboardingStage === 2 ? '30%' : onboardingStage === 3 ? '60%' : onboardingStage === 4 ? '85%' : '100%' }}
                  />
                </div>
              </div>

              {/* 3D Canvas */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-full max-w-[450px] max-h-[450px]">
                  <DigitalTwin />
                </div>
              </div>

              <div className="z-10">
                <h2 className="text-xl font-bold font-mono text-white">Biological Identity Matrix</h2>
                <p className="text-xs text-cyan-400/70 mt-1">Adjust sliders on the right to scale anatomical proportions dynamically in WebGL.</p>
              </div>
            </div>

            {/* Right Panel: Stepper forms */}
            <div className="w-full md:w-1/3 bg-[#030712] flex items-center justify-center p-6 md:p-8">
              <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative">
                <div className="flex justify-between items-center mb-6 border-b border-cyan-950/30 pb-4">
                  <span className="text-xs font-mono text-cyan-400">STEP {onboardingStage} OF 5</span>
                  <span className="text-xs text-gray-400/50">BioMirror Initialization</span>
                </div>

                {onboardingStage === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h3 className="text-xl font-bold text-white">Create Your Personal AI Health Twin</h3>
                    
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-mono text-cyan-400/80 mb-2 uppercase">Full Name</label>
                        <input 
                          type="text" 
                          value={onboardName}
                          onChange={(e) => setOnboardName(e.target.value)}
                          placeholder="Mukesh Kumar" 
                          className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-cyan-400/80 mb-2 uppercase">Email Address</label>
                        <input 
                          type="email" 
                          value={onboardEmail}
                          onChange={(e) => setOnboardEmail(e.target.value)}
                          placeholder="abc@gmail.com" 
                          className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-cyan-400/80 mb-2 uppercase">Setup Password</label>
                        <input 
                          type="password" 
                          value={onboardPassword}
                          onChange={(e) => setOnboardPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (onboardEmail && onboardName) {
                          setOnboardingStage(2);
                          requestOtpFromApi(onboardEmail, 'register');
                        } else {
                          alert("Please fill name and email.");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#00f2fe] to-[#0077ff] text-[#030712] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mt-6"
                    >
                      CONTINUE
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {onboardingStage === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h3 className="text-xl font-bold text-white">Email Verification</h3>
                    <p className="text-xs text-gray-400">For security, enter the 6-digit secure token sent to {onboardEmail}.</p>
                    
                    <div className="flex justify-between gap-1 py-4">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-10 h-12 bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl text-center text-lg font-mono focus:outline-none"
                        />
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setOnboardingStage(1)}
                        className="flex-1 bg-cyan-950/30 text-cyan-400 border border-cyan-400/20 py-3 rounded-xl"
                      >
                        BACK
                      </button>
                      <button 
                        onClick={() => {
                          const entered = otpCode.join('');
                          verifyOtpFromApi(onboardEmail, entered, () => {
                            setOnboardingStage(3);
                          });
                        }}
                        className="flex-1 bg-gradient-to-r from-[#00f2fe] to-[#0077ff] text-[#030712] font-semibold py-3 rounded-xl"
                      >
                        VERIFY
                      </button>
                    </div>
                  </motion.div>
                )}

                {onboardingStage === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h3 className="text-xl font-bold text-white">Physical Diagnostics</h3>
                    
                    <div className="space-y-5 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-cyan-400/80 mb-2 uppercase">Gender</label>
                          <select 
                            value={onboardGender}
                            onChange={(e) => {
                              setOnboardGender(e.target.value);
                              updateOnboardingUser({ gender: e.target.value });
                            }}
                            className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-cyan-400/80 mb-2 uppercase">Age</label>
                          <input 
                            type="number" 
                            value={onboardAge}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setOnboardAge(v);
                              updateOnboardingUser({ age: v });
                            }}
                            className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Premium Sliders */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                          <span>HEIGHT</span>
                          <span className="text-cyan-400 font-bold">{onboardHeight} cm</span>
                        </div>
                        <input 
                          type="range" min="120" max="220" 
                          value={onboardHeight}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setOnboardHeight(v);
                            updateOnboardingUser({ height: v });
                          }}
                          className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                          <span>WEIGHT</span>
                          <span className="text-cyan-400 font-bold">{onboardWeight} kg</span>
                        </div>
                        <input 
                          type="range" min="40" max="150" 
                          value={onboardWeight}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setOnboardWeight(v);
                            updateOnboardingUser({ weight: v });
                          }}
                          className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-cyan-400/80 mb-2 uppercase">Blood Group</label>
                        <select 
                          value={onboardBlood}
                          onChange={(e) => {
                            setOnboardBlood(e.target.value);
                            updateOnboardingUser({ bloodGroup: e.target.value });
                          }}
                          className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option>O+</option>
                          <option>A+</option>
                          <option>B+</option>
                          <option>AB+</option>
                          <option>O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setOnboardingStage(2)}
                        className="flex-1 bg-cyan-950/30 text-cyan-400 border border-cyan-400/20 py-3 rounded-xl"
                      >
                        BACK
                      </button>
                      <button 
                        onClick={() => {
                          updateOnboardingUser({
                            name: onboardName || 'Mukesh Kumar',
                            email: onboardEmail || 'mukesh@biomirror.ai',
                            gender: onboardGender,
                            age: onboardAge,
                            height: onboardHeight,
                            weight: onboardWeight,
                            bloodGroup: onboardBlood
                          });
                          setOnboardingStage(4);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#00f2fe] to-[#0077ff] text-[#030712] font-semibold py-3 rounded-xl"
                      >
                        SYNCHRONIZE
                      </button>
                    </div>
                  </motion.div>
                )}

                {onboardingStage === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h3 className="text-xl font-bold text-white">Initializing Health Core</h3>
                    
                    <div className="bg-[#050a18] rounded-xl p-4 border border-cyan-950/80 font-mono text-[10px] text-cyan-400/70 h-44 overflow-y-auto space-y-1.5 no-scrollbar">
                      <div>&gt; Loading medical dictionaries...</div>
                      <div>&gt; Mapping 3D skeletal bones...</div>
                      <div>&gt; Drawing neural blueprints...</div>
                      <div>&gt; Formatting arterial bloodlines...</div>
                      <div>&gt; Holographic Digital Twin generated.</div>
                    </div>

                    <button 
                      onClick={() => setOnboardingStage(5)}
                      className="w-full bg-gradient-to-r from-[#00f2fe] to-emerald-400 text-[#030712] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
                    >
                      FINALIZE ONBOARDING
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {onboardingStage === 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Digital Twin Created</h3>
                    
                    <button 
                      onClick={async () => {
                        await registerUser(onboardPassword);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#030712] font-extrabold py-4 rounded-xl shadow-lg mt-6"
                    >
                      ENTER MY DASHBOARD
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row relative">
            {/* Left Sidebar */}
            <div className="w-full md:w-20 lg:w-64 bg-[#050a18]/80 border-r border-cyan-950/40 p-4 flex flex-col justify-between z-20 shrink-0 backdrop-blur-md">
              <div className="space-y-8">
                {/* SVG Logo */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#0077ff] flex items-center justify-center glow-border-cyan">
                    <Activity className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="lg:block hidden text-left font-mono">
                    <span className="font-extrabold text-white tracking-widest text-sm">BIOMIRROR</span>
                    <span className="text-[9px] text-cyan-400 block font-bold tracking-widest uppercase">Health OS</span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Grid },
                    { id: 'twin_lab', label: 'Digital Twin Lab', icon: Activity },
                    { id: 'upload_report', label: 'Upload Report', icon: Upload },
                    { id: 'health_analysis', label: 'AI Health Analysis', icon: FileSpreadsheet },
                    { id: 'timeline', label: 'Health Timeline', icon: Clock },
                    { id: 'emergency_card', label: 'Emergency Card', icon: ShieldAlert },
                    { id: 'doctor_portal', label: 'Doctor Share', icon: Share2 },
                    { id: 'simulation', label: 'Health Simulation', icon: Sliders },
                    { id: 'profile', label: 'User Profile', icon: User },
                    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
                    { id: 'settings', label: 'Settings', icon: Settings },
                    { id: 'about', label: 'About', icon: Info }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (item.id === 'upload_report') setScreen('upload');
                          if (item.id === 'twin_lab') setScreen('twinLab');
                          if (item.id === 'timeline') setScreen('timeline');
                          if (item.id === 'emergency_card') setScreen('emergency');
                          if (item.id === 'doctor_portal') setScreen('doctor');
                          if (item.id === 'simulation') setScreen('simulation');
                          if (item.id === 'profile') setScreen('profile');
                          if (item.id === 'privacy') setScreen('privacy');
                          if (item.id === 'settings') setScreen('settings');
                          if (item.id === 'about') setScreen('about');
                        }}
                        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                          activeTab === item.id 
                            ? 'bg-cyan-950/40 text-[#00f2fe] border border-cyan-400/20' 
                            : 'text-gray-400 hover:text-white hover:bg-cyan-950/10'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="lg:block hidden">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Profile */}
              <div className="border-t border-cyan-950/40 pt-4 flex items-center gap-3 px-2 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-cyan-400/20 overflow-hidden bg-cyan-900/30">
                    <img src={userAvatar} className="w-full h-full object-cover" alt="User" />
                  </div>
                  <div className="lg:block hidden text-left overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{user.name}</div>
                    <div className="text-[10px] font-mono text-cyan-400/60 truncate">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="lg:block hidden text-[10px] font-mono text-red-400 hover:underline cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            </div>

            {/* Dashboard Content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              {/* Top Bar */}
              <div className="h-16 border-b border-cyan-950/40 px-6 flex items-center justify-between shrink-0 bg-[#030712]/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-400">Welcome back,</span>
                  <span className="text-sm font-bold text-white font-mono">{user.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-400/50 font-mono hidden md:block">
                    SYSTEM SYNCED: {new Date().toLocaleDateString()}
                  </div>
                  {/* Notifications */}
                  <div className="relative cursor-pointer" onClick={() => setScreen('notifications')}>
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/30 border border-cyan-950/80 flex items-center justify-center hover:border-cyan-400/30 transition-all">
                      <Bell className="w-4.5 h-4.5 text-cyan-400" />
                    </div>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Layout Grid */}
              <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Center Panel (Anatomy Twin) */}
                <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden" style={{ minHeight: '540px' }}>
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={() => setScreen('twinLab')}
                      className="px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-950 border border-cyan-400/20 text-xs font-mono text-cyan-400 rounded-lg flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Fullscreen Twin Lab
                    </button>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-bold font-mono text-white">ANATOMICAL HOLOGRAPHIC DUALITY</h2>
                    <p className="text-xs text-gray-400">Click individual organs directly to inspect mapped metabolic values.</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="w-full h-full max-w-[420px] max-h-[420px]">
                      <DigitalTwin />
                    </div>
                  </div>

                  {/* Organ items */}
                  <div className="grid grid-cols-3 gap-3 border-t border-cyan-950/30 pt-4">
                    {Object.values(organs).slice(0, 3).map((organ) => (
                      <div 
                        key={organ.name} 
                        onClick={() => {
                          setSelectedOrgan(organ.name.toLowerCase());
                          setScreen('health_analysis');
                        }}
                        className="p-3 bg-[#050a18]/50 border border-cyan-950/60 rounded-xl cursor-pointer hover:border-cyan-400/30 transition-all flex flex-col justify-between"
                      >
                        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{organ.name}</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className={`text-[10px] font-mono font-bold uppercase ${
                            organ.status === 'healthy' ? 'text-emerald-400' : 'text-amber-500'
                          }`}>{organ.status}</span>
                          <span className="text-sm font-mono font-bold text-white">{organ.healthScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                  {/* Score Ring */}
                  <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Global Health Index</h3>
                      <div className="text-4xl font-extrabold text-white mt-2 font-mono">{healthScore}<span className="text-sm font-normal text-cyan-400/50">/100</span></div>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded">EXCELLENT</span>
                    </div>

                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-cyan-950/60 fill-none" strokeWidth="6" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className="stroke-emerald-400 fill-none transition-all duration-500" 
                          strokeWidth="6" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - healthScore / 100)}
                        />
                      </svg>
                      <div className="absolute font-mono text-xs font-bold text-white">{healthScore}%</div>
                    </div>
                  </div>

                  {/* AI Insights Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" /> MedMirror AI Insights
                    </h3>
                    
                    <div className="p-3.5 bg-cyan-950/20 border border-cyan-400/10 rounded-xl">
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        "Your skeletal system reflects decreased calcitriol (Vitamin D3) production. High ALT indicates mild cellular processing strain."
                      </p>
                    </div>

                    <button 
                      onClick={() => setScreen('health_analysis')}
                      className="w-full py-2.5 bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-400/20 text-cyan-400 font-bold text-xs rounded-xl tracking-wider uppercase transition-all"
                    >
                      Open Deep-Dive Analysis
                    </button>
                  </div>
                </div>

                {/* Area Chart Trend */}
                <div className="col-span-1 xl:col-span-3 glass-panel rounded-2xl p-6">
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">Historical Wellness Delta Chart</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0077ff" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.05)" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                        <YAxis domain={[70, 100]} stroke="#6b7280" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', borderColor: 'rgba(0, 242, 254, 0.2)', color: '#fff' }} />
                        <Area type="monotone" dataKey="score" stroke="#00f2fe" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderAdditionalScreens = () => {
    switch (currentScreen) {
      case 'upload':
        return (
          <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row relative">
            <div className="w-full md:w-2/3 p-8 flex flex-col justify-between">
              <div>
                <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-6">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold font-mono text-white">Upload Your Medical Report</h1>
                <p className="text-xs text-gray-400 mt-1">We support standard laboratory blood panels, lipid, and thyroid files in PDF/Image formats.</p>
              </div>

              {/* Upload Drop Zone */}
              <div 
                onDragEnter={handleDrag} 
                onDragOver={handleDrag} 
                onDragLeave={handleDrag} 
                onDrop={handleDrop}
                className={`flex-1 my-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative ${
                  dragActive ? 'border-cyan-400 bg-cyan-950/10' : 'border-cyan-950/60 hover:border-cyan-400/40 bg-[#050a18]/40'
                }`}
              >
                <input type="file" id="file-uploader" onChange={handleFileSelect} className="hidden" accept=".pdf,image/*" />
                <label htmlFor="file-uploader" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-400/20 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Drag & Drop Your Medical Report</h3>
                  <p className="text-xs text-gray-400 mt-1">or click to browse files from your device</p>
                  <div className="mt-6 px-4 py-2 bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-400/30 text-cyan-400 text-xs font-mono rounded-lg">
                    SELECT REPORT
                  </div>
                </label>
              </div>
            </div>

            {/* AI Assistant panel */}
            <div className="w-full md:w-1/3 bg-[#050a18] border-l border-cyan-950/40 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <img src={medmirrorOrb} className="w-10 h-10 rounded-full border border-cyan-400/30" alt="MedMirror Orb" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">MedMirror AI</h3>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">● Assistant Core Online</span>
                  </div>
                </div>
                <div className="bg-[#030712] border border-cyan-950/50 rounded-xl p-4 text-xs text-gray-300 leading-relaxed">
                  "Hello Mukesh. Please upload a PDF or image of your laboratory panel. Our OCR model will read the values and update your Digital Twin instantly."
                </div>
              </div>

              <div className="pt-6 border-t border-cyan-950/30 text-[10px] text-gray-400/50 space-y-2">
                <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-cyan-400" /> End-to-End Encryption Enabled</div>
                <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> HIPAA-Compliant Data Sandboxing</div>
              </div>
            </div>
          </div>
        );

      case 'ocrProcessing':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-bold font-mono text-white">AI Medical Intelligence Pipeline</h1>
              <p className="text-xs text-gray-400 mt-1">Extracting biomarkers and compiling reference ranges in sandbox...</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1 items-center">
              {/* Left Log Terminal */}
              <div className="glass-panel rounded-2xl p-6 h-96 flex flex-col justify-between overflow-hidden">
                <span className="text-xs font-mono text-cyan-400">LIVE SYSTEM PIPELINE LOGS</span>
                <div className="flex-1 overflow-y-auto mt-4 space-y-1.5 font-mono text-[10px] text-cyan-400/80">
                  {ocrLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                  {ocrProgress < 100 && (
                    <div className="text-white animate-pulse">Running OCR processing step...</div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-cyan-950/30">
                  <div className="flex justify-between text-xs font-mono text-cyan-400 mb-1.5">
                    <span>Overall Extraction progress:</span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-cyan-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Right Twin Render */}
              <div className="glass-panel rounded-2xl p-6 h-96 flex flex-col justify-between items-center relative">
                <span className="text-xs font-mono text-cyan-400 self-start">DIGITAL TWIN MAPPING SYNCHRONIZATION</span>
                <div className="w-64 h-64 my-auto relative">
                  <DigitalTwin />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setScreen('health_analysis')} 
                disabled={ocrProgress < 100}
                className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  ocrProgress < 100 ? 'bg-cyan-950/25 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-400 to-[#00f2fe] text-[#030712]'
                }`}
              >
                PROCEED TO HEALTH ANALYSIS
              </button>
            </div>
          </div>
        );

      case 'health_analysis':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold font-mono text-white">AI Health Analysis</h1>
              </div>
              <div className="glass-panel px-4 py-2.5 rounded-xl text-right">
                <div className="text-[10px] font-mono text-gray-400">GIndex Score</div>
                <div className="text-xl font-bold text-white font-mono">{healthScore}/100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-stretch">
              {/* Left Panel */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[500px]">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Detected Lab Biomarkers</h3>
                <div className="space-y-2">
                  {extractedBiomarkers.map((bio) => (
                    <div 
                      key={bio.name} 
                      onClick={() => setSelectedOrgan(bio.organ)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedOrgan === bio.organ 
                          ? 'bg-cyan-950/40 border-cyan-400/40' 
                          : 'bg-[#050a18]/40 border-cyan-950/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{bio.name}</span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          bio.status === 'normal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                        }`}>{bio.status}</span>
                      </div>
                      <div className="flex justify-between items-baseline mt-2">
                        <span className="text-sm font-mono text-white font-bold">{bio.value} <span className="text-xs font-normal text-gray-400">{bio.unit}</span></span>
                        <span className="text-[10px] font-mono text-gray-400/70">Ref: {bio.referenceRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Panel */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between items-center relative">
                <span className="text-xs font-mono text-cyan-400 self-start">INTERACTIVE ORGAN FOCUS</span>
                <div className="w-64 h-64 my-auto">
                  <DigitalTwin />
                </div>
              </div>

              {/* Right Panel: Advanced Consultation Details */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Clinician Consultation Summary</h3>
                  {selectedOrgan && organs[selectedOrgan] ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-cyan-950/30">
                        <span className="text-sm font-bold text-white">{organs[selectedOrgan].name} Details</span>
                        <span className={`text-xs font-mono font-bold uppercase ${
                          organs[selectedOrgan].status === 'healthy' ? 'text-emerald-400' : 'text-amber-500'
                        }`}>{organs[selectedOrgan].status}</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase">Reasoning</div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{organs[selectedOrgan].reason}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#00f2fe] flex flex-col items-center justify-center h-44 text-center">
                      <Info className="w-8 h-8 text-cyan-500/50 mb-2" />
                      Select an organ to show detailed explainable metrics.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cyan-950/30 flex gap-3 text-xs">
                  <button 
                    onClick={() => {
                      if (selectedOrgan === 'bones') {
                        alert("Vitamin D3 (18 ng/mL) is below the recommended range of 30-100.\nActionable Plan:\n- Standard D3 supplementation: 2000 IU daily.\n- Walk in safe sun for 20 minutes daily.\n- Increase intake of dairy, eggs, and oily fish.");
                      } else if (selectedOrgan === 'liver') {
                        alert("ALT Enzyme (52 U/L) is slightly elevated.\nActionable Plan:\n- Limit processed sugars and dietary fats.\n- Ensure baseline hydration: 2.5L daily.\n- Repeat LFT profile panel in 30 days.");
                      } else {
                        alert("Biomarkers are within reference boundaries. Maintain daily baseline.");
                      }
                    }} 
                    className="flex-1 py-2.5 bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-400/20 text-[#00f2fe] rounded-lg text-center font-bold"
                  >
                    AI RECOMMENDATION
                  </button>
                  <button 
                    onClick={() => setScreen('twinLab')} 
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-[#0077ff] text-[#030712] rounded-lg text-center font-bold"
                  >
                    LABORATORY MODE
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'twinLab':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4 cursor-pointer">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold font-mono text-white">Digital Twin Laboratory</h1>
                <p className="text-xs text-gray-400 mt-1">Holographic 3D Anatomy Model. Inspect internal skeletal/vascular details.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    alert("Body Scan Complete.\nNo Critical Findings.\n3 Organs Require Monitoring: Bones, Liver, Immune System.");
                  }} 
                  className="px-4 py-2 bg-cyan-950/40 hover:bg-cyan-950 border border-[#00f2fe]/45 text-xs font-mono text-[#00f2fe] rounded-xl tracking-wider uppercase transition-all"
                >
                  RUN BODY SCAN
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 items-stretch">
              {/* Left Column: Systems Visibility Checks */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Human System Visibility</h3>
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { id: 'skeleton', label: 'Skeleton & Bones' },
                    { id: 'muscles', label: 'Muscle Shell' },
                    { id: 'bloodVessels', label: 'Blood Vessels' },
                    { id: 'nervousSystem', label: 'Nerves / Neural Network' },
                    { id: 'organs', label: 'Internal Organs' }
                  ].map((sys) => (
                    <label key={sys.id} className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={(systemVisibility as any)[sys.id]}
                        onChange={() => toggleSystemVisibility(sys.id as any)}
                        className="accent-cyan-400 w-4 h-4" 
                      />
                      <span>{sys.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Center Column: 3D Twin canvas (Span 2) */}
              <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-center items-center relative">
                <div className="w-full h-[400px]">
                  <DigitalTwin 
                    customVisibility={systemVisibility}
                  />
                </div>
              </div>

              {/* Right Column: AI Organ Metrics */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Organ Intelligence</h3>
                  {selectedOrgan && organs[selectedOrgan] ? (
                    <div className="space-y-4">
                      <div className="text-sm font-bold text-white">{organs[selectedOrgan].name}</div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-mono text-gray-400">Health Index:</span>
                        <span className="text-sm font-mono font-bold text-white">{organs[selectedOrgan].healthScore}%</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{organs[selectedOrgan].details}</p>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400/60 flex flex-col items-center justify-center h-44 text-center">
                      <Info className="w-6 h-6 text-cyan-500/30 mb-2" />
                      Select any organ in the 3D model to load detail metrics.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cyan-950/30">
                  <button onClick={() => setScreen('simulation')} className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-[#d4af37] text-[#030712] font-bold text-xs rounded-xl text-center">
                    SIMULATE HABIT CHANGE
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div>
              <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold font-mono text-white">Virtual Health Timeline Journey</h1>
            </div>

            {/* Virtual Node Connector Mapping Layout */}
            <div className="my-8 flex-1 glass-panel rounded-3xl p-8 relative flex flex-col justify-center overflow-x-auto min-h-[350px]">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(0,242,254,0.015)_1px,transparent_1px)] bg-[size:25px_25px]" />
              
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-gradient-to-r from-cyan-950 via-cyan-500 to-emerald-500 -translate-y-1/2 z-0" />
              
              <div className="flex justify-between items-center relative z-10 w-full min-w-[700px] px-8">
                {timelineEvents.map((event, idx) => (
                  <div key={event.id} className="flex flex-col items-center text-center space-y-4 max-w-[200px]">
                    <div className="text-xs font-mono text-cyan-400">{event.date}</div>
                    
                    <button 
                      onClick={() => alert(`Node Detail:\nTitle: ${event.title}\nHealth Index: ${event.score}\nDetail: ${event.details}`)}
                      className="w-14 h-14 rounded-full bg-[#050a18] border-2 border-cyan-400 flex items-center justify-center text-xl font-bold text-white hover:scale-110 hover:border-emerald-400 transition-all duration-300 glow-border-cyan"
                    >
                      {event.icon}
                    </button>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white leading-tight">{event.title}</div>
                      <div className="text-[10px] font-mono text-emerald-400">Score: {event.score}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Timeline Nodes Tracked: {timelineEvents.length}</span>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            {/* Grand SOS Card */}
            <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border-red-500/40 relative overflow-hidden shadow-2xl shadow-red-500/10">
              <div className="absolute top-0 right-0 w-44 h-44 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </button>
                  <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                    <ShieldAlert className="w-7 h-7 text-red-500 animate-pulse" /> Emergency Health Card
                  </h1>
                </div>
                <div className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                  emergencyModeActive ? 'bg-red-500/20 text-red-400' : 'bg-cyan-950/50 text-cyan-400'
                }`}>
                  SOS STATUS: {emergencyModeActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                {/* ID Details Card */}
                <div className="p-6 bg-[#050a18]/80 border border-red-500/10 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-red-500/10 pb-2">
                    <span className="text-[10px] font-mono text-red-400 font-bold tracking-widest">EMERGENCY PROFILE</span>
                    <span className="text-[10px] font-mono text-gray-500">ID: {user.bloodGroup}-{user.age}</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Patient:</span> <span className="text-white font-bold">{user.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Age:</span> <span className="text-white font-bold">{user.age} Yrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Blood Group:</span> <span className="text-red-400 font-bold font-mono">{user.bloodGroup}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Allergies:</span> <span className="text-white font-bold">{user.allergies?.join(', ') || 'None'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Emergency Contact:</span> <span className="text-white font-bold">{user.emergencyContact?.phone}</span></div>
                  </div>
                </div>

                {/* Real QR Code Generator using qrserver API */}
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-2xl border-4 border-red-500/40 glow-border-red">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${API_BASE}/api/v1/sos/report/sos-${user.email}`} 
                      className="w-36 h-36"
                      alt="Scannable SOS QR"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-400 mt-3 font-bold uppercase tracking-wider">Scannable QR Access Code</span>
                </div>
              </div>

              {/* SOS Activator Button */}
              <button 
                onClick={toggleEmergencyMode} 
                className={`w-full py-4 rounded-xl font-extrabold text-sm tracking-wider uppercase transition-all duration-300 mt-8 ${
                  emergencyModeActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:opacity-90'
                }`}
              >
                {emergencyModeActive ? 'SOS MODE ACTIVE - DEACTIVATE ACCESS' : 'ACTIVATE SOS EMERGENCY ACCESS'}
              </button>
            </div>

            {/* Active Preview */}
            {emergencyModeActive && (
              <div className="mt-8 p-6 glass-panel rounded-2xl max-w-xl text-center space-y-4">
                <h3 className="text-sm font-bold text-red-400 font-mono flex items-center justify-center gap-1.5">
                  <AlertOctagon className="w-5 h-5 animate-pulse" /> Active SOS Broadcast Link Preview
                </h3>
                <p className="text-xs text-gray-300">
                  Responders scanning the QR code will view:
                </p>
                <div className="bg-[#050a18] border border-red-500/20 p-4 rounded-xl text-left text-xs text-gray-400 space-y-2">
                  <div><strong>Patient:</strong> {user.name}</div>
                  <div><strong>Blood Group:</strong> {user.bloodGroup}</div>
                  <div><strong>Allergies:</strong> {user.allergies.join(', ')}</div>
                  <div><strong>Condition Alert:</strong> Low Vitamin D (18 ng/mL), Liver ALT enzyme monitoring.</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'doctor':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div>
              <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold font-mono text-white">Doctor Collaboration Portal</h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 my-8 flex-1 items-stretch">
              <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Generate Temporary Link</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-2">Physician Name</label>
                      <input 
                        type="text" 
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Dr. Sarah Smith" 
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-2">Specialty</label>
                      <input 
                        type="text" 
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        placeholder="Cardiologist" 
                        className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    if (!docName || !docEmail) {
                      alert("Please fill in physician details.");
                      return;
                    }
                    await createDoctorShare({
                      doctorName: docName,
                      specialty: docSpecialty,
                      email: docEmail,
                      permissions: docPermissions,
                      duration: docDuration
                    });
                    alert("Doctor share workspace link generated successfully.");
                  }}
                  className="w-full bg-gradient-to-r from-[#00f2fe] to-[#0077ff] text-[#030712] font-bold py-3.5 rounded-xl shadow-lg mt-6"
                >
                  GENERATE COLLABORATION WORKSPACE
                </button>
              </div>

              {/* Shared workspace status panel */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Active Shared Links</h3>
                  {doctorShares.length > 0 ? (
                    <div className="space-y-4">
                      {doctorShares.map((share) => (
                        <div key={share.id} className="p-4 bg-[#050a18]/60 border border-cyan-950/50 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{share.doctorName}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              share.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                            }`}>{share.status}</span>
                          </div>
                          
                          {share.status === 'active' && (
                            <div className="pt-2 flex gap-2">
                              <button 
                                onClick={() => setActiveDoctorPreview(true)}
                                className="px-3 py-1 bg-cyan-950 border border-cyan-400/20 text-[10px] font-mono text-cyan-400 rounded hover:bg-cyan-900/30"
                              >
                                View Portal Preview
                              </button>
                              <button 
                                onClick={() => revokeDoctorShare(share.id)}
                                className="px-3 py-1 bg-red-950/20 border border-red-500/20 text-[10px] font-mono text-red-400 rounded hover:bg-red-900/20"
                              >
                                Revoke Link
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400/50 text-center py-8">No active shared physician links.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor View Overlay Mock */}
            {activeDoctorPreview && (
              <div className="fixed inset-0 bg-[#030712]/95 z-50 p-8 flex flex-col justify-between overflow-y-auto">
                <div className="flex justify-between items-center border-b border-cyan-950/60 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">DOCTOR COLLABORATION PORTAL</span>
                    <h2 className="text-lg font-bold text-white font-mono mt-1">Patient Diagnostic Record: {user.name}</h2>
                  </div>
                  <button 
                    onClick={() => setActiveDoctorPreview(false)} 
                    className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400/20 hover:border-cyan-400 flex items-center justify-center text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-stretch">
                  <div className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-mono text-cyan-400 uppercase">AI Consultation Summary</h3>
                    <div className="p-3.5 bg-cyan-950/20 border border-cyan-400/10 rounded-lg text-xs leading-relaxed text-gray-300">
                      "Primary outlier: Vitamin D3 index is 18 ng/mL (Reference range &gt;30). Liver ALT enzymes are borderline (52 U/L). Recommendations generated for bone densitometry followups."
                    </div>
                  </div>
                  <div className="glass-panel p-6 rounded-xl flex items-center justify-center">
                    <div className="w-56 h-56">
                      <DigitalTwin />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <button onClick={() => setScreen('dashboard')} className="flex items-center gap-1.5 text-xs text-cyan-400/60 hover:text-cyan-400 font-mono mb-4 cursor-pointer">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" /> Health Simulation Studio
                </h1>
                <p className="text-xs text-gray-400 mt-1">Simulate changes or use the multi-objective Monte Carlo optimizer to find your optimal lifestyle strategy.</p>
              </div>
              <div className="glass-panel px-4 py-2.5 rounded-xl text-right border-amber-500/20">
                <div className="text-[10px] font-mono text-gray-400">Projected Health Score</div>
                <div className="text-xl font-bold text-amber-400 font-mono">{simulatedScore}/100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 items-stretch mb-6">
              {/* Left Column: Sliders */}
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Lifestyle Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                      <span>EXERCISE FREQUENCY</span>
                      <span className="text-white font-bold">{simulationParams.exercise} Days/Week</span>
                    </div>
                    <input 
                      type="range" min="0" max="7" 
                      value={simulationParams.exercise}
                      onChange={(e) => {
                        updateSimulationParam('exercise', Number(e.target.value));
                        runSimulation();
                      }}
                      className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                      <span>DAILY SLEEP DURATION</span>
                      <span className="text-white font-bold">{simulationParams.sleep} Hours/Night</span>
                    </div>
                    <input 
                      type="range" min="4" max="10" step="0.5"
                      value={simulationParams.sleep}
                      onChange={(e) => {
                        updateSimulationParam('sleep', Number(e.target.value));
                        runSimulation();
                      }}
                      className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                      <span>WATER INTAKE</span>
                      <span className="text-white font-bold">{simulationParams.water} Liters/Day</span>
                    </div>
                    <input 
                      type="range" min="1" max="4" step="0.2"
                      value={simulationParams.water}
                      onChange={(e) => {
                        updateSimulationParam('water', Number(e.target.value));
                        runSimulation();
                      }}
                      className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-cyan-400/80 mb-2 uppercase">Diet Quality</label>
                    <select
                      value={simulationParams.diet}
                      onChange={(e) => {
                        updateSimulationParam('diet', e.target.value);
                        runSimulation();
                      }}
                      className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="poor">Poor (High sugars/fats)</option>
                      <option value="average">Average (Mixed diet)</option>
                      <option value="clean">Clean (Whole foods, high protein)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-cyan-400/80 mb-2 uppercase">Stress Level</label>
                    <select
                      value={simulationParams.stress}
                      onChange={(e) => {
                        updateSimulationParam('stress', e.target.value);
                        runSimulation();
                      }}
                      className="w-full bg-[#0a0f1e]/80 border border-cyan-950/50 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="high">High Stress</option>
                      <option value="moderate">Moderate Stress</option>
                      <option value="low">Low Stress</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={resetSimulation} 
                  className="w-full py-2.5 bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-400/20 text-cyan-400 font-bold text-xs rounded-xl transition-all"
                >
                  RESET PARAMETERS
                </button>
              </div>

              {/* Center Column: Digital Twin Projection */}
              <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between items-center relative min-h-[400px]">
                <span className="text-xs font-mono text-cyan-400 self-start">FUTURE DIGITAL TWIN SIMULATION</span>
                <div className="w-full h-72 my-auto relative">
                  {simulationActive && (
                    <div className="absolute inset-0 bg-[#030712]/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                  )}
                  <DigitalTwin />
                </div>
              </div>

              {/* Right Column: AI Optimization Engine Control Deck */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-[#00f2fe] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> AI INTERVENTION OPTIMIZER
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Continuously simulates 1,000+ personalized combinations of lifestyle factors to find plans that balance liver recovery and bone density.
                  </p>

                  <button
                    onClick={runOptimizationEngine}
                    disabled={optimizationRunning}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 text-[#030712] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all btn-shimmer"
                  >
                    {optimizationRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        RUNNING Permutations...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        RUN MONTE CARLO AI OPTIMIZER
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 max-h-[320px] no-scrollbar">
                  {optimizationRunning ? (
                    <div className="space-y-2 py-4">
                      <div className="h-2 w-full bg-cyan-950 rounded overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full animate-pulse" style={{ width: '70%' }} />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/80 block text-center animate-pulse">Evaluating health risk deltas...</span>
                    </div>
                  ) : optimizedStrategies.length > 0 ? (
                    optimizedStrategies.map((strat: any) => (
                      <div 
                        key={strat.name}
                        className="p-3 bg-[#050a18]/60 border border-cyan-950/60 rounded-xl space-y-2.5 transition-all hover:border-cyan-400/30"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white block">{strat.name}</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold block">{strat.riskReduction}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400">{strat.score}%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">{strat.details}</p>
                        
                        <div className="flex justify-between items-center pt-1">
                          <div className="flex gap-1.5 text-[9px] font-mono text-gray-500">
                            <span>Ex: {strat.lifestyle.exercise}d</span>
                            <span>Sl: {strat.lifestyle.sleep}h</span>
                            <span>Wt: {strat.lifestyle.water}L</span>
                          </div>
                          <button
                            onClick={() => {
                              updateSimulationParam('exercise', strat.lifestyle.exercise);
                              updateSimulationParam('sleep', strat.lifestyle.sleep);
                              updateSimulationParam('water', strat.lifestyle.water);
                              updateSimulationParam('diet', strat.lifestyle.diet);
                              updateSimulationParam('stress', strat.lifestyle.stress);
                              runSimulation();
                              alert(`Interventions applied. Digital twin calibrated to: ${strat.name}`);
                            }}
                            className="px-2 py-1 bg-cyan-950/50 hover:bg-cyan-950 border border-cyan-400/30 text-[9px] font-mono text-cyan-400 rounded"
                          >
                            APPLY PLAN
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-500 text-center py-8">
                      Click the button above to run the multi-objective optimizer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-xl glass-panel p-8 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('dashboard')} className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400/20 flex items-center justify-center text-white mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-bold font-mono text-white">AI Health Intelligence Center</h1>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-3.5 items-start ${
                      n.read ? 'bg-[#050a18]/20 border-cyan-950/40 opacity-60' : 'bg-cyan-950/20 border-cyan-400/25'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{n.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('dashboard')} className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400/20 flex items-center justify-center text-white mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-bold font-mono text-white">User Profile & Health Identity</h1>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[#050a18]/40 border border-cyan-950/60 rounded-xl">
                  <img src={userAvatar} className="w-16 h-16 rounded-full border border-cyan-400/30 object-cover" alt="User" />
                  <div>
                    <div className="text-base font-bold text-white font-mono">{user.name}</div>
                    <div className="text-xs font-mono text-cyan-400">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#050a18]/50 border border-cyan-950/60 rounded-xl">
                    <span className="text-gray-500 block uppercase text-[9px]">Age</span>
                    <strong className="text-white mt-1 block text-sm">{user.age} Years</strong>
                  </div>
                  <div className="p-3 bg-[#050a18]/50 border border-cyan-950/60 rounded-xl">
                    <span className="text-gray-500 block uppercase text-[9px]">Blood Group</span>
                    <strong className="text-white mt-1 block text-sm">{user.bloodGroup}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden border-[#00f2fe]/20">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('dashboard')} className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400/20 flex items-center justify-center text-white mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-bold font-mono text-white">Privacy, Consent & Security Center</h1>
                </div>
              </div>

              <div className="space-y-6 text-xs font-mono">
                <div className="p-4 bg-[#050a18]/80 border border-cyan-950/60 rounded-2xl space-y-3">
                  <h4 className="font-bold text-white text-sm">Granular Consent Access</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-cyan-400" /> Allow report parser OCR engine</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('dashboard')} className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400/20 flex items-center justify-center text-white mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-bold font-mono text-white">Settings & AI Personalization</h1>
                </div>
              </div>

              <div className="space-y-6 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">INTERFACE COMPONENT THEME</label>
                    <select 
                      value={theme}
                      onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' })}
                      className="w-full bg-[#0a0f1e] border border-cyan-950 text-white rounded-lg p-2.5"
                    >
                      <option value="dark">Space Navy (Dark)</option>
                      <option value="light">Medical White (Light)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="min-h-screen bg-[#030712] p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('dashboard')} className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400/20 flex items-center justify-center text-white mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-bold font-mono text-white">About BioMirror AI Ecosystem</h1>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                <p>
                  BioMirror AI is a cutting-edge clinical simulation sandbox designed to bridge the gap between complex diagnostic documentation and patients' visual wellness.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,242,254,0.03)_1.5px,transparent_1.5px)] bg-[size:32px_32px] pointer-events-none opacity-[0.4]" />
      
      {['login', 'onboarding', 'dashboard'].includes(currentScreen) 
        ? renderPage() 
        : renderAdditionalScreens()}
    </div>
  );
}
