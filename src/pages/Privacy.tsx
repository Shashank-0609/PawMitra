import { motion } from 'motion/react';
import BrandName from '../components/BrandName';
import { ShieldCheck, Lock, Eye, Cookie } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="pt-32 pb-20">
      <div className="section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy – <BrandName size="4xl" /></h1>
            <p className="text-xl text-stone-600 leading-relaxed">
              At PawMitra, we respect your privacy and are committed to protecting your personal information.
            </p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 text-accent">
                    <Eye size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Information We Collect</h3>
                    <p className="text-stone-600 leading-relaxed">
                      We may collect basic details such as your name, email address, and general usage data when you interact with our website.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 text-accent">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">How We Use Data</h3>
                    <p className="text-stone-600 leading-relaxed">
                      This information is used to improve user experience, respond to inquiries, enhance our services, and maintain website security.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 text-accent">
                    <Cookie size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Cookies & Third-Party Tools</h3>
                    <p className="text-stone-600 leading-relaxed">
                      We may use trusted third-party tools, such as analytics services, which operate under their own privacy policies. Our website may also use cookies to improve functionality, which you can manage through your browser settings.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 text-accent">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Data Safeguarding</h3>
                    <p className="text-stone-600 leading-relaxed">
                      We take reasonable steps to safeguard your data; however, no online platform can guarantee complete security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 text-center">
              <p className="text-stone-600 leading-relaxed">
                For any privacy-related concerns or requests regarding your data, please contact us.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
