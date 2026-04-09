import { motion } from 'motion/react';
import BrandName from '../components/BrandName';
import { Heart, Shield, Info, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-20">
      <div className="section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">About Us – <BrandName size="4xl" /></h1>
            <p className="text-xl text-stone-600 leading-relaxed">
              Welcome to PawMitra – Your Trusted Companion in Pet Care.
            </p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100 mb-16">
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              At PawMitra, we believe that pets are not just animals — they are family. Our mission is to create a safe, supportive, and caring platform where pet parents can find reliable information, services, and resources for their pets.
            </p>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-navy">
              <Heart className="text-accent" /> Our Purpose
            </h2>
            <p className="text-stone-600 leading-relaxed mb-8">
              PawMitra was built with responsibility and compassion to help pet owners:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Shield, title: 'Trusted Services', desc: 'Discover trusted pet care services in your neighborhood.' },
                { icon: Info, title: 'Reliable Guidance', desc: 'Access reliable pet health and nutrition guidance.' },
                { icon: Heart, title: 'Adoption Support', desc: 'Find adoption and rescue support for animals in need.' },
                { icon: Users, title: 'Community', desc: 'Connect with a community that cares about animals.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="mt-1 text-accent">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-stone-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-stone-600 leading-relaxed mb-8">
              We aim to simplify pet parenting by bringing everything you need into one platform — whether it is finding a nearby veterinarian, understanding pet nutrition, or exploring adoption options.
            </p>

            <div className="bg-navy text-white p-8 rounded-3xl text-center">
              <p className="text-xl font-medium italic mb-4">
                "Our goal is to build a compassionate ecosystem where every pet feels loved, protected, and valued."
              </p>
              <p className="text-accent font-bold">Because every paw deserves a mitra (friend).</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
