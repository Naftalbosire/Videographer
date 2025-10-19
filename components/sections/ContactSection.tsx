import React from 'react';
import { Phone, Mail, Instagram } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center py-24 bg-[#111111]">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">
          For collaborations, commissions , or inquiries
        </p>

        <div className="flex flex-col items-center space-y-6">
          {/* Call */}
          <a
            href="tel:+254742393900"
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <Phone size={22} />
            <span className="text-lg">+254 742 393 900</span>
          </a>

          {/* Email */}
          <a
            href="mailto:lucyshoka3@gmail.com"
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <Mail size={22} />
            <span className="text-lg">lucyshoka3@gmail.com</span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/lucy_kadii/#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <Instagram size={22} />
            <span className="text-lg">@lucykadii</span>
          </a>
        </div>

        <div className="mt-16 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Lucy Kadii. All Rights Reserved.</p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
