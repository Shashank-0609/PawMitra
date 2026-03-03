import React from 'react';
import { Camera, Mail, MapPin, Calendar, History, Star, Settings, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [profilePic, setProfilePic] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState('Amit Kumar');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Overview');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    navigate('/auth');
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-48 pb-20 bg-stone-50 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
          <div className="w-20 h-20 bg-beige rounded-3xl flex items-center justify-center mx-auto mb-8 text-navy">
            <UserCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Profile Locked</h1>
          <p className="text-stone-500 mb-10 leading-relaxed">
            Please login to view your profile, manage your pets, and update your account settings.
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (activeTab) {
              case 'Overview':
                return (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                      <div className="space-y-6">
                        {[
                          { type: 'Booking', title: 'Stay request accepted by Priya Sharma', date: '2 hours ago', icon: CheckIcon },
                          { type: 'Review', title: 'You received a 5-star review from Rahul V.', date: 'Yesterday', icon: StarIcon },
                          { type: 'System', title: 'Profile verification completed', date: '3 days ago', icon: ShieldIcon }
                        ].map((activity, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0">
                              <activity.icon />
                            </div>
                            <div>
                              <p className="font-bold text-navy">{activity.title}</p>
                              <p className="text-stone-400 text-xs">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              case 'My Pets':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Bruno', breed: 'Golden Retriever', age: '3 years', weight: '28kg', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200' },
                      { name: 'Bella', breed: 'Persian Cat', age: '2 years', weight: '4kg', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200' }
                    ].map((pet, i) => (
                      <div key={i} className="p-6 border border-stone-100 rounded-2xl flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group relative overflow-hidden">
                        <div className="w-24 h-24 bg-stone-100 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                          <img src={pet.img} alt={pet.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-lg text-navy">{pet.name}</div>
                            <span className="text-[10px] font-bold uppercase bg-beige px-2 py-0.5 rounded text-navy/60">Active</span>
                          </div>
                          <div className="text-sm text-stone-400">{pet.breed}</div>
                          <div className="text-xs text-stone-400 mt-1">{pet.age} • {pet.weight}</div>
                          <div className="mt-3 flex gap-2">
                            <button className="text-[10px] font-bold text-navy hover:underline">Edit</button>
                            <button className="text-[10px] font-bold text-stone-400 hover:text-red-500 transition-colors">Medical Records</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="p-8 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-navy hover:text-navy hover:bg-stone-50 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">+</span>
                      </div>
                      <span className="font-bold">Add New Pet</span>
                    </button>
                  </div>
                );
              case 'Booking History':
                return (
                  <div className="space-y-4">
                    {[
                      { host: 'Priya Sharma', date: 'March 15 - 20, 2026', pet: 'Bruno', status: 'Upcoming', price: '₹4,500', location: 'Banjara Hills' },
                      { host: 'Rahul Verma', date: 'Jan 10 - 12, 2026', pet: 'Bruno', status: 'Completed', price: '₹1,800', location: 'Gachibowli' },
                      { host: 'Sneha Kapur', date: 'Dec 22 - 25, 2025', pet: 'Bella', status: 'Completed', price: '₹2,400', location: 'Jubilee Hills' }
                    ].map((booking, i) => (
                      <div key={i} className="p-6 border border-stone-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-beige rounded-2xl flex items-center justify-center text-navy font-bold text-xl shadow-sm">
                            {booking.host[0]}
                          </div>
                          <div>
                            <div className="font-bold text-navy">Stay with {booking.host}</div>
                            <div className="text-sm text-stone-400">{booking.date}</div>
                            <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                              <span className="bg-stone-100 px-1.5 py-0.5 rounded">Pet: {booking.pet}</span>
                              <span className="flex items-center gap-1"><MapPin size={10} /> {booking.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <div className="font-bold text-lg text-navy">{booking.price}</div>
                            <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded inline-block ${
                              booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {booking.status}
                            </div>
                          </div>
                          <button className="btn-secondary py-2 px-4 text-xs font-bold">View Receipt</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              case 'Reviews':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { from: 'Rahul Verma', rating: 5, comment: 'Amit is a great pet parent. Bruno was very well-behaved and a joy to host! Looking forward to having him again.', date: 'Jan 15, 2026', pet: 'Bruno' },
                      { from: 'Sneha Kapur', rating: 5, comment: 'Bella is such a sweet cat. Amit provided clear instructions and was very responsive throughout the stay.', date: 'Dec 28, 2025', pet: 'Bella' }
                    ].map((review, i) => (
                      <div key={i} className="p-6 border border-stone-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={14} className="text-accent fill-accent" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">For {review.pet}</span>
                        </div>
                        <p className="text-stone-600 italic mb-6 text-sm leading-relaxed">"{review.comment}"</p>
                        <div className="flex items-center justify-between border-t border-stone-50 pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-sm font-bold text-navy shadow-sm">{review.from[0]}</div>
                            <div>
                              <div className="text-sm font-bold text-navy">{review.from}</div>
                              <div className="text-[10px] text-stone-400 font-medium">{review.date}</div>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold text-navy hover:underline">Reply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="section-padding py-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center sticky top-40">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border-4 border-white shadow-md mx-auto">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Settings size={48} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              
              <h2 className="text-2xl font-bold mb-1">{userName}</h2>
              <p className="text-stone-400 text-sm mb-6">Pet Parent & Host</p>
              
              <div className="space-y-4 text-left border-t border-stone-50 pt-6">
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <Mail size={16} className="text-stone-400" />
                  <span>amit.k@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <MapPin size={16} className="text-stone-400" />
                  <span>Hyderabad, India</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="font-medium text-emerald-600">Verified Account</span>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-100 text-sm font-bold hover:bg-stone-50 transition-colors">
                  <Settings size={16} /> Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Pets Handled', value: '14', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Current Bookings', value: '2', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Reviews Received', value: '8', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100"
                >
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-stone-400 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Profile Tabs Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden min-h-[600px]">
              <div className="border-b border-stone-100">
                <div className="flex px-8 overflow-x-auto no-scrollbar">
                  {['Overview', 'My Pets', 'Booking History', 'Reviews'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-6 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-navy text-navy' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {renderTabContent()}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><ShieldCheck size={12} /></div>;
}

function StarIcon() {
  return <div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Star size={12} /></div>;
}

function ShieldIcon() {
  return <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><ShieldCheck size={12} /></div>;
}
