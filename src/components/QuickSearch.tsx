import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickSearch() {
  const [query, setQuery] = React.useState('');
  const [location, setLocation] = React.useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location && location !== 'All') params.append('l', location);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="bg-white p-2 rounded-2xl shadow-xl border border-stone-100 flex flex-col md:flex-row gap-2 max-w-3xl w-full"
    >
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search hosts or services..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-navy placeholder:text-stone-400"
        />
      </div>
      
      <div className="hidden md:block w-px h-10 bg-stone-100 self-center" />
      
      <div className="flex-1 relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <select 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-12 pr-10 py-4 bg-transparent border-none focus:ring-0 text-navy appearance-none cursor-pointer"
        >
          <option value="All">All Locations</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      <button 
        type="submit"
        className="bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
