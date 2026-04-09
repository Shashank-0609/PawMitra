import React from 'react';
import { Mail, Lock, ArrowRight, User, Phone, UserCircle, Info, Camera, X, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import logo from '../components/final logo.png';
import BrandName from '../components/BrandName';

export default function Auth() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [showVerification, setShowVerification] = React.useState(false);
  const [showResetSuccess, setShowResetSuccess] = React.useState(false);
  const [verificationEmail, setVerificationEmail] = React.useState('');
  const [resetEmail, setResetEmail] = React.useState('');
  const [role, setRole] = React.useState<'owner' | 'host'>('owner');
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [error, setError] = React.useState<React.ReactNode>('');
  const [loading, setLoading] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const syncUserToFirestore = async (user: any, additionalData: any = {}) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const existingData = userDoc.exists() ? userDoc.data() : {};
    
    // Always ensure storagePath is set
    const storagePath = `user_upload/${user.uid}/`;
    
    if (!userDoc.exists() || Object.keys(additionalData).length > 0 || !existingData.storagePath) {
      let photoURL = existingData.photoURL || user.photoURL;
      let photoFileName = existingData.photoFileName || '';

      // If we have a new profile pic (base64 from registration)
      if (additionalData.profilePic && additionalData.profilePic.startsWith('data:image')) {
        const storageRef = ref(storage, `profile_pics/${user.uid}_${Date.now()}.jpg`);
        await uploadString(storageRef, additionalData.profilePic, 'data_url');
        photoURL = await getDownloadURL(storageRef);
        photoFileName = storageRef.name;
      }

      const userData = {
        uid: user.uid,
        name: additionalData.name || existingData.name || user.displayName || user.email.split('@')[0],
        fullName: additionalData.fullName || existingData.fullName || '',
        email: user.email,
        phone: additionalData.phone || existingData.phone || '',
        role: additionalData.role || existingData.role || 'owner',
        photoURL: photoURL || '',
        photoFileName: photoFileName || (photoURL ? 'profile_pic.jpg' : ''),
        storagePath: storagePath,
        createdAt: existingData.createdAt || new Date().toISOString(),
        ...additionalData
      };
      
      // Remove sensitive or temporary data
      delete userData.profilePic;
      delete userData.password;
      delete userData.confirmPassword;

      await setDoc(userDocRef, userData, { merge: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match!");
        }
        if (!agreeToTerms) {
          throw new Error("Please agree to the Terms and Conditions to continue.");
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Sync to Firestore first before signing out
        await syncUserToFirestore(userCredential.user, {
          name: formData.name,
          fullName: formData.fullName,
          phone: formData.phone,
          role: role,
          profilePic: profilePic
        });

        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: formData.name,
          photoURL: profilePic // This will be updated later by syncUserToFirestore if needed, but for now it's fine
        });

        // Send verification email
        await sendEmailVerification(userCredential.user);
        
        // Sign out immediately so they have to verify and log in
        await signOut(auth);
        
        setVerificationEmail(formData.email);
        setShowVerification(true);
        window.scrollTo(0, 0);
      } else {
        // Login
        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          
          // Check if email is verified
          if (!userCredential.user.emailVerified) {
            setVerificationEmail(formData.email);
            // Send another verification email if they try to log in unverified
            await sendEmailVerification(userCredential.user);
            await signOut(auth);
            setShowVerification(true);
            window.scrollTo(0, 0);
            return;
          }

          // Sync to Firestore on login if missing
          await syncUserToFirestore(userCredential.user);
        } catch (err: any) {
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            throw new Error("Password or Email Incorrect");
          }
          throw err;
        }
        window.scrollTo(0, 0);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(
          <span>
            User already exists.{' '}
            <button 
              type="button" 
              onClick={() => { setIsLogin(true); setError(''); }}
              className="font-bold underline hover:text-red-800"
            >
              Sign in?
            </button>
          </span>
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Sync to Firestore on social login
      await syncUserToFirestore(userCredential.user);

      // Social logins are usually pre-verified, but let's check just in case
      if (!userCredential.user.emailVerified) {
        setVerificationEmail(userCredential.user.email || '');
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerification(true);
        window.scrollTo(0, 0);
        return;
      }
      
      window.scrollTo(0, 0);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmail(formData.email);
      setShowResetSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [isLogin, showVerification, isForgotPassword, showResetSuccess]);

  if (showResetSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-beige px-6">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Reset Link Sent</h1>
          <p className="text-stone-500 mb-10 leading-relaxed">
            We have sent you a password change link to <span className="font-bold text-navy">{resetEmail}</span>. 
            Check your inbox and follow the instructions to reset your password.
          </p>
          <button 
            onClick={() => {
              setShowResetSuccess(false);
              setIsForgotPassword(false);
              setIsLogin(true);
            }}
            className="w-full btn-primary py-4"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-beige px-6">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-stone-500 mb-10 leading-relaxed">
            We have sent you a verification email to <span className="font-bold text-navy">{verificationEmail}</span>. 
            Verify it and log in to access your account.
          </p>
          <button 
            onClick={() => {
              setShowVerification(false);
              setIsLogin(true);
            }}
            className="w-full btn-primary py-4"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-beige px-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <img 
            src={logo} 
            alt="PawMitra" 
            className="h-24 w-24 rounded-full object-contain p-2 bg-white mx-auto mb-6 shadow-2xl border-4 border-white" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-3xl font-bold mb-2">
            {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p className="text-stone-500">
            {isForgotPassword ? 'Enter your email to receive a reset link' : (isLogin ? 'Login to manage your pet stays' : <span>Join the <BrandName size="sm" /> community today</span>)}
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100">
          {!isLogin && !isForgotPassword && (
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

          <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
            {!isLogin && !isForgotPassword && (
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-stone-300" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    <span className="text-xs font-bold">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <span className="text-xs text-stone-400 mt-2">Upload Profile Photo</span>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
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

            {!isForgotPassword && (
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
            )}

            {!isLogin && !isForgotPassword && (
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
                    required
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="font-medium text-stone-600 cursor-pointer">
                    I agree to the <BrandName size="sm" /> Terms and Conditions
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="ml-2 inline-flex items-center text-navy hover:text-accent transition-colors" 
                    title="View Terms and Conditions"
                  >
                    <Info size={14} />
                    <span className="ml-1 text-[10px] uppercase font-bold">Terms&Conditions</span>
                  </button>
                </div>
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                  }}
                  className="text-xs font-bold text-navy hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isForgotPassword ? 'Get Reset Link' : (isLogin ? 'Login' : 'Sign Up'))} <ArrowRight size={18} />
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-stone-100">
            <div className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Or continue with</div>
            <button 
              onClick={() => handleSocialLogin()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              <img 
                src="https://storage.googleapis.com/pawmitra_bucket1/Google__G__logo.svg.png" 
                alt="Google" 
                className="w-5 h-5 object-contain" 
                referrerPolicy="no-referrer"
              /> 
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { 
              if (isForgotPassword) {
                setIsForgotPassword(false);
                setIsLogin(true);
              } else {
                setIsLogin(!isLogin);
              }
              setError(''); 
            }}
            className="text-sm text-stone-500"
          >
            {isForgotPassword ? "Remember your password? " : (isLogin ? "Don't have an account? " : "Already have an account? ")}
            <span className="font-bold text-navy hover:underline">
              {isForgotPassword ? 'Login' : (isLogin ? 'Sign Up' : 'Login')}
            </span>
          </button>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Terms & Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-stone-600 leading-relaxed space-y-4">
              <p className="font-bold text-navy">Welcome to PawMitra!</p>
              <p>These terms and conditions outline the rules and regulations for the use of PawMitra's Website.</p>
              
              <h3 className="font-bold text-navy mt-6">1. Acceptance of Terms</h3>
              <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use PawMitra if you do not agree to take all of the terms and conditions stated on this page.</p>

              <h3 className="font-bold text-navy mt-6">2. Services</h3>
              <p>PawMitra provides a platform connecting pet owners with hosts. We do not own or manage any of the hosting facilities listed on the platform.</p>

              <h3 className="font-bold text-navy mt-6">3. User Responsibilities</h3>
              <p>Users are responsible for providing accurate information. Pet owners must ensure their pets are healthy and vaccinated. Hosts must provide a safe environment for the pets.</p>

              <h3 className="font-bold text-navy mt-6">4. Privacy</h3>
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your data.</p>

              <h3 className="font-bold text-navy mt-6">5. Liability</h3>
              <p>PawMitra is not liable for any damages or injuries that may occur during a pet stay. Users interact with each other at their own risk.</p>

              <h3 className="font-bold text-navy mt-6">6. Modifications</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
            </div>
            <div className="p-8 border-t border-stone-100 bg-stone-50">
              <button 
                onClick={() => setShowTerms(false)}
                className="w-full btn-primary py-4"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
