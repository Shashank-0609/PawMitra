import React from 'react';
import { LayoutDashboard, Calendar, History, Star, TrendingUp, Users, MessageSquare, Check, X, Send, UserCircle, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
  const [view, setView] = React.useState<'owner' | 'host'>('owner');
  const [userName, setUserName] = React.useState('Amit');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeChat, setActiveChat] = React.useState<{ name: string; image: string } | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="pt-48 pb-20 bg-stone-50 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
          <div className="w-20 h-20 bg-beige rounded-3xl flex items-center justify-center mx-auto mb-8 text-navy">
            <LayoutDashboard size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Dashboard Locked</h1>
          <p className="text-stone-500 mb-10 leading-relaxed">
            Please login to view your dashboard, manage your pet stays, and track your hosting requests.
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="w-full btn-primary py-4"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="section-padding py-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome {userName}!</h1>
            <p className="text-stone-500">Manage your pet stays and hosting requests.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-200">
            <button 
              onClick={() => setView('owner')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'owner' ? 'bg-navy text-white shadow-md' : 'text-stone-500 hover:text-navy'}`}
            >
              Pet Owner
            </button>
            <button 
              onClick={() => setView('host')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'host' ? 'bg-navy text-white shadow-md' : 'text-stone-500 hover:text-navy'}`}
            >
              Host Dashboard
            </button>
          </div>
        </div>

        {view === 'owner' ? (
          <OwnerDashboard onMessageHost={(name, image) => setActiveChat({ name, image })} />
        ) : (
          <HostDashboard />
        )}
      </div>

      <AnimatePresence>
        {activeChat && (
          <ChatWindow 
            hostName={activeChat.name} 
            hostImage={activeChat.image} 
            onClose={() => setActiveChat(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface OwnerDashboardProps {
  onMessageHost: (name: string, image: string) => void;
}

function OwnerDashboard({ onMessageHost }: OwnerDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, label: 'Upcoming Stays', value: '1', color: 'bg-blue-50 text-blue-600' },
          { icon: History, label: 'Past Stays', value: '12', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Star, label: 'Reviews Given', value: '10', color: 'bg-amber-50 text-amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-stone-400 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Upcoming Bookings</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
              className="w-24 h-24 rounded-2xl object-cover"
              alt="Host"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="text-accent font-bold text-sm mb-1 uppercase">Stay with Priya Sharma</div>
              <h3 className="text-xl font-bold mb-2">March 15 - March 20, 2026</h3>
              <p className="text-stone-500">Pet: Bruno (Golden Retriever)</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => onMessageHost('Priya Sharma', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200')}
                className="btn-secondary py-2.5 px-6 text-sm flex-1 md:flex-none"
              >
                Message Host
              </button>
              <button 
                onClick={() => navigate('/profile/1')}
                className="btn-primary py-2.5 px-6 text-sm flex-1 md:flex-none"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Past Stays */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Past Stays</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-xl" />
                <div>
                  <div className="font-bold">Stay with Rahul Verma</div>
                  <div className="text-sm text-stone-400">Jan 10 - Jan 12, 2026</div>
                </div>
              </div>
              <button className="text-navy font-bold text-sm hover:underline">Leave a Review</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HostDashboard() {
  return (
    <div className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, label: 'Total Earnings', value: '₹14,500', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Users, label: 'Happy Pets Hosted', value: '24', color: 'bg-blue-50 text-blue-600' },
          { icon: Star, label: 'Average Rating', value: '4.9', color: 'bg-amber-50 text-amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-stone-400 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Requests */}
      <section>
        <h2 className="text-2xl font-bold mb-6">New Booking Requests</h2>
        <div className="space-y-4">
          {[1].map((i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300">
                <Users size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded">New Request</span>
                  <span className="text-stone-400 text-xs">2 hours ago</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Sonal M. wants to book a stay</h3>
                <p className="text-stone-500">Pet: Luna (Persian Cat) • March 25 - March 28</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:w-12 sm:h-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                    <X size={20} />
                  </button>
                  <button className="flex-1 sm:w-12 sm:h-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                    <Check size={20} />
                  </button>
                </div>
                <button className="btn-secondary py-3 px-6 text-sm w-full sm:w-auto">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-accent fill-accent" />
                ))}
              </div>
              <p className="text-stone-600 italic mb-4">"Amazing host! My dog was so well taken care of. Highly recommended!"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-stone-100 rounded-full" />
                <div className="text-sm font-bold text-navy">Karan J.</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
