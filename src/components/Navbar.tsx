import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from './final logo2.png';
import BrandName from './BrandName';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-28 lg:h-32 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
          <img 
            src={logo} 
            alt="PawMitra" 
            className="h-12 md:h-16 lg:h-24 w-auto object-contain group-hover:scale-105 transition-transform" 
            referrerPolicy="no-referrer"
          />
          <BrandName size="2xl" className="md:text-3xl lg:text-4xl" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/" className="text-xs lg:text-sm font-medium hover:text-accent transition-colors">Home</Link>
          <Link to="/browse" className="text-xs lg:text-sm font-medium hover:text-accent transition-colors">Find a Host</Link>
          <Link to="/become-host" className="text-xs lg:text-sm font-medium hover:text-accent transition-colors">Become a Host</Link>
          <Link to="/dashboard" className="text-xs lg:text-sm font-medium hover:text-accent transition-colors">Dashboard</Link>
          <Link to="/my-profile" className="text-xs lg:text-sm font-medium hover:text-accent transition-colors">Profile</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn-secondary py-1.5 lg:py-2 px-3 lg:px-5 text-xs lg:text-sm">Logout</button>
          ) : (
            <Link to="/auth" className="btn-primary py-1.5 lg:py-2 px-3 lg:px-5 text-xs lg:text-sm">Login</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-navy" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 md:top-28 left-0 right-0 bg-white border-b border-stone-100 p-6 flex flex-col gap-4 shadow-xl"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
            <Link to="/browse" onClick={() => setIsOpen(false)} className="text-lg font-medium">Find a Host</Link>
            <Link to="/become-host" onClick={() => setIsOpen(false)} className="text-lg font-medium">Become a Host</Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium">Dashboard</Link>
            <Link to="/my-profile" onClick={() => setIsOpen(false)} className="text-lg font-medium">Profile</Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="btn-secondary text-center">Logout</button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)} className="btn-primary text-center">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
