import { Book, Microscope, Laptop, Trophy } from 'lucide-react';

export default function Facilities() {
  const facilities = [
    {
      title: "Smart Classrooms",
      desc: "Interactive digital boards and multimedia learning tools.",
      icon: <Laptop className="w-10 h-10" />,
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Science Labs",
      desc: "State-of-the-art physics, chemistry, and biology laboratories.",
      icon: <Microscope className="w-10 h-10" />,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Digital Library",
      desc: "Vast collection of books, journals, and digital resources.",
      icon: <Book className="w-10 h-10" />,
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Sports Complex",
      desc: "Indoor and outdoor facilities for holistic physical development.",
      icon: <Trophy className="w-10 h-10" />,
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2940&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-3">Campus Life</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              World-Class Facilities
            </h3>
          </div>
          <p className="text-slate-600 mt-6 md:mt-0 max-w-md">
            Our campus is designed to provide students with the best resources to explore their interests and excel in their pursuits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {facilities.map((fac, idx) => (
            <div key={idx} className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200">
              <div className="absolute inset-0 z-0">
                <img src={fac.image} alt={fac.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105 transform" />
              </div>
              <div className="relative z-10 p-10 h-full flex flex-col justify-end min-h-[350px] bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
                <div className="text-orange-400 mb-4 bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md">
                  {fac.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{fac.title}</h4>
                <p className="text-slate-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {fac.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
