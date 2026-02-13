import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';


const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)' },
};

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      {/* Ambient Background */}
      <div className="bg-ambient" />
      <div className="bg-noise" />
      <div className="bg-grid absolute inset-0 opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen relative">
        {/* Mobile top bar offset */}
        <div className="lg:hidden h-14" />

        {/* Top fade gradient */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-dark-950/50 to-transparent z-0 lg:hidden" />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto relative z-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastContainer />
    </div>
  );
};

export default Layout;
