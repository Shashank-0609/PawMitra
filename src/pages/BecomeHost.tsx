import React from 'react';
import { Upload, ShieldCheck, Home, Info, X, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import BrandName from '../components/BrandName';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function BecomeHost() {
  const { user } = useAuth();
  const [ghmcFile, setGhmcFile] = React.useState<File | null>(null);
  const [ghmcPreview, setGhmcPreview] = React.useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = React.useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = React.useState<string | null>(null);
  const [houseImages, setHouseImages] = React.useState<File[]>([]);
  const [housePreviews, setHousePreviews] = React.useState<string[]>([]);
  
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [experience, setExperience] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');
  const [pricePerDay, setPricePerDay] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [petTypes, setPetTypes] = React.useState<string[]>([]);
  const [amenities, setAmenities] = React.useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'uploading' | 'summarizing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState('');

  const ghmcInputRef = React.useRef<HTMLInputElement>(null);
  const profilePicInputRef = React.useRef<HTMLInputElement>(null);
  const houseInputRef = React.useRef<HTMLInputElement>(null);

  const handleGhmcUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGhmcFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGhmcPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHouseImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setHouseImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHousePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeHouseImage = (index: number) => {
    setHouseImages(prev => prev.filter((_, i) => i !== index));
    setHousePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const generateAiSummary = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize the following pet hosting experience in a professional, concise way (max 2 sentences): ${text}`,
      });
      return response.text || "No summary generated.";
    } catch (error) {
      console.error("AI Summary generation failed:", error);
      return "Experience summary unavailable.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit your application.");
      return;
    }
    if (!ghmcFile) {
      alert("Please upload your GHMC certificate.");
      return;
    }
    if (!profilePicFile) {
      alert("Please upload your profile picture.");
      return;
    }
    if (houseImages.length < 3) {
      alert("Please upload at least 3 house images.");
      return;
    }
    if (petTypes.length === 0) {
      alert("Please select at least one pet type you can host.");
      return;
    }
    if (!aboutMe) {
      alert("Please fill in the 'About Me' section.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('uploading');
    setProgress(0);

    try {
      // 1. Upload GHMC Certificate
      const ghmcPath = `user_ghmc_certificates/${user.uid}/${Date.now()}_${ghmcFile.name}`;
      const ghmcRef = ref(storage, ghmcPath);
      const ghmcUploadTask = uploadBytesResumable(ghmcRef, ghmcFile);
      
      const ghmcUrl = await new Promise<string>((resolve, reject) => {
        ghmcUploadTask.on('state_changed', 
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 15; // First 15% for GHMC
            setProgress(p);
          },
          reject,
          async () => resolve(await getDownloadURL(ghmcUploadTask.snapshot.ref))
        );
      });

      // 2. Upload Profile Picture
      const profilePicPath = `newHostsProfilePic/${user.uid}/${Date.now()}_${profilePicFile.name}`;
      const profilePicRef = ref(storage, profilePicPath);
      const profilePicUploadTask = uploadBytesResumable(profilePicRef, profilePicFile);

      const profilePicUrl = await new Promise<string>((resolve, reject) => {
        profilePicUploadTask.on('state_changed',
          (snapshot) => {
            const p = 15 + ((snapshot.bytesTransferred / snapshot.totalBytes) * 15); // Next 15% for Profile Pic
            setProgress(p);
          },
          reject,
          async () => resolve(await getDownloadURL(profilePicUploadTask.snapshot.ref))
        );
      });

      // 3. Upload House Images
      const imageUrls: string[] = [];
      const imagePaths: string[] = [];
      for (let i = 0; i < houseImages.length; i++) {
        const file = houseImages[i];
        const imagePath = `user_house_images/${user.uid}/${Date.now()}_${file.name}`;
        const imageRef = ref(storage, imagePath);
        const uploadTask = uploadBytesResumable(imageRef, file);
        
        const url = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const p = 30 + ((snapshot.bytesTransferred / snapshot.totalBytes) * (50 / houseImages.length)) + (i * (50 / houseImages.length));
              setProgress(p);
            },
            reject,
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
          );
        });
        imageUrls.push(url);
        imagePaths.push(imagePath);
      }

      // 4. Generate AI Summary
      setSubmitStatus('summarizing');
      setProgress(85);
      const aiSummary = await generateAiSummary(experience);
      setProgress(95);

      // 5. Save to Firestore (User's private records)
      const applicationData = {
        name: "Host Application",
        type: "Host Certificate",
        url: ghmcUrl,
        storagePath: ghmcPath,
        profilePicUrl,
        profilePicPath,
        petName: "Host", 
        notes: experience,
        aboutMe,
        amenities,
        aiSummary: aiSummary,
        hostData: {
          fullName,
          phoneNumber,
          pricePerDay: Number(pricePerDay),
          location,
          petTypes,
          amenities,
          aboutMe,
          houseImages: imageUrls,
          houseImagePaths: imagePaths,
          profilePicUrl
        },
        createdAt: serverTimestamp(),
        status: 'pending',
        isVerified: false
      };

      const userFileRef = await addDoc(collection(db, 'users', user.uid, 'files'), applicationData);
      
      // Sync to global files collection
      await setDoc(doc(db, 'files', userFileRef.id), {
        ...applicationData,
        userId: user.uid
      });

      // Sync profile pic info specifically as requested
      await addDoc(collection(db, 'users', user.uid, 'newHostsProfilePic'), {
        url: profilePicUrl,
        storagePath: profilePicPath,
        notes: `Profile picture for host application: ${fullName}`,
        aiSummary,
        createdAt: serverTimestamp(),
        isVerified: false
      });

      // 6. Save to a global hosts collection for the browse page
      try {
        await addDoc(collection(db, 'hosts'), {
          userId: user.uid,
          fullName,
          phoneNumber,
          experience,
          pricePerDay: Number(pricePerDay),
          location,
          petTypes,
          amenities,
          aboutMe,
          ghmcUrl,
          profilePicUrl,
          houseImages: imageUrls,
          aiSummary,
          createdAt: serverTimestamp(),
          status: 'pending',
          isVerified: false
        });
      } catch (err) {
        console.warn("Could not save to global hosts collection. Check Firestore rules.", err);
      }

      setProgress(100);
      setSubmitStatus('success');
      
      // Show success message with email notification info
      alert("Application submitted! We have sent an email to your registered address informing you that your GHMC certificate is under review. We will verify your credentials and let you know soon.");
      
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setExperience('');
      setAboutMe('');
      setPricePerDay('');
      setLocation('');
      setPetTypes([]);
      setAmenities([]);
      setGhmcFile(null);
      setGhmcPreview(null);
      setProfilePicFile(null);
      setProfilePicPreview(null);
      setHouseImages([]);
      setHousePreviews([]);
      
    } catch (error: any) {
      console.error("Submission failed:", error);
      setSubmitStatus('error');
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-40 pb-20">
      <div className="section-padding py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <span className="text-accent font-bold uppercase tracking-wider text-sm">Join Our Community</span>
            <h1 className="text-5xl font-bold mt-4 mb-8 leading-tight">Turn Your Love for Pets into <span className="text-accent">Earnings</span></h1>
            <p className="text-xl text-stone-500 mb-12 leading-relaxed">
              Become a verified <BrandName size="xl" /> host. Set your own prices, choose your schedule, and host pets in your own home.
            </p>

            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: 'Get Verified', desc: 'Submit your GHMC certificate and home details for our trust badge.' },
                { icon: Home, title: 'Your Home, Your Rules', desc: 'Decide which pets you want to host and when you are available.' },
                { icon: Info, title: 'Support & Insurance', desc: 'Access 24/7 support and our community protection plan.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-beige rounded-xl flex items-center justify-center text-navy shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-stone-100">
            <h3 className="text-2xl font-bold mb-8">Host Application</h3>
            
            {submitStatus === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-2xl font-bold mb-2">Application Submitted!</h4>
                <p className="text-stone-500 mb-8">We've received your application. An email has been sent to you regarding your GHMC certificate review. Our team will review your credentials and get back to you within 2-3 business days.</p>
                <button 
                  onClick={() => {
                    setSubmitStatus('idle');
                    setFullName('');
                    setPhoneNumber('');
                    setExperience('');
                    setAboutMe('');
                    setPricePerDay('');
                    setLocation('');
                    setPetTypes([]);
                    setAmenities([]);
                    setGhmcFile(null);
                    setGhmcPreview(null);
                    setProfilePicFile(null);
                    setProfilePicPreview(null);
                    setHouseImages([]);
                    setHousePreviews([]);
                  }}
                  className="btn-primary px-8 py-3"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe" 
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210" 
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">About Me</label>
                  <textarea 
                    required
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Tell potential guests about yourself, your home, and why you love pets..." 
                    rows={4}
                    className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Experience with Pets</label>
                  <textarea 
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Tell us about your history with pets..." 
                    rows={4}
                    className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Price per Day (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      placeholder="800" 
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-stone-400">Location</label>
                    <input 
                      type="text" 
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Jubilee Hills, Hyderabad" 
                      className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Pet Types You Can Host</label>
                  <div className="flex flex-wrap gap-4">
                    {['Dog', 'Cat', 'Bird', 'Rabbit'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={petTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPetTypes([...petTypes, type]);
                            } else {
                              setPetTypes(petTypes.filter(t => t !== type));
                            }
                          }}
                          className="w-5 h-5 rounded border-stone-300 text-navy focus:ring-navy"
                        />
                        <span className="text-sm text-stone-600 group-hover:text-navy transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Amenities Provided</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Fenced Backyard', '24/7 Supervision', 'Daily Walks', 'Pet Grooming', 'Emergency Transport', 'First Aid Kit'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAmenities([...amenities, amenity]);
                            } else {
                              setAmenities(amenities.filter(a => a !== amenity));
                            }
                          }}
                          className="w-5 h-5 rounded border-stone-300 text-navy focus:ring-navy"
                        />
                        <span className="text-sm text-stone-600 group-hover:text-navy transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Profile Picture</label>
                  <input 
                    type="file" 
                    ref={profilePicInputRef} 
                    onChange={handleProfilePicUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  {!profilePicPreview ? (
                    <div 
                      onClick={() => profilePicInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-navy transition-colors cursor-pointer group"
                    >
                      <Upload className="mx-auto text-stone-300 group-hover:text-navy mb-2" size={32} />
                      <p className="text-sm text-stone-500">Upload your profile photo</p>
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 mx-auto group">
                      <img src={profilePicPreview} className="w-full h-full object-cover rounded-2xl shadow-md" alt="Profile Preview" />
                      <button 
                        type="button"
                        onClick={() => {
                          setProfilePicFile(null);
                          setProfilePicPreview(null);
                        }} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">GHMC Certificate (PDF/JPG)</label>
                  <input 
                    type="file" 
                    ref={ghmcInputRef} 
                    onChange={handleGhmcUpload} 
                    className="hidden" 
                    accept=".pdf,image/*"
                  />
                  {!ghmcPreview ? (
                    <div 
                      onClick={() => ghmcInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-navy transition-colors cursor-pointer group"
                    >
                      <Upload className="mx-auto text-stone-300 group-hover:text-navy mb-2" size={32} />
                      <p className="text-sm text-stone-500">Click to upload or drag and drop</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700">
                          {ghmcFile?.name || 'GHMC_Certificate.pdf'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setGhmcFile(null);
                          setGhmcPreview(null);
                        }} 
                        className="text-emerald-400 hover:text-emerald-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Home Environment (Photos)</label>
                  <input 
                    type="file" 
                    ref={houseInputRef} 
                    onChange={handleHouseImagesUpload} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                  />
                  <div 
                    onClick={() => houseInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-navy transition-colors cursor-pointer group"
                  >
                    <Upload className="mx-auto text-stone-300 group-hover:text-navy mb-2" size={32} />
                    <p className="text-sm text-stone-500">Upload photos of your home and pet areas</p>
                  </div>
                  
                  {housePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {housePreviews.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={img} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button"
                            onClick={() => removeHouseImage(i)}
                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {submitStatus === 'uploading' ? `Uploading... ${Math.round(progress)}%` : 'Summarizing...'}
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
                <p className="text-center text-xs text-stone-400">By submitting, you agree to our Host Terms & Conditions.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
