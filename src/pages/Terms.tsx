import React from 'react';
import { Shield, FileText, Lock, Scale } from 'lucide-react';
import BrandName from '../components/BrandName';

export default function Terms() {
  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-navy/5 text-navy rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
            <p className="text-stone-500">Last updated: March 1, 2026</p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileText className="text-accent" size={24} />
                1. Acceptance of Terms
              </h2>
              <div className="text-stone-600 leading-relaxed space-y-4">
                <p>
                  By accessing and using <BrandName size="sm" />, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use this website.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Your continued use of the platform following any changes constitutes your acceptance of the new terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="text-accent" size={24} />
                2. User Responsibilities
              </h2>
              <div className="text-stone-600 leading-relaxed space-y-4">
                <p>
                  Users are responsible for maintaining the confidentiality of their account information, including passwords. You agree to notify us immediately of any unauthorized use of your account.
                </p>
                <p>
                  Hosts are responsible for providing accurate information about their services and ensuring a safe environment for pets. Pet owners are responsible for providing accurate information about their pets' needs and health.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lock className="text-accent" size={24} />
                3. Privacy and Data
              </h2>
              <div className="text-stone-600 leading-relaxed space-y-4">
                <p>
                  Your use of <BrandName size="sm" /> is also governed by our Privacy Policy. Please review the policy to understand our practices regarding your personal data.
                </p>
              </div>
            </section>

            <section className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
              <h3 className="font-bold mb-2">Need help understanding our terms?</h3>
              <p className="text-stone-500 text-sm mb-4">If you have any questions regarding these terms, please contact our support team.</p>
              <button className="text-navy font-bold hover:underline">Contact Support</button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
