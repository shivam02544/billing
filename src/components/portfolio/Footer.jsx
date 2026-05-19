import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 relative z-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              N.P<span className="text-orange-500">.</span>P<span className="text-orange-500">.</span>S
            </h2>
            <p className="mb-6 max-w-sm">
              Empowering students to achieve their full potential through excellence in education, character building, and innovation.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Admissions</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Academics</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
              <li><Link href="/" className="hover:text-white transition-colors text-orange-500 font-semibold border-b border-transparent hover:border-orange-500 w-fit">Portal Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} NPPS. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-slate-500">Designed thoughtfully for education.</p>
        </div>
      </div>
    </footer>
  );
}
