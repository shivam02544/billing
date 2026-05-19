import Link from 'next/link';
import { ArrowDown, BookOpen } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-orange-900/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2940&auto=format&fit=crop" 
          alt="Students walking on campus" 
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-500/10 text-orange-400 font-semibold text-sm tracking-wider mb-8 border border-orange-500/20 backdrop-blur-sm">
          <BookOpen size={16} />
          <span>ADMISSIONS OPEN 2025-2026</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight">
          New Progressive <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            Public School
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Empowering the next generation of leaders through innovative learning, 
          character building, and holistic development in a nurturing environment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
          <a 
            href="#about" 
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Discover Our Mission
          </a>
          <Link 
            href="/" 
            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 text-white font-bold rounded-full transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Portal Login
          </Link>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <a href="#about" className="text-white/60 hover:text-orange-400 transition-colors flex flex-col items-center gap-2">
          <span className="text-sm tracking-widest uppercase font-semibold">Scroll</span>
          <ArrowDown size={24} />
        </a>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none"></div>
    </section>
  );
}
