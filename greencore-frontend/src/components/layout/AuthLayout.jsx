import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import ToastContainer from '../ui/Toast';



const AuthLayout = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark-950 overflow-hidden">
      {/* Aurora Background */}
      <div className="bg-aurora" />
      <div className="bg-noise" />
      <div className="bg-grid absolute inset-0 opacity-40" />

      {/* Floating Particles */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />

      {/* Parallax Orbs */}
      <motion.div
        animate={{
          y: [-25, 25, -25],
          x: [-10, 10, -10],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-24 w-72 h-72 rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{
          y: [20, -30, 20],
          x: [15, -5, 15],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{
          y: [-15, 20, -15],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-2/3 left-1/3 w-56 h-56 rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <div className="relative">
            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-2xl border-2 border-aurea-500/30"
            />
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className="absolute inset-0 rounded-2xl border border-aurea-500/20"
            />
            <motion.div
              animate={{ rotate: [0, 5, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative p-4 rounded-2xl bg-aurea-500/10 border border-aurea-500/20 glow-breathe"
            >
              <Leaf className="w-9 h-9 text-aurea-400" />
            </motion.div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-dark-100 tracking-tight">
              Green Core{' '}
              <span className="text-gradient text-glow">AUREA</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.15em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[10px] font-mono text-dark-500 mt-2 uppercase"
            >
              Energy Management Platform
            </motion.p>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong rounded-3xl p-7 sm:p-9 shadow-2xl glow-border"
        >
          <Outlet />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 space-y-1"
        >
          <p className="text-[11px] text-dark-600">
            &copy; {new Date().getFullYear()} Green Core AUREA
          </p>
          <p className="text-[10px] text-dark-700">
            Powered by renewable energy data
          </p>
        </motion.div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AuthLayout;
