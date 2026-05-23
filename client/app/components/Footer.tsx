'use client';

import React from 'react';
import { Globe, Mail, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-black text-white pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Brand Column */}
          <div className="space-y-8">
            <Logo />
            <p className="text-gray-400 leading-relaxed font-light text-sm pr-4">
              Empowering grassroots athletes with verified digital profiles, performance analytics, and real career opportunities.
            </p>
            <div className="flex space-x-3">
              {[Globe, Mail, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-[#FF4F21] hover:border-[#FF4F21] hover:text-white transition-all text-gray-400"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">Navigate</h3>
            <ul className="space-y-4 text-gray-300 font-medium text-sm">
              <li><Link href="/#home"     className="hover:text-[#FF4F21] transition-colors">Home</Link></li>
              <li><Link href="/#about"    className="hover:text-[#FF4F21] transition-colors">About</Link></li>
              <li><Link href="/#features" className="hover:text-[#FF4F21] transition-colors">Features</Link></li>
              <li><Link href="/#research" className="hover:text-[#FF4F21] transition-colors">Research</Link></li>
              <li><Link href="/#athletes" className="hover:text-[#FF4F21] transition-colors">Intelligence</Link></li>
              <li><Link href="/#contact"  className="hover:text-[#FF4F21] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">Product</h3>
            <ul className="space-y-4 text-gray-300 font-medium text-sm">
              <li><Link href="/#features" className="hover:text-[#FF4F21] transition-colors">Track Every Sprint</Link></li>
              <li><Link href="/#explore"  className="hover:text-[#FF4F21] transition-colors">Athlixir Advantage</Link></li>
              <li><Link href="/#athletes" className="hover:text-[#FF4F21] transition-colors">Athlete Intelligence</Link></li>
              <li><Link href="/#research" className="hover:text-[#FF4F21] transition-colors">Sports Science AI</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">Stay Updated</h3>
            <p className="text-gray-400 mb-6 text-sm font-light">Join our newsletter for the latest updates.</p>
            <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border border-white/10 rounded-lg px-5 py-3.5 text-white focus:outline-none focus:border-[#FF4F21]/50 transition-colors placeholder-gray-600 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg text-xs uppercase tracking-widest"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium tracking-wide">
          <p>© 2026 Athlixir | Built with purpose.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
