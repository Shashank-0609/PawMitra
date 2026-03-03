import React from 'react';
import { Upload, ShieldCheck, Home, Info, X, FileText, Image as ImageIcon } from 'lucide-react';
import BrandName from '../components/BrandName';

export default function BecomeHost() {
  const [ghmcFile, setGhmcFile] = React.useState<string | null>(null);
  const [houseImages, setHouseImages] = React.useState<string[]>([]);
  const ghmcInputRef = React.useRef<HTMLInputElement>(null);
  const houseInputRef = React.useRef<HTMLInputElement>(null);

  const handleGhmcUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGhmcFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHouseImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHouseImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeHouseImage = (index: number) => {
    setHouseImages(prev => prev.filter((_, i) => i !== index));
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
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-400">Experience with Pets</label>
                <textarea 
                  placeholder="Tell us about your history with pets..." 
                  rows={4}
                  className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Price per Day (₹)</label>
                  <input type="number" placeholder="800" className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-stone-400">Location</label>
                  <input type="text" placeholder="e.g. Jubilee Hills" className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-navy/10" />
                </div>
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
                {!ghmcFile ? (
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
                      <span className="text-sm font-medium text-emerald-700">GHMC_Certificate.pdf</span>
                    </div>
                    <button onClick={() => setGhmcFile(null)} className="text-emerald-400 hover:text-emerald-600">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-400">House Images</label>
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
                  <p className="text-sm text-stone-500">Upload at least 3 photos of your home</p>
                </div>
                
                {houseImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {houseImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                        <button 
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

              <button className="w-full btn-primary py-4 mt-4">Submit Application</button>
              <p className="text-center text-xs text-stone-400">By submitting, you agree to our Host Terms & Conditions.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
