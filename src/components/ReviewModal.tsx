import React from 'react';
import { Star, X, Loader2, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { GoogleGenAI } from "@google/genai";

interface ReviewModalProps {
  hostId: string;
  hostName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({ hostId, hostName, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [reviewText, setReviewText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Generate AI Summary
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this pet parent's review for host ${hostName}. 
        Rating: ${rating}/5 stars.
        Review: "${reviewText}"
        Provide a concise, professional summary of the feedback.`,
      });
      const aiResponse = await model;
      const aiSummary = aiResponse.text || "Summary not available.";

      const reviewData = {
        hostId,
        hostName,
        ownerId: user.uid,
        ownerName: user.displayName || 'Anonymous',
        rating,
        reviewText,
        aiSummary,
        notes: reviewText, // Using review text as notes as well
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      // 2. Upload to Firebase Storage as requested
      // Path: 'review_for_hosts/{uid}/'
      const storagePath = `review_for_hosts/${user.uid}/${Date.now()}.json`;
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, JSON.stringify(reviewData), 'raw', {
        contentType: 'application/json'
      });
      const fileUrl = await getDownloadURL(storageRef);

      // 3. Sync to Firestore
      // Global reviews collection
      const globalReviewRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        storageUrl: fileUrl,
        storagePath
      });

      // Specific path: '/reviews_for_particular_hosts/{uid}/reviews/{field}'
      // Here {uid} likely means hostId
      const hostReviewRef = doc(collection(db, 'reviews_for_particular_hosts', hostId, 'reviews'));
      await setDoc(hostReviewRef, {
        ...reviewData,
        reviewId: globalReviewRef.id,
        createdAt: serverTimestamp(),
        storageUrl: fileUrl,
        storagePath
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-stone-100"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-2xl font-bold text-navy">Leave a Review</h2>
            <p className="text-stone-400 text-sm font-medium mt-1">Share your experience with {hostName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-stone-100 text-stone-400 hover:text-navy"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Rating Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block">Overall Rating</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hover || rating)
                        ? "text-accent fill-accent"
                        : "text-stone-200"
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block">Your Feedback</label>
            <textarea
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was your pet's stay? What did you like about the host?"
              className="w-full h-40 p-6 bg-stone-50 rounded-3xl border border-stone-100 focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all resize-none text-navy font-medium placeholder:text-stone-300"
            />
          </div>

          {/* AI Notice */}
          <div className="flex items-start gap-4 p-5 bg-navy/[0.02] rounded-2xl border border-navy/5">
            <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-navy" />
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">
              <span className="font-bold text-navy">AI Enhancement:</span> Your review will be automatically summarized to help other pet parents quickly understand your feedback.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-stone-400 hover:bg-stone-50 transition-all border border-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reviewText.trim()}
              className="flex-[2] py-4 px-6 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Post Review
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
