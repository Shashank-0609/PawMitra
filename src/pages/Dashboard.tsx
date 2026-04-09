import React from 'react';
import { LayoutDashboard, Calendar, History, Star, TrendingUp, Users, MessageSquare, Check, X, Send, UserCircle, Minimize2, AlertCircle, Pencil, Save, MapPin, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from "@google/genai";

export default function Dashboard() {
  const [view, setView] = React.useState<'owner' | 'host'>('owner');
  const { user, isLoggedIn, loading } = useAuth();
  const [activeChat, setActiveChat] = React.useState<{ name: string; image: string } | null>(null);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="pt-48 pb-20 bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone-400 font-bold">Loading Dashboard...</div>
      </div>
    );
  }

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

  const userName = user?.displayName || 'User';

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [reviewsGiven, setReviewsGiven] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const stats = React.useMemo(() => ({
    upcoming: bookings.filter(b => b.status === 'accepted').length,
    past: bookings.filter(b => b.status === 'rejected').length,
    reviews: reviewsGiven.length
  }), [bookings, reviewsGiven]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'booking_requests'), 
      where('guestId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const myBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort in memory to avoid requiring a composite index
      myBookings.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setBookings(myBookings);
      setLoading(false);
    }, (error) => {
      console.error("OwnerDashboard bookings listener error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reviews'),
      where('ownerId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const myReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setReviewsGiven(myReviews);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, label: 'Upcoming Stays', value: stats.upcoming.toString(), color: 'bg-blue-50 text-blue-600' },
          { icon: History, label: 'Past Stays', value: stats.past.toString(), color: 'bg-emerald-50 text-emerald-600' },
          { icon: Star, label: 'Reviews Given', value: stats.reviews.toString(), color: 'bg-amber-50 text-amber-600' }
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
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100">
              <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-stone-400 font-bold">Loading Bookings...</p>
            </div>
          ) : bookings.filter(b => b.status === 'accepted').length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
              <Calendar className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-500 font-medium">No upcoming bookings yet.</p>
            </div>
          ) : (
            bookings.filter(b => b.status === 'accepted').map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300">
                    <UserCircle size={48} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-accent font-bold text-sm mb-1 uppercase">Stay with {booking.hostName}</div>
                    <h3 className="text-xl font-bold mb-2">{booking.dates}</h3>
                    <p className="text-stone-500">Pet: {booking.petName} • Status: <span className="text-emerald-500 font-bold uppercase">{booking.status}</span></p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => onMessageHost(booking.hostName, '')}
                      className="btn-secondary py-2.5 px-6 text-sm flex-1 md:flex-none"
                    >
                      Message Host
                    </button>
                    <button 
                      onClick={() => navigate(`/profile/${booking.hostId}`)}
                      className="btn-primary py-2.5 px-6 text-sm flex-1 md:flex-none"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Past Stays */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Past Stays</h2>
        <div className="space-y-4">
          {bookings.filter(b => b.status === 'rejected').length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-stone-200">
              <p className="text-stone-400 text-sm">No past stays yet.</p>
            </div>
          ) : (
            bookings.filter(b => b.status === 'rejected').map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-stone-400 line-through">Stay with {booking.hostName}</div>
                    <div className="text-sm text-stone-400">{booking.dates} • <span className="text-red-400 uppercase font-bold text-[10px]">{booking.status}</span></div>
                  </div>
                </div>
                <button className="text-stone-300 font-bold text-sm cursor-not-allowed">Leave a Review</button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function HostDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [hostProfile, setHostProfile] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = React.useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [loadingRequests, setLoadingRequests] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState<any>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const stats = React.useMemo(() => ({
    petsHandled: requests.filter(r => r.status === 'accepted').length,
    currentBookings: requests.filter(r => r.status === 'pending').length,
    reviewsReceived: reviews.length
  }), [requests, reviews]);

  React.useEffect(() => {
    if (!user) return;

    // Fetch Host Profile
    const hostQuery = query(
      collection(db, 'hosts'),
      where('userId', '==', user.uid)
    );
    
    const unsubHost = onSnapshot(hostQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setHostProfile(data);
        setEditForm(data);
      }
    });

    const q = query(
      collection(db, 'booking_requests'), 
      where('hostId', '==', user.uid)
    );
    const unsubRequests = onSnapshot(q, (snapshot) => {
      const myRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort in memory to avoid requiring a composite index
      myRequests.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setRequests(myRequests);
      setLoadingRequests(false);
    }, (error) => {
      console.error("HostDashboard requests listener error:", error);
      setLoadingRequests(false);
    });

    return () => {
      unsubHost();
      unsubRequests();
    };
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reviews'), 
      where('hostId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const myReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort in memory to avoid requiring a composite index
      myReviews.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setReviews(myReviews);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("HostDashboard reviews listener error:", error);
      }
    });

    return () => unsub();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostProfile || !editForm) return;

    setIsUpdating(true);
    try {
      const hostDocRef = doc(db, 'hosts', hostProfile.id);
      const updateData = {
        fullName: editForm.fullName,
        aboutMe: editForm.aboutMe,
        experience: editForm.experience,
        pricePerDay: Number(editForm.pricePerDay),
        location: editForm.location,
        petTypes: editForm.petTypes,
        amenities: editForm.amenities,
        updatedAt: serverTimestamp()
      };

      await updateDoc(hostDocRef, updateData);
      
      // Also update in users/files if it exists
      // This is more complex since we don't have the doc ID easily, 
      // but the main 'hosts' collection is what matters for the Browse page.
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Update Profile Error:", error);
      alert('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const generateAISummary = async (data: any, type: 'accept' | 'reject') => {
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this booking ${type === 'accept' ? 'acceptance' : 'rejection'}. 
        Host: ${user?.displayName}, Guest: ${data.userName}, Pet: ${data.petName} (${data.petBreed}), Dates: ${data.dates}.
        ${type === 'reject' ? `Reason for rejection: ${data.reason}` : ''}`,
      });
      const response = await model;
      return response.text || "No summary generated.";
    } catch (error) {
      console.error("AI Summary Error:", error);
      return "AI summary generation failed.";
    }
  };

  const handleAccept = async (request: any) => {
    if (!user) return;
    setIsProcessing(request.id);
    try {
      const aiSummary = await generateAISummary(request, 'accept');
      const bookingData = {
        status: 'accepted',
        aiSummary,
        acceptedAt: serverTimestamp()
      };

      // 1. Update Global Collection
      await updateDoc(doc(db, 'booking_requests', request.id), bookingData);

      // 2. Sync to Firestore (Subcollection for legacy/backup)
      await addDoc(collection(db, 'users', user.uid, 'booking_requests'), {
        ...request,
        ...bookingData
      });

      // 3. Sync to Owner's past_stays for review capability
      await addDoc(collection(db, 'users', request.guestId, 'past_stays'), {
        host: user.displayName || 'Host',
        hostId: user.uid,
        date: request.dates,
        pet: request.petName,
        status: 'Completed',
        price: request.totalPrice?.toString() || '',
        location: '',
        bookingId: request.id,
        createdAt: serverTimestamp()
      });

      alert('Booking accepted successfully!');
    } catch (error) {
      console.error("Accept Error:", error);
      alert('Failed to process acceptance.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!user || !rejectionModal || !rejectionReason) return;
    const request = requests.find(r => r.id === rejectionModal.id);
    if (!request) return;

    setIsProcessing(request.id);
    try {
      const aiSummary = await generateAISummary({ ...request, reason: rejectionReason }, 'reject');
      const rejectionData = {
        rejectionReason,
        status: 'rejected',
        aiSummary,
        rejectedAt: serverTimestamp()
      };

      // 1. Update Global Collection
      await updateDoc(doc(db, 'booking_requests', request.id), rejectionData);

      // 2. Sync to Firestore (Subcollection for legacy/backup)
      await addDoc(collection(db, 'users', user.uid, 'rejected_requests'), {
        ...request,
        ...rejectionData
      });

      setRejectionModal(null);
      setRejectionReason('');
      alert('Booking rejected successfully.');
    } catch (error) {
      console.error("Reject Error:", error);
      alert('Failed to process rejection.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Host Profile Card & Edit Button */}
      {hostProfile && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-lg shrink-0">
                <img 
                  src={hostProfile.profilePicUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'} 
                  alt={hostProfile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{hostProfile.fullName}</h2>
                    <div className="flex items-center gap-4 text-stone-500">
                      <div className="flex items-center gap-1">
                        <Star className="text-accent fill-accent" size={18} />
                        <span className="font-bold text-navy">{hostProfile.rating || 5.0}</span>
                        <span className="text-sm">({reviews.length} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={18} />
                        <span className="text-sm">{hostProfile.location}</span>
                      </div>
                    </div>
                  </div>
                  {hostProfile.isVerified && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center gap-2 px-6 py-3"
                    >
                      <Pencil size={18} /> Edit Profile
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-stone-400 mb-2">About Me</h4>
                    <p className="text-stone-600 line-clamp-3">{hostProfile.aboutMe}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-stone-400 mb-2">Pricing</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-navy">₹{hostProfile.pricePerDay}</span>
                      <span className="text-stone-500 text-sm">/ day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: History, label: 'Pets Handled', value: stats.petsHandled.toString(), color: 'bg-blue-50 text-blue-600' },
          { icon: Calendar, label: 'Current Bookings', value: stats.currentBookings.toString(), color: 'bg-emerald-50 text-emerald-600' },
          { icon: Star, label: 'Reviews Received', value: stats.reviewsReceived.toString(), color: 'bg-amber-50 text-amber-600' }
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
          {loadingRequests ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100">
              <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-stone-400 font-bold">Syncing Requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
              <Check className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-500 font-medium">No new booking requests at the moment.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {isProcessing === request.id && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-navy font-bold">
                      <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  </div>
                )}
                <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300">
                  <Users size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      request.status === 'pending' ? 'bg-blue-100 text-blue-600' : 
                      request.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {request.status === 'pending' ? 'New Request' : request.status}
                    </span>
                    <span className="text-stone-400 text-xs">
                      {request.createdAt?.toDate ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{request.guestName || request.userName} wants to book a stay</h3>
                  <p className="text-stone-500">Pet: {request.petName} ({request.petBreed}) • {request.dates}</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => setRejectionModal({ id: request.id, name: request.userName })}
                        className="flex-1 sm:w-12 sm:h-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        onClick={() => handleAccept(request)}
                        className="flex-1 sm:w-12 sm:h-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2 rounded-xl font-bold text-sm uppercase ${
                      request.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {request.status}
                    </div>
                  )}
                  <button className="btn-secondary py-3 px-6 text-sm w-full sm:w-auto">View Profile</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center">Reject Request?</h2>
              <p className="text-stone-500 mb-8 text-center leading-relaxed">
                Please provide a reason for rejecting the booking request from <strong>{rejectionModal.name}</strong>.
              </p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. I'm unavailable during these dates..."
                className="w-full h-32 p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-navy/10 resize-none text-sm mb-6"
              />

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleReject}
                  disabled={!rejectionReason || isProcessing !== null}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </button>
                <button 
                  onClick={() => {
                    setRejectionModal(null);
                    setRejectionReason('');
                  }}
                  className="w-full py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 md:p-12 shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Edit Host Profile</h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Price per Day (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={editForm.pricePerDay}
                      onChange={(e) => setEditForm({...editForm, pricePerDay: e.target.value})}
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Location</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">About Me</label>
                  <textarea 
                    required
                    value={editForm.aboutMe}
                    onChange={(e) => setEditForm({...editForm, aboutMe: e.target.value})}
                    rows={4}
                    className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Experience</label>
                  <textarea 
                    required
                    value={editForm.experience}
                    onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                    rows={4}
                    className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Pet Types</label>
                  <div className="flex flex-wrap gap-3">
                    {['Dog', 'Cat', 'Bird', 'Rabbit'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={editForm.petTypes.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked 
                              ? [...editForm.petTypes, type]
                              : editForm.petTypes.filter((t: string) => t !== type);
                            setEditForm({...editForm, petTypes: newTypes});
                          }}
                          className="w-5 h-5 rounded border-stone-300 text-navy focus:ring-navy"
                        />
                        <span className="text-sm text-stone-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-4 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-colors shadow-lg shadow-navy/20 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Save size={20} /> Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recent Reviews */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
            <Star className="mx-auto text-stone-300 mb-4" size={48} />
            <p className="text-stone-500 font-medium">No reviews received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < review.rating ? "text-accent fill-accent" : "text-stone-200"} 
                    />
                  ))}
                </div>
                <p className="text-stone-600 italic mb-4">"{review.reviewText}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-full overflow-hidden">
                    {review.ownerPhotoURL ? (
                      <img src={review.ownerPhotoURL} alt={review.ownerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <UserCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-navy">{review.ownerName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
