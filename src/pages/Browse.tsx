import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import HostCard from '../components/HostCard';
import ChatWindow from '../components/ChatWindow';
import { AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface Host {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  location: string;
  area: string;
  petTypes: string[];
  experience: string;
  isVerified?: boolean;
}

const ALL_HOSTS = [
  {
    id: '1',
    name: 'Priya Sharma',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    price: 800,
    location: 'Hyderabad',
    area: 'Jubilee Hills',
    petTypes: ['Dog', 'Cat'],
    experience: '5+ years of experience hosting dogs of all sizes. Large backyard available.'
  },
  {
    id: '2',
    name: 'Rahul Verma',
    image: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    price: 650,
    location: 'Hyderabad',
    area: 'Gachibowli',
    petTypes: ['Cat'],
    experience: 'Cat lover with a quiet home. Specializes in senior pet care.'
  },
  {
    id: '3',
    name: 'Anjali Nair',
    image: 'https://images.unsplash.com/photo-1619194617062-5a61b9c6a049?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    price: 1200,
    location: 'Hyderabad',
    area: 'Banjara Hills',
    petTypes: ['Dog'],
    experience: 'Certified pet behaviorist. Premium home environment with 24/7 supervision.'
  },
  {
    id: '4',
    name: 'Vikram Singh',
    image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    price: 500,
    location: 'Hyderabad',
    area: 'Kukatpally',
    petTypes: ['Dog'],
    experience: 'Affordable pet hosting for small dogs. Active lifestyle with daily walks.'
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    price: 900,
    location: 'Hyderabad',
    area: 'Madhapur',
    petTypes: ['Dog', 'Cat', 'Bird'],
    experience: 'Spacious apartment with pet-friendly amenities. Experienced with rescue pets.'
  },
  {
    id: '6',
    name: 'Arjun Das',
    image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=400',
    rating: 4.6,
    price: 750,
    location: 'Hyderabad',
    area: 'Secunderabad',
    petTypes: ['Dog'],
    experience: 'Large independent house. Loves playing with active breeds.'
  },
  {
    id: '7',
    name: 'Meera Iyer',
    image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    price: 1100,
    location: 'Bangalore',
    area: 'Koramangala',
    petTypes: ['Dog', 'Cat'],
    experience: 'Pet nutritionist and lover. Your pet will get the best meals and care.'
  },
  {
    id: '8',
    name: 'Zoya Khan',
    image: 'https://images.unsplash.com/photo-1623091423320-5524436a6c11?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    price: 700,
    location: 'Mumbai',
    area: 'Bandra',
    petTypes: ['Dog', 'Cat'],
    experience: 'Professional groomer and host. Free grooming session with every stay!'
  },
  {
    id: '9',
    name: 'Rohan Mehta',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    price: 600,
    location: 'Bangalore',
    area: 'Indiranagar',
    petTypes: ['Dog'],
    experience: 'Active host with two friendly Labradors. Great for socialization.'
  }
];

export default function Browse() {
  const location = useLocation();
  const [activeChat, setActiveChat] = React.useState<{ name: string; image: string } | null>(null);
  const [hosts, setHosts] = React.useState<Host[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Input states (unapplied)
  const [searchTerm, setSearchTerm] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('All');
  const [priceFilter, setPriceFilter] = React.useState('All');
  const [petFilter, setPetFilter] = React.useState('All');

  // Applied states (used for filtering)
  const [appliedFilters, setAppliedFilters] = React.useState({
    searchTerm: '',
    location: 'All',
    price: 'All',
    pet: 'All'
  });

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const l = params.get('l') || 'All';
    
    setSearchTerm(q);
    setLocationFilter(l);
    setAppliedFilters(prev => ({
      ...prev,
      searchTerm: q,
      location: l
    }));
  }, [location.search]);

  React.useEffect(() => {
    // Fetch hosts from Firestore
    const hostsQuery = query(
      collection(db, 'hosts'),
      where('isVerified', '==', true)
    );

    const unsubscribe = onSnapshot(hostsQuery, (snapshot) => {
      const fetchedHosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const fullLocation = data.location || '';
        const locationParts = fullLocation.split(',').map((s: string) => s.trim());
        
        return {
          id: doc.id,
          name: data.fullName,
          image: data.profilePicUrl || data.houseImages?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
          rating: data.rating || 5.0,
          price: data.pricePerDay,
          location: locationParts.length > 1 ? locationParts.slice(1).join(', ') : 'Hyderabad',
          area: locationParts[0],
          petTypes: data.petTypes || ['Dog', 'Cat'],
          experience: data.experience,
          isVerified: data.isVerified,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      // Merge with static hosts and sort by date
      const combined = [...fetchedHosts, ...ALL_HOSTS].sort((a: any, b: any) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setHosts(combined);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching hosts:", error);
      setHosts(ALL_HOSTS); // Fallback to static data on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      location: locationFilter,
      price: priceFilter,
      pet: petFilter
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setLocationFilter('All');
    setPriceFilter('All');
    setPetFilter('All');
    setAppliedFilters({
      searchTerm: '',
      location: 'All',
      price: 'All',
      pet: 'All'
    });
  };

  const filteredHosts = React.useMemo(() => {
    return hosts.filter(host => {
      const matchesSearch = host.name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) || 
                           host.location.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
                           host.area.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase());
      
      const matchesLocation = appliedFilters.location === 'All' || host.location === appliedFilters.location;
      
      let matchesPrice = true;
      if (appliedFilters.price === 'Under ₹500') matchesPrice = host.price < 500;
      else if (appliedFilters.price === '₹500 - ₹1000') matchesPrice = host.price >= 500 && host.price <= 1000;
      else if (appliedFilters.price === 'Over ₹1000') matchesPrice = host.price > 1000;

      const matchesPet = appliedFilters.pet === 'All' || host.petTypes.includes(appliedFilters.pet);

      return matchesSearch && matchesLocation && matchesPrice && matchesPet;
    });
  }, [appliedFilters, hosts]);

  return (
    <div className="pt-32 pb-20">
      <div className="section-padding py-0">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Pet's Perfect Host</h1>
          <p className="text-stone-500">Discover verified hosts in your area who will love your pet as much as you do.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col lg:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by location or host name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            <div className="relative flex-1 sm:flex-none min-w-[120px]">
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-stone-50 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors border-none focus:ring-2 focus:ring-navy/10 pr-10"
              >
                <option value="All">Location</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" size={16} />
            </div>

            <div className="relative flex-1 sm:flex-none min-w-[120px]">
              <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-stone-50 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors border-none focus:ring-2 focus:ring-navy/10 pr-10"
              >
                <option value="All">Price</option>
                <option value="Under ₹500">Under ₹500</option>
                <option value="₹500 - ₹1000">₹500 - ₹1000</option>
                <option value="Over ₹1000">Over ₹1000</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" size={16} />
            </div>

            <div className="relative flex-1 sm:flex-none min-w-[120px]">
              <select 
                value={petFilter}
                onChange={(e) => setPetFilter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-stone-50 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors border-none focus:ring-2 focus:ring-navy/10 pr-10"
              >
                <option value="All">Pet Type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" size={16} />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleApplyFilters}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all shadow-md active:scale-95"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center justify-center p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
                title="Reset Filters"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-navy mb-4" size={48} />
              <p className="text-stone-500 font-bold">Finding verified hosts...</p>
            </div>
          ) : filteredHosts.length > 0 ? (
            filteredHosts.map((host) => (
              <HostCard 
                key={host.id}
                id={host.id}
                name={host.name}
                image={host.image}
                rating={host.rating}
                price={host.price}
                location={`${host.area}, ${host.location}`}
                experience={host.experience}
                onMessage={(name, image) => setActiveChat({ name, image })}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="bg-stone-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-stone-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hosts found</h3>
              <p className="text-stone-500">Try adjusting your filters or search term to find more results.</p>
            </div>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-16 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <button 
              key={n} 
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${n === 1 ? 'bg-navy text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {n}
            </button>
          ))}
        </div>
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
