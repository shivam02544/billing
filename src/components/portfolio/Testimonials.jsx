export default function Testimonials() {
  const reviews = [
    {
      name: "Arun Kumar",
      role: "Parent",
      text: "Sending both my children to NPPS was the best decision we made. The individual attention and focus on overall development are remarkable.",
      avatar: "https://ui-avatars.com/api/?name=Arun+Kumar&background=ea580c&color=fff"
    },
    {
      name: "Priya Sharma",
      role: "Alumni, Batch of 2021",
      text: "The foundation I built at NPPS helped me tremendously in college. The teachers are mentors who genuinely care about your success.",
      avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=0f172a&color=fff"
    },
    {
      name: "Vikram Singh",
      role: "Parent",
      text: "Excellent infrastructure and highly dedicated staff. My daughter's confidence has grown exponentially since she joined NPPS.",
      avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=ea580c&color=fff"
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="absolute inset-0 bg-slate-50/50 transform -skew-y-3 z-0"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-3">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            What Our Community Says
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300 relative shadow-sm hover:-translate-y-2 transform">
              <div className="absolute top-8 right-8 text-orange-200">
                <svg width="45" height="36" viewBox="0 0 45 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 0C6.04416 0 0 6.04416 0 13.5V36H18V13.5H9C9 8.52943 13.0294 4.5 18 4.5V0H13.5ZM40.5 0C33.0442 0 27 6.04416 27 13.5V36H45V13.5H36C36 8.52943 40.0294 4.5 45 4.5V0H40.5Z" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg mb-8 relative z-10 italic">"{review.text}"</p>
              <div className="flex items-center gap-4">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full shadow-md" />
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
