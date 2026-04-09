import React from 'react';
import { Camera, Mail, MapPin, Calendar, History, Star, Settings, LogOut, ShieldCheck, UserCircle, Save, Trash2, X, PlusCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { signOut, deleteUser, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, onSnapshot, query, serverTimestamp, setDoc, where, orderBy } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import MedicalRecords from '../components/MedicalRecords';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  photoURL: string;
  photoFileName?: string;
  createdAt?: any;
}

interface PastStay {
  id: string;
  host: string;
  hostId?: string;
  date: string;
  pet: string;
  status: 'Upcoming' | 'Completed';
  price: string;
  location: string;
  reviewId?: string;
}

export default function UserProfile() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [userData, setUserData] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<any>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');
  const [viewingMedicalRecordsFor, setViewingMedicalRecordsFor] = React.useState<string | null>(null);
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [pastStays, setPastStays] = React.useState<PastStay[]>([]);
  const [isAddingStay, setIsAddingStay] = React.useState(false);
  const [newStay, setNewStay] = React.useState({
    host: '',
    date: '',
    pet: '',
    location: '',
    price: ''
  });
  const [isReviewingStay, setIsReviewingStay] = React.useState<PastStay | null>(null);
  const [reviewText, setReviewText] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [isSavingStay, setIsSavingStay] = React.useState(false);
  
  const [isAddingPet, setIsAddingPet] = React.useState(false);
  const [newPet, setNewPet] = React.useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    photoURL: ''
  });
  const [petImageFile, setPetImageFile] = React.useState<File | null>(null);
  const [petImagePreview, setPetImagePreview] = React.useState<string | null>(null);
  const [isSavingPet, setIsSavingPet] = React.useState(false);
  const [hostRequests, setHostRequests] = React.useState<any[]>([]);
  const [hostReviews, setHostReviews] = React.useState<any[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const petImageInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setEditData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'pets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pet[];
      setPets(petsData);
    }, (error) => {
      console.error("UserProfile pets listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'past_stays'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staysData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PastStay[];
      setPastStays(staysData);
    }, (error) => {
      console.error("UserProfile pastStays listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'booking_requests'),
      where('hostId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHostRequests(requestsData);
    }, (error) => {
      console.error("UserProfile hostRequests listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reviews'),
      where('hostId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid requiring a composite index
      (reviewsData as any[]).sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setHostReviews(reviewsData);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("UserProfile hostReviews listener error:", error);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const hostStats = React.useMemo(() => ({
    petsHandled: hostRequests.filter(r => r.status === 'accepted').length,
    currentBookings: hostRequests.filter(r => r.status === 'pending').length,
    reviewsReceived: hostReviews.length
  }), [hostRequests, hostReviews]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: editData.name,
        fullName: editData.fullName,
        phone: editData.phone,
        location: editData.location || ''
      });
      
      await updateProfile(user, {
        displayName: editData.name
      });

      setUserData({ ...userData, ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteError('');
    try {
      // 1. Delete Firestore document
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 2. Delete profile pic from storage if exists
      if (userData?.photoFileName) {
        try {
          const storageRef = ref(storage, `profile_pics/${userData.photoFileName}`);
          await deleteObject(storageRef);
        } catch (e) {
          console.error('Error deleting storage file:', e);
        }
      }

      // 3. Delete Auth user
      await deleteUser(user);
      
      navigate('/auth');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError('Please log out and log back in to delete your account for security reasons.');
      } else {
        setDeleteError(error.message);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsSaving(true);
        try {
          const storageRef = ref(storage, `profile_pics/${user.uid}_${Date.now()}.jpg`);
          await uploadString(storageRef, base64, 'data_url');
          const photoURL = await getDownloadURL(storageRef);
          
          // Update Firestore
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            photoURL,
            photoFileName: storageRef.name
          });

          // Update Auth
          await updateProfile(user, { photoURL });

          setUserData({ ...userData, photoURL, photoFileName: storageRef.name });
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setIsSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPetImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePet = async () => {
    if (!user || !newPet.name || !newPet.breed || !newPet.age || !newPet.weight) {
      alert('Please fill in all pet details.');
      return;
    }

    setIsSavingPet(true);
    try {
      let photoURL = '';
      let photoFileName = '';

      if (petImagePreview) {
        const storageRef = ref(storage, `pet_pics/${user.uid}_${Date.now()}.jpg`);
        await uploadString(storageRef, petImagePreview, 'data_url');
        photoURL = await getDownloadURL(storageRef);
        photoFileName = storageRef.name;
      }

      await addDoc(collection(db, 'users', user.uid, 'pets'), {
        ...newPet,
        photoURL,
        photoFileName,
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewPet({ name: '', breed: '', age: '', weight: '', photoURL: '' });
      setPetImageFile(null);
      setPetImagePreview(null);
      setIsAddingPet(false);
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Failed to save pet details.');
    } finally {
      setIsSavingPet(false);
    }
  };

  const handleDeletePet = async (pet: Pet) => {
    if (!user || !window.confirm(`Are you sure you want to remove ${pet.name}?`)) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pets', pet.id));
      if (pet.photoFileName) {
        try {
          const storageRef = ref(storage, `pet_pics/${pet.photoFileName}`);
          await deleteObject(storageRef);
        } catch (e) {
          console.error('Error deleting pet photo:', e);
        }
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet.');
    }
  };

  const handleSaveStay = async () => {
    if (!user || !newStay.host || !newStay.date || !newStay.pet) {
      alert('Please fill in host name, date, and pet.');
      return;
    }

    setIsSavingStay(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'past_stays'), {
        ...newStay,
        status: 'Completed',
        createdAt: serverTimestamp()
      });
      setNewStay({ host: '', date: '', pet: '', location: '', price: '' });
      setIsAddingStay(false);
    } catch (error) {
      console.error('Error saving stay:', error);
      alert('Failed to save stay.');
    } finally {
      setIsSavingStay(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !isReviewingStay || !reviewText) return;

    setIsSubmittingReview(true);
    try {
      // 1. Generate AI Summary
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this pet owner's review of a host. Review: "${reviewText}"`,
      });
      const aiSummary = (await model).text || "No summary generated.";

      // 2. Upload review to Storage
      const reviewBlob = new Blob([reviewText], { type: 'text/plain' });
      const fileName = `review_${isReviewingStay.id}_${Date.now()}.txt`;
      const storageRef = ref(storage, `review_for_hosts/${user.uid}/${fileName}`);
      
      // Convert blob to base64 for uploadString or use uploadBytes
      // Since we have uploadString imported, let's use it with a reader
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(reviewBlob);
      });
      const base64 = await base64Promise;
      await uploadString(storageRef, base64, 'data_url');
      const storageUrl = await getDownloadURL(storageRef);

      // 3. Save to Firestore (User's subcollection)
      const reviewData = {
        hostName: isReviewingStay.host,
        hostId: isReviewingStay.hostId || '',
        stayDate: isReviewingStay.date,
        petName: isReviewingStay.pet,
        reviewText,
        aiSummary,
        rating: reviewRating,
        storageUrl,
        storagePath: storageRef.fullPath,
        ownerName: userData?.name || user.displayName || 'Pet Owner',
        ownerPhotoURL: userData?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp()
      };

      const reviewDoc = await addDoc(collection(db, 'users', user.uid, 'review_for_hosts_from_owners'), reviewData);

      // 4. Save to Global Reviews Collection
      if (isReviewingStay.hostId) {
        await setDoc(doc(db, 'reviews', reviewDoc.id), {
          ...reviewData,
          ownerId: user.uid
        });
      }

      // 5. Update stay with review ID
      await updateDoc(doc(db, 'users', user.uid, 'past_stays', isReviewingStay.id), {
        reviewId: reviewDoc.id
      });

      alert('Review submitted successfully!');
      setIsReviewingStay(null);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-48 pb-20 bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone-400 font-bold">Loading Profile...</div>
      </div>
    );
  }

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

  const userName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = userData?.email || user?.email || 'No email provided';
  const userPhone = userData?.phone || 'No phone provided';
  const userLocation = userData?.location || 'Hyderabad, India';

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
                    {isEditing ? (
                      <div className="space-y-6 bg-stone-50 p-8 rounded-3xl border border-stone-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-stone-400">Display Name</label>
                            <input 
                              type="text" 
                              value={editData.name || ''} 
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-stone-400">Full Name</label>
                            <input 
                              type="text" 
                              value={editData.fullName || ''} 
                              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                              className="w-full p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-stone-400">Phone</label>
                            <input 
                              type="tel" 
                              value={editData.phone || ''} 
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-stone-400">Location</label>
                            <input 
                              type="text" 
                              value={editData.location || ''} 
                              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                              className="w-full p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
                          >
                            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-4 rounded-xl border border-stone-200 font-bold hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                );
              case 'My Pets':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pets.map((pet) => (
                      <div key={pet.id} className="p-6 border border-stone-100 rounded-2xl flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group relative overflow-hidden">
                        <div className="w-24 h-24 bg-stone-100 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                          {pet.photoURL ? (
                            <img src={pet.photoURL} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <UserCircle size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-lg text-navy">{pet.name}</div>
                            <span className="text-[10px] font-bold uppercase bg-beige px-2 py-0.5 rounded text-navy/60">Active</span>
                          </div>
                          <div className="text-sm text-stone-400">{pet.breed}</div>
                          <div className="text-xs text-stone-400 mt-1">{pet.age} • {pet.weight}</div>
                          <div className="mt-3 flex gap-2">
                            <button 
                              onClick={() => handleDeletePet(pet)}
                              className="text-[10px] font-bold text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                            <button 
                              onClick={() => setViewingMedicalRecordsFor(pet.name)}
                              className="text-[10px] font-bold text-stone-400 hover:text-navy transition-colors"
                            >
                              Medical Records
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isAddingPet ? (
                      <div className="p-6 border-2 border-navy/20 rounded-2xl bg-stone-50 space-y-4">
                        <div className="flex items-center gap-4">
                          <div 
                            onClick={() => petImageInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl bg-white border border-dashed border-stone-200 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                          >
                            {petImagePreview ? (
                              <img src={petImagePreview} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="text-stone-300 group-hover:text-navy transition-colors" />
                            )}
                            <input 
                              type="file" 
                              ref={petImageInputRef}
                              onChange={handlePetImageChange}
                              className="hidden"
                              accept="image/*"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Pet Name"
                              value={newPet.name}
                              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                              className="w-full p-2 text-sm rounded-lg border-stone-200 focus:ring-navy/10"
                            />
                            <input 
                              type="text" 
                              placeholder="Breed"
                              value={newPet.breed}
                              onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                              className="w-full p-2 text-sm rounded-lg border-stone-200 focus:ring-navy/10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="Age (e.g. 3 years)"
                            value={newPet.age}
                            onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                            className="w-full p-2 text-sm rounded-lg border-stone-200 focus:ring-navy/10"
                          />
                          <input 
                            type="text" 
                            placeholder="Weight (e.g. 28kg)"
                            value={newPet.weight}
                            onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                            className="w-full p-2 text-sm rounded-lg border-stone-200 focus:ring-navy/10"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={handleSavePet}
                            disabled={isSavingPet}
                            className="flex-1 btn-primary py-2 text-sm"
                          >
                            {isSavingPet ? 'Saving...' : 'Enter'}
                          </button>
                          <button 
                            onClick={() => {
                              setIsAddingPet(false);
                              setPetImagePreview(null);
                              setPetImageFile(null);
                            }}
                            className="flex-1 py-2 text-sm rounded-xl border border-stone-200 font-bold hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingPet(true)}
                        className="p-8 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-navy hover:text-navy hover:bg-stone-50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:scale-110 transition-transform">
                          <span className="text-2xl">+</span>
                        </div>
                        <span className="font-bold">Add New Pet</span>
                      </button>
                    )}
                  </div>
                );
              case 'Booking History':
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Past Stays</h3>
                      {!isAddingStay && (
                        <button 
                          onClick={() => setIsAddingStay(true)}
                          className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                        >
                          <PlusCircle size={14} /> Add Past Experience
                        </button>
                      )}
                    </div>

                    {isAddingStay && (
                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-stone-400">Host Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Rahul Verma"
                              value={newStay.host}
                              onChange={(e) => setNewStay({ ...newStay, host: e.target.value })}
                              className="w-full p-3 rounded-xl border-stone-200 text-sm focus:ring-navy/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-stone-400">Date Range</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Jan 10 - 12, 2026"
                              value={newStay.date}
                              onChange={(e) => setNewStay({ ...newStay, date: e.target.value })}
                              className="w-full p-3 rounded-xl border-stone-200 text-sm focus:ring-navy/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-stone-400">Pet Name</label>
                            <select 
                              value={newStay.pet}
                              onChange={(e) => setNewStay({ ...newStay, pet: e.target.value })}
                              className="w-full p-3 rounded-xl border-stone-200 text-sm focus:ring-navy/10"
                            >
                              <option value="">Select Pet</option>
                              {pets.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-stone-400">Location</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Gachibowli"
                              value={newStay.location}
                              onChange={(e) => setNewStay({ ...newStay, location: e.target.value })}
                              className="w-full p-3 rounded-xl border-stone-200 text-sm focus:ring-navy/10"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={handleSaveStay}
                            disabled={isSavingStay}
                            className="flex-1 btn-primary py-3 text-sm"
                          >
                            {isSavingStay ? 'Saving...' : 'Save Experience'}
                          </button>
                          <button 
                            onClick={() => setIsAddingStay(false)}
                            className="flex-1 py-3 rounded-xl border border-stone-200 font-bold hover:bg-white transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {pastStays.length === 0 && !isAddingStay && (
                        <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                          <History className="mx-auto text-stone-300 mb-4" size={48} />
                          <p className="text-stone-500 font-medium">No past stays recorded yet.</p>
                          <button 
                            onClick={() => setIsAddingStay(true)}
                            className="text-navy font-bold text-sm mt-2 hover:underline"
                          >
                            Add your first experience
                          </button>
                        </div>
                      )}
                      {pastStays.map((booking) => (
                        <div key={booking.id} className="p-6 border border-stone-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-beige rounded-2xl flex items-center justify-center text-navy font-bold text-xl shadow-sm">
                              {booking.host[0]}
                            </div>
                            <div>
                              <div className="font-bold text-navy">Stay with {booking.host}</div>
                              <div className="text-sm text-stone-400">{booking.date}</div>
                              <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                                <span className="bg-stone-100 px-1.5 py-0.5 rounded">Pet: {booking.pet}</span>
                                {booking.location && <span className="flex items-center gap-1"><MapPin size={10} /> {booking.location}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                              {booking.price && <div className="font-bold text-lg text-navy">₹{booking.price}</div>}
                              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded inline-block ${
                                booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {booking.status}
                              </div>
                            </div>
                            {booking.reviewId ? (
                              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={14} /> Reviewed
                              </span>
                            ) : (
                              <button 
                                onClick={() => setIsReviewingStay(booking)}
                                className="text-navy font-bold text-sm hover:underline"
                              >
                                Leave a Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Review Modal */}
                    <AnimatePresence>
                      {isReviewingStay && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl"
                          >
                            <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-bold">Review Stay with {isReviewingStay.host}</h2>
                              <button onClick={() => setIsReviewingStay(null)} className="text-stone-400 hover:text-navy">
                                <X size={24} />
                              </button>
                            </div>

                            <div className="space-y-6">
                              <div className="flex flex-col items-center gap-2">
                                <label className="text-xs font-bold uppercase text-stone-400">Rating</label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                      key={star}
                                      onClick={() => setReviewRating(star)}
                                      className="transition-transform hover:scale-110"
                                    >
                                      <Star 
                                        size={32} 
                                        className={star <= reviewRating ? "text-accent fill-accent" : "text-stone-200"} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-stone-400">Your Experience</label>
                                <textarea 
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  placeholder="How was the stay? How did they treat your pet?"
                                  className="w-full h-40 p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-navy/10 resize-none text-sm"
                                />
                              </div>

                              <div className="flex flex-col gap-3">
                                <button 
                                  onClick={handleSubmitReview}
                                  disabled={isSubmittingReview || !reviewText}
                                  className="w-full py-4 btn-primary font-bold shadow-lg shadow-navy/20 disabled:opacity-50"
                                >
                                  {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
                                </button>
                                <p className="text-[10px] text-center text-stone-400">
                                  Your review will be saved to your history and shared with the host.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              case 'Reviews':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hostReviews.length === 0 ? (
                      <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
                        <Star className="mx-auto text-stone-300 mb-4" size={48} />
                        <p className="text-stone-500 font-medium">No reviews received yet.</p>
                      </div>
                    ) : (
                      hostReviews.map((review, i) => (
                        <div key={review.id || i} className="p-6 border border-stone-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star 
                                  key={starIdx} 
                                  size={14} 
                                  className={starIdx < (review.rating || 0) ? "text-accent fill-accent" : "text-stone-200"} 
                                />
                              ))}
                            </div>
                            <div className="text-stone-400 text-xs">
                              {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : review.date || 'Recent'}
                            </div>
                          </div>
                          <p className="text-stone-600 text-sm leading-relaxed italic mb-4">"{review.reviewText || review.comment}"</p>
                          <div className="flex items-center gap-3 pt-4 border-t border-stone-50">
                            <div className="w-8 h-8 rounded-full bg-stone-100 overflow-hidden">
                              {review.ownerPhotoURL ? (
                                <img src={review.ownerPhotoURL} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <UserCircle size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-navy">{review.ownerName || review.name}</div>
                              <div className="text-[10px] text-stone-400">Pet Parent</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              case 'File History':
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Document History</h3>
                      <button 
                        onClick={() => setViewingMedicalRecordsFor(null)}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                      >
                        <PlusCircle size={14} /> Upload Document
                      </button>
                    </div>
                    <p className="text-stone-500 text-sm mb-8">
                      View all your uploaded documents, including medical records and host applications.
                    </p>
                    <div className="bg-stone-50 p-8 rounded-3xl border border-dashed border-stone-200 text-center">
                      <FileText className="mx-auto text-stone-300 mb-4" size={48} />
                      <p className="text-stone-500 font-medium mb-4">Access your full document history</p>
                      <button 
                        onClick={() => setViewingMedicalRecordsFor(null)}
                        className="btn-secondary py-2 px-6 text-sm"
                      >
                        Open File Manager
                      </button>
                    </div>
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
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <UserCircle size={48} />
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
              <p className="text-stone-400 text-sm mb-6">Pet Parent & {userData?.role === 'host' ? 'Host' : 'Owner'}</p>
              
              <div className="space-y-4 text-left border-t border-stone-50 pt-6">
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <Mail size={16} className="text-stone-400" />
                  <span className="truncate">{userEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <MapPin size={16} className="text-stone-400" />
                  <span>{userLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-sm">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="font-medium text-emerald-600">Verified Account</span>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <button 
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setActiveTab('Overview');
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-100 text-sm font-bold transition-colors ${isEditing ? 'bg-navy text-white' : 'hover:bg-stone-50'}`}
                >
                  <Settings size={16} /> {isEditing ? 'Stop Editing' : 'Edit Profile'}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-stone-500 text-sm font-bold hover:bg-stone-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 text-sm font-bold hover:bg-red-50 transition-colors mt-4"
                >
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Pets Handled', value: hostStats.petsHandled.toString(), icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Current Bookings', value: hostStats.currentBookings.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Reviews Received', value: hostStats.reviewsReceived.toString(), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' }
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
                  {['Overview', 'My Pets', 'Booking History', 'Reviews', 'File History'].map((tab) => (
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Delete Account?</h2>
              <p className="text-stone-500 mb-8 leading-relaxed">
                This action is permanent and cannot be undone. All your data, pets, and booking history will be deleted.
              </p>
              
              {deleteError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {deleteError}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medical Records Modal */}
      <AnimatePresence>
        {viewingMedicalRecordsFor && (
          <MedicalRecords 
            petName={viewingMedicalRecordsFor} 
            onClose={() => setViewingMedicalRecordsFor(null)} 
          />
        )}
      </AnimatePresence>
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
