import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle2, ShieldCheck, MessageSquare, Calendar, ArrowLeft, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HOSTS_DATA } from '../constants/hostsData';
import BrandName from '../components/BrandName';
import ChatWindow from '../components/ChatWindow';

export default function Profile() {
  const { id } = useParams();
  const host = id ? HOSTS_DATA[id] : HOSTS_DATA['1'];

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice(diffDays > 0 ? diffDays * host.price : 0);
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, host.price]);

  if (!host) return <div className="pt-32 text-center">Host not found</div>;

  return (
    <div className="pt-32 pb-20">
      <div className="section-padding">
        <Link to="/browse" className="inline-flex items-center gap-2 text-stone-500 hover:text-navy mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Host Image */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl mb-8">
                <img 
                  src={host.images[0]} 
                  alt={host.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="hidden lg:block p-8 bg-stone-50 rounded-[2rem] border border-stone-100">
                <h3 className="text-lg font-bold mb-6">Verified Host</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-600">
                    <ShieldCheck size={20} className="text-navy" />
                    <span className="text-sm">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-sm">GHMC Certified</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <Calendar size={20} className="text-navy" />
                    <span className="text-sm">Joined {new Date().getFullYear() - 2}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Details */}
          <div className="lg:col-span-4">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-5xl font-bold mb-4">{host.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-stone-500">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-accent fill-accent" />
                    <span className="font-bold text-navy">{host.rating}</span>
                    <span>({host.reviewsCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{host.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex gap-3 md:hidden mb-8">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="flex-1 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} /> Chat
                </button>
                <button className="flex-1 btn-primary py-3">Book</button>
              </div>

              <section>
                <h2 className="text-2xl font-bold mb-4">About Me</h2>
                <p className="text-stone-600 text-lg leading-relaxed">{host.about}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Experience</h2>
                <p className="text-stone-600 text-lg leading-relaxed">{host.experience}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Home Environment</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {host.images.slice(1).map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      className="w-full h-56 object-cover rounded-2xl shadow-sm" 
                      alt="Home"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {host.amenities.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <button className="flex items-center gap-2 text-navy font-bold hover:text-accent transition-colors">
                    <PlusCircle size={18} /> Leave a Review
                  </button>
                </div>
                <div className="space-y-8">
                  {host.reviews.map((review, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div className="font-bold text-lg">{review.name}</div>
                        <div className="text-stone-400 text-sm">{review.date}</div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            size={16} 
                            className={starIdx < review.rating ? "text-accent fill-accent" : "text-stone-200"} 
                          />
                        ))}
                      </div>
                      <p className="text-stone-600 leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-stone-100">
              <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-navy">₹{host.price}</span>
                    <span className="text-stone-400 font-medium text-lg">/ day</span>
                  </div>
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">Starting Price</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                  <Star size={20} className="text-accent fill-accent" />
                  <span className="font-bold text-navy text-lg">{host.rating}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 focus-within:ring-2 focus-within:ring-navy/5 transition-all">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-2 tracking-wider">Check In</label>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-stone-400" />
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold border-none p-0 focus:ring-0 cursor-pointer text-navy" 
                      />
                    </div>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 focus-within:ring-2 focus-within:ring-navy/5 transition-all">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-2 tracking-wider">Check Out</label>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-stone-400" />
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold border-none p-0 focus:ring-0 cursor-pointer text-navy" 
                      />
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 focus-within:ring-2 focus-within:ring-navy/5 transition-all">
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-2 tracking-wider">Pet Type</label>
                  <select className="w-full bg-transparent text-sm font-bold border-none p-0 focus:ring-0 text-navy cursor-pointer appearance-none">
                    <option>Dog (Small - up to 10kg)</option>
                    <option>Dog (Medium - 10-25kg)</option>
                    <option>Dog (Large - 25kg+)</option>
                    <option>Cat (All breeds)</option>
                    <option>Other Small Pets</option>
                  </select>
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="mb-8 p-6 bg-navy/5 rounded-2xl border border-navy/10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-stone-500 font-medium">Total for {totalPrice / host.price} days</span>
                    <span className="text-2xl font-bold text-navy">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Includes all taxes & fees</span>
                    <span className="text-emerald-500 font-bold">No hidden costs</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button className="w-full btn-primary py-5 text-lg font-bold shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Request Booking
                </button>
                
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-4 rounded-2xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Message Host
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <p className="text-center text-stone-400 text-xs mb-6">You won't be charged until the host accepts</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} className="text-navy" />
                    </div>
                    <span><BrandName size="sm" /> Guarantee included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
                      <MessageSquare size={16} className="text-navy" />
                    </div>
                    <span>Quick response (usually within 1h)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow 
            hostName={host.name} 
            hostImage={host.images[0]} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
