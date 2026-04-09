import { motion } from 'motion/react';
import BrandName from '../components/BrandName';
import { Mail, MapPin, Phone, MessageSquare, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-20">
      <div className="section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">Contact – <BrandName size="4xl" /></h1>
            <p className="text-xl text-stone-600 leading-relaxed">
              We would love to hear from you.
            </p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <p className="text-stone-600 leading-relaxed">
                  Whether you have a question, suggestion, partnership proposal, or need support, feel free to reach out.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Email</h4>
                      <p className="text-stone-500">support@pawmitra.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Location</h4>
                      <p className="text-stone-500">Hyderabad, Telangana</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Phone</h4>
                      <p className="text-stone-500">+91 9998887776</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <MessageSquare size={20} className="text-accent" /> Connect with us
                  </h4>
                  <p className="text-sm text-stone-500 mb-8">
                    You can also connect with us through our social media platforms.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                      <Instagram size={24} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                      <Twitter size={24} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                      <Facebook size={24} />
                    </a>
                  </div>
                </div>

                <div className="bg-navy text-white p-8 rounded-3xl text-center">
                  <p className="text-sm font-medium italic">
                    "We aim to respond to all inquiries within 24 to 48 hours."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
