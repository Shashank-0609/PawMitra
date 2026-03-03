import React from 'react';
import { Star, MapPin, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import LoginRequiredModal from './LoginRequiredModal';

interface HostCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  location: string;
  experience?: string;
  onMessage?: (name: string, image: string) => void;
  key?: string | number;
}

export default function HostCard({ id, name, image, rating, price, location, experience, onMessage }: HostCardProps) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleMessageHost = (e: React.MouseEvent) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      onMessage?.(name, image);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate(`/profile/${id}`);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -8 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 group flex flex-col h-full"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-xs font-bold">{rating}</span>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="text-right">
              <span className="text-navy font-bold">₹{price}</span>
              <span className="text-stone-400 text-xs block">/ day</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-stone-500 text-sm mb-4">
            <MapPin size={14} />
            <span>{location}</span>
          </div>

          {experience && (
            <p className="text-stone-500 text-sm mb-6 line-clamp-2">
              {experience}
            </p>
          )}
          
          <div className="flex flex-col xl:flex-row gap-2 mt-auto items-stretch">
            <button 
              onClick={handleMessageHost}
              className="flex-1 py-3 px-3 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MessageSquare size={18} className="shrink-0" />
              <span className="leading-tight">Message Host</span>
            </button>
            <button 
              onClick={handleViewProfile}
              className="flex-1 py-3 px-3 rounded-xl bg-navy text-white font-bold hover:bg-navy/90 transition-all flex items-center justify-center text-sm"
            >
              <span className="leading-tight">View Profile</span>
            </button>
          </div>
        </div>
      </motion.div>

      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
