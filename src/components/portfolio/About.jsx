import { Target, Compass, Award, Users } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "Our Mission",
      desc: "To provide a vibrant learning environment that fosters academic excellence, critical thinking, and ethical values in every student."
    },
    {
      icon: <Compass className="w-8 h-8 text-orange-500" />,
      title: "Our Vision",
      desc: "To be a premier institution that nurtures global citizens equipped to lead with innovation, compassion, and resilience."
    },
    {
      icon: <Award className="w-8 h-8 text-orange-500" />,
      title: "Excellence",
      desc: "We commit to the highest standards in education, ensuring our students are prepared for the challenges of tomorrow."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Community",
      desc: "We build strong partnerships between students, educators, and parents to support holistic child development."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-3">About NPPS</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Nurturing Minds, <br /> Shaping Futures
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            Founded with a vision to redefine education, New Public Public School has been at the forefront of pedagogical innovation. We believe that every child is unique and possesses immense potential waiting to be unlocked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {values.map((item, index) => (
            <div 
              key={index} 
              className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-300">
                <div className="group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 bg-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2940&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center relative z-10">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">Principal's Message</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 italic">
              "Education is not the learning of facts, but the training of the mind to think. At NPPS, we strive to create an inclusive environment where inquiry is encouraged, creativity is celebrated, and character is forged."
            </p>
            <div>
              <p className="text-white font-bold text-xl">Dr. Sarah Jenkins</p>
              <p className="text-orange-400">Principal, NPPS</p>
            </div>
          </div>
          
          <div className="lg:w-1/2 lg:min-h-[500px] relative hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2938&auto=format&fit=crop" 
              alt="Principal" 
              className="absolute inset-0 w-full h-full object-cover rounded-r-3xl clip-path-slant"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
