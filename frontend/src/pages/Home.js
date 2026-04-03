import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Shield, Award, Clock, Headphones, MessageCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VehicleCard from '../components/VehicleCard';
import ExitIntentPopup from '../components/ExitIntentPopup';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_IMAGE = 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80';

const CATEGORIES = [
  { label: 'Trucks', query: 'Truck', icon: '🚛', desc: 'Power & capability' },
  { label: 'SUVs', query: 'SUV', icon: '🚙', desc: 'Family adventure' },
  { label: 'Sedans', query: 'Sedan', icon: '🚗', desc: 'Daily commuter' },
  { label: 'Coupes', query: 'Coupe', icon: '🏎️', desc: 'Pure performance' },
  { label: 'Hybrid', query: 'Hybrid', icon: '⚡', desc: 'Eco-smart' },
  { label: 'Commercial', query: 'Cargo Van', icon: '📦', desc: 'Work-ready' },
];

const STATS = [
  { value: '500+', label: 'Vehicles Sold' },
  { value: '12+', label: 'Years in Business' },
  { value: '4.9★', label: 'Customer Rating' },
  { value: '100%', label: 'Satisfaction' },
];

const TESTIMONIALS = [
  { name: 'James Okafor', text: 'AutoNorth made buying my F-150 incredibly easy. No pressure, great price, and they handled everything. I was driving off the lot in 2 hours.', vehicle: '2024 Ford F-150 XLT', rating: 5 },
  { name: 'Sarah Mitchell', text: 'Found my dream Explorer ST here. The team was knowledgeable, honest about the vehicle history, and offered the best financing rate I could find.', vehicle: '2023 Ford Explorer ST', rating: 5 },
  { name: 'Priya Sharma', text: 'Exceptional experience from start to finish. The Mustang GT was exactly as described. AutoNorth has earned a customer for life.', vehicle: '2024 Ford Mustang GT', rating: 5 },
];

const WHY_US = [
  { icon: Shield, title: 'Fully Inspected', desc: 'Every vehicle undergoes a rigorous 150-point inspection before listing.' },
  { icon: Award, title: 'Best Price Guarantee', desc: 'We match or beat any competitor price. No hidden fees, ever.' },
  { icon: Clock, title: 'Fast Financing', desc: 'Get pre-approved in minutes. We work with all credit profiles.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Our team is available around the clock to assist you.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });
  const [leadSent, setLeadSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/vehicles?featured=true&limit=4`).then(({ data }) => setFeatured(data.vehicles || []));
  }, []);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads`, { ...leadForm, lead_type: 'contact', message: 'Homepage lead capture form' });
      setLeadSent(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="home-page">
      <Navbar />
      <ExitIntentPopup />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="AutoNorth Motors" className="w-full h-full object-cover" />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs tracking-[0.3em] uppercase text-[#D4AF37] font-heading mb-6"
            >
              Edmonton, Alberta · Premier Dealership
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-white leading-none tracking-tighter mb-6"
            >
              Drive Your<br />
              <span className="gradient-text font-semibold">Ambition</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white/60 font-body text-lg md:text-xl max-w-lg leading-relaxed mb-10"
            >
              Premium new and used vehicles. Unmatched prices. Expert guidance. Your perfect car awaits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/inventory" className="btn-gold px-8 py-4 text-sm flex items-center gap-2" data-testid="hero-browse-btn">
                Browse Inventory <ArrowRight size={16} />
              </Link>
              <Link to="/financing" className="btn-outline px-8 py-4 text-sm" data-testid="hero-financing-btn">
                Get Pre-Approved
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs font-body tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} className="text-white/30 animate-bounce" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0A0A0A] border-y border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-heading text-3xl font-semibold text-[#D4AF37] mb-1">{stat.value}</p>
                <p className="text-white/40 text-xs font-body tracking-widest uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-24 md:py-32" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-heading mb-3">Curated Selection</p>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-3xl md:text-4xl font-light text-white tracking-tight">
                Featured <span className="gradient-text">Vehicles</span>
              </h2>
              <Link to="/inventory" className="text-white/40 hover:text-white text-xs font-body tracking-widest uppercase flex items-center gap-2 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i} />)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#0A0A0A] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-heading mb-2">Browse</p>
            <h2 className="font-heading text-2xl md:text-3xl font-light text-white">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate(`/inventory?body_type=${cat.query}`)}
                className="glass-card p-5 text-center hover:border-[#D4AF37]/20 transition-all duration-300 group"
                data-testid={`category-btn-${cat.label.toLowerCase()}`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-heading text-white text-sm font-medium group-hover:text-[#D4AF37] transition-colors">{cat.label}</p>
                <p className="text-white/30 text-xs font-body mt-1">{cat.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 max-w-xl">
            <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-heading mb-3">Why AutoNorth</p>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-white leading-tight">
              The Premium Car Buying<br /><span className="gradient-text">Experience</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-[#D4AF37]/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-5 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <item.icon size={20} className="text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-white text-base font-medium mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#050505] border-y border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-heading mb-3">Get Started Today</p>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-4">
              Find Your Perfect Vehicle
            </h2>
            <p className="text-white/50 font-body mb-10">Leave your details and our specialist will find you the best deal on the market.</p>

            {!leadSent ? (
              <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="homepage-lead-form">
                <input className="input-dark px-4 py-3 text-sm font-body" placeholder="Your Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} required data-testid="lead-form-name" />
                <input type="email" className="input-dark px-4 py-3 text-sm font-body" placeholder="Email Address" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required data-testid="lead-form-email" />
                <button type="submit" className="btn-gold py-3 text-sm flex items-center justify-center gap-2" data-testid="lead-form-submit">
                  Get Best Deal <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="glass-card p-8">
                <p className="text-[#D4AF37] font-heading text-xl mb-2">You're on our radar!</p>
                <p className="text-white/50 font-body text-sm">Our specialist will be in touch within 24 hours with your personalized offer.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-heading mb-3">Reviews</p>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-white">What Our Customers Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-7 hover:border-[#D4AF37]/20 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-[#D4AF37] text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/60 font-body text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-heading text-white text-sm font-medium">{t.name}</p>
                  <p className="text-[#D4AF37] text-xs font-body mt-0.5">{t.vehicle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/17805550100?text=Hi!%20I'm%20interested%20in%20a%20vehicle%20at%20AutoNorth%20Motors."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110"
        data-testid="whatsapp-btn"
      >
        <MessageCircle size={24} className="text-white" />
      </a>

      <Footer />
    </div>
  );
}
