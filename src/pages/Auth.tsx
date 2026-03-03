import React from 'react';
import { Mail, Lock, ArrowRight, Github, Chrome, User, Phone, UserCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../components/final logo.png';
import BrandName from '../components/BrandName';

export default function Auth() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [role, setRole] = React.useState<'owner' | 'host'>('owner');
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = React.useState({
    name: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      if (!agreeToTerms) {
        alert("Please agree to the Terms and Conditions to continue.");
        return;
      }
      // Save name for dashboard
      localStorage.setItem('userName', formData.name || 'User');
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      // For demo, if logging in, we can just set a default or keep existing
      if (!localStorage.getItem('userName')) {
        localStorage.setItem('userName', 'Amit');
      }
      localStorage.setItem('isLoggedIn', 'true');
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pt-32 flex items-center justify-center bg-beige px-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <img 
            src={logo} 
            alt="PawMitra" 
            className="h-24 w-24 rounded-full object-contain p-2 bg-white mx-auto mb-6 shadow-2xl border-4 border-white" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-stone-500">
            {isLogin ? 'Login to manage your pet stays' : <span>Join the <BrandName size="sm" /> community today</span>}
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100">
          {!isLogin && (
            <div className="flex bg-stone-50 p-1 rounded-xl mb-8 border border-stone-100">
              <button 
                onClick={() => setRole('owner')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'owner' ? 'bg-white text-navy shadow-sm' : 'text-stone-400'}`}
              >
                Pet Owner
              </button>
              <button 
                onClick={() => setRole('host')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'host' ? 'bg-white text-navy shadow-sm' : 'text-stone-400'}`}
              >
                Host
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your display name" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Phone No:</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-400">{isLogin ? 'Password' : 'Create a Password'}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-400">Re-enter the Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="font-medium text-stone-600 cursor-pointer">
                    I agree to the <BrandName size="sm" /> Terms and Conditions
                  </label>
                  <Link to="/terms" className="ml-2 inline-flex items-center text-navy hover:text-accent transition-colors" title="View Terms and Conditions">
                    <Info size={14} />
                  </Link>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button className="text-xs font-bold text-navy hover:underline">Forgot Password?</button>
              </div>
            )}

            <button className="w-full btn-primary py-4 flex items-center justify-center gap-2">
              {isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-100">
            <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Or continue with</div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.open('https://accounts.google.com/signin', '_blank')}
                className="flex items-center justify-center gap-2 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Chrome size={18} /> <span className="text-sm font-medium">Google</span>
              </button>
              <button 
                onClick={() => window.open('https://github.com/login', '_blank')}
                className="flex items-center justify-center gap-2 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Github size={18} /> <span className="text-sm font-medium">Github</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-stone-500"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="font-bold text-navy hover:underline">{isLogin ? 'Sign Up' : 'Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
