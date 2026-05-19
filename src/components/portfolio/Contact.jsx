"use client";

import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <section className="py-24 bg-slate-900 text-white relative flex items-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-3">Get In Touch</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Admissions Are Open!
            </h3>
            <p className="text-slate-300 mb-10 text-lg">
              We'd love to hear from you. Whether you have a question about admissions, fees, or our programs, our team is ready to answer all your questions.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
                  <MapPin className="text-orange-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Our Campus</h4>
                  <p className="text-slate-400">123 Education Boulevard, Knowledge City<br/>State 123456</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
                  <Phone className="text-orange-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Phone Number</h4>
                  <p className="text-slate-400">+91 98765 43210 <br/> +91 01234 56789</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
                  <Mail className="text-orange-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Email Address</h4>
                  <p className="text-slate-400">info@nppsschool.edu <br/> admissions@nppsschool.edu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden text-slate-900 border border-orange-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full rounded-tr-3xl"></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 relative z-10">Send Us a Message</h3>
            <form className="space-y-4 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/30">
                Submit Inquiry
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
