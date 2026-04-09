import { motion } from 'motion/react';
import { Search, ShieldCheck, Heart, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HostCard from '../components/HostCard';
import BrandName from '../components/BrandName';
import QuickSearch from '../components/QuickSearch';

const FEATURED_HOSTS = [
  {
    id: '1',
    name: 'Priya Sharma',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    price: 800,
    location: 'Hyderabad',
    area: 'Jubilee Hills',
    experience: '5+ years of experience hosting dogs of all sizes. Large backyard available.'
  },
  {
    id: '8',
    name: 'Zoya Khan',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    price: 700,
    location: 'Mumbai',
    area: 'Bandra',
    experience: 'Professional groomer and host. Free grooming session with every stay!'
  },
  {
    id: '3',
    name: 'Anjali Nair',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    price: 1200,
    location: 'Hyderabad',
    area: 'Banjara Hills',
    experience: 'Certified pet behaviorist. Premium home environment with 24/7 supervision.'
  }
];

export default function Home() {
  return (
    <div className="pt-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=2000" 
            alt="Happy dog" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="section-padding relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-bold mb-6">
              Trust-Based Pet Hosting
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Your Pet’s <span className="text-accent underline decoration-accent/30">Second Home</span>
            </h1>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed">
              Skip the cold pet hostels. Connect with verified local hosts who will care for your pet like family in a real home environment.
            </p>
            <div className="mb-10">
              <QuickSearch />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-sm text-stone-400 font-medium">Popular:</span>
              <div className="flex gap-2">
                <Link to="/browse?q=Dog" className="text-xs font-bold px-3 py-1 bg-stone-100 rounded-full hover:bg-accent hover:text-white transition-colors">Dogs</Link>
                <Link to="/browse?q=Cat" className="text-xs font-bold px-3 py-1 bg-stone-100 rounded-full hover:bg-accent hover:text-white transition-colors">Cats</Link>
                <Link to="/browse?q=Grooming" className="text-xs font-bold px-3 py-1 bg-stone-100 rounded-full hover:bg-accent hover:text-white transition-colors">Grooming</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-beige">
        <div className="section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Three simple steps to ensure your pet is in safe hands while you are away.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: 'Find Trusted Host', desc: 'Browse verified hosts in your neighborhood with real reviews.' },
              { icon: Calendar, title: 'Book Easily', desc: 'Schedule a meet-and-greet and book your stay in minutes.' },
              { icon: Heart, title: 'Relax While We Care', desc: 'Get daily photo updates and peace of mind while you travel.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform group-hover:bg-navy group-hover:text-white">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-stone-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hosts */}
      <section>
        <div className="section-padding">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Hosts</h2>
              <p className="text-stone-500">Top-rated pet lovers ready to welcome your furry friends.</p>
            </div>
            <Link to="/browse" className="text-navy font-bold flex items-center gap-2 hover:text-accent transition-colors">
              View All Hosts <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_HOSTS.map((host) => (
              <HostCard 
                key={host.id}
                id={host.id}
                name={host.name}
                image={host.image}
                rating={host.rating}
                price={host.price}
                location={`${host.area}, ${host.location}`}
                experience={host.experience}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-beige overflow-hidden">
        <div className="section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Pet Parents Say</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Join thousands of happy pet parents who trust PawMitra for their furry family members.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "PawMitra made finding a host so easy. My dog, Bruno, had a blast with Priya. I received photo updates every day!",
                author: "Karthik R.",
                role: "Golden Retriever Parent",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
              },
              {
                text: "I was worried about leaving my cat for the first time, but Zoya was amazing. The home environment is so much better than a kennel.",
                author: "Sneha M.",
                role: "Persian Cat Parent",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
              },
              {
                text: "The verification process gives me peace of mind. I know my pet is safe and loved. Highly recommend PawMitra!",
                author: "Amit V.",
                role: "Beagle Parent",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
              >
                <div className="flex gap-1 text-accent mb-4">
                  {[...Array(5)].map((_, i) => <Heart key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-stone-600 mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-navy">{t.author}</h4>
                    <p className="text-xs text-stone-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-navy text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 skew-x-12 -mr-20" />
        
        <div className="section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Why Pet Parents Trust <BrandName size="4xl" /></h2>
              <div className="space-y-8">
                {[
                  { title: 'Verified Hosts', desc: 'Every host undergoes a strict background check and home inspection.' },
                  { title: 'GHMC Certified', desc: 'Hosts submit their GHMC certificate to build trust for users.' },
                  { title: 'Safe Homes', desc: 'Pets stay in real homes, not cages. It reduces stress and anxiety.' },
                  { title: 'Real Reviews', desc: 'Read authentic feedback from other pet parents in our community.' },
                  { title: 'Affordable Pricing', desc: 'Premium care at a fraction of the cost of traditional pet hotels.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <ShieldCheck className="text-accent" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800" 
                alt="Happy dog and owner" 
                className="rounded-3xl shadow-2xl relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent rounded-full z-0 opacity-20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
