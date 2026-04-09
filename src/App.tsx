import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import BecomeHost from './pages/BecomeHost';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/become-host" element={<BecomeHost />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-profile" element={<UserProfile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
