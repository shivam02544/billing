import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Facilities from "@/components/portfolio/Facilities";
import Testimonials from "@/components/portfolio/Testimonials";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";

export const metadata = {
  title: "NPPS - Excellence in Education",
  description: "Welcome to New Public Public School. Discover our mission, facilities, and academic excellence.",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white scroll-smooth">
      <Hero />
      <About />
      <Facilities />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
