import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from './final logo2.png';
import BrandName from './BrandName';

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-4 mb-6 group">
            <img 
              src={logo} 
              alt="PawMitra" 
              className="h-20 w-auto object-contain group-hover:scale-105 transition-transform" 
              referrerPolicy="no-referrer"
            />
            <BrandName size="2xl" />
          </Link>
          <p className="text-stone-400 text-sm leading-relaxed">
            Connecting pet parents with verified local hosts for a trusted, home-like stay experience.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Platform</h4>
          <ul className="space-y-4 text-stone-400 text-sm">
            <li><Link to="/browse" className="hover:text-white transition-colors">Find a Host</Link></li>
            <li><Link to="/become-host" className="hover:text-white transition-colors">Become a Host</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6 text-white">Company</h4>
          <ul className="space-y-4 text-stone-400 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Connect</h4>
          <div className="flex gap-4 mb-6">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Facebook size={18} />
            </a>
          </div>
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <Mail size={16} />
            <span>hello@pawmitra.com</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/10 text-center text-stone-500 text-xs">
        © {new Date().getFullYear()} PawMitra. All rights reserved.
      </div>
    </footer>
  );
}
