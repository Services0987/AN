import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Phone, MessageSquare, Calendar } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=60';

const TABS = ['contact', 'test_drive', 'financing'];
const TAB_LABELS = { contact: 'Contact Us', test_drive: 'Test Drive', financing: 'Financing' };

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('contact');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', preferred_date: '', preferred_time: '', down_payment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    axios.get(`${API}/vehicles/${id}`)
      .then(({ data }) => setVehicle(data))
      .catch(() => navigate('/inventory'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const images = vehicle?.images?.length > 0 ? vehicle.images : [PLACEHOLDER];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/leads`, {
        lead_type: activeTab,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        vehicle_id: vehicle?.id,
        vehicle_title: vehicle?.title,
        preferred_date: form.preferred_date || undefined,
        preferred_time: form.preferred_time || undefined,
        down_payment: form.down_payment ? parseFloat(form.down_payment) : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!vehicle) return null;

  const specs = [
    ['Year', vehicle.year],
    ['Make', vehicle.make],
    ['Model', vehicle.model],
    ['Condition', vehicle.condition === 'new' ? 'Brand New' : 'Pre-owned'],
    ['Mileage', vehicle.mileage === 0 ? '0 km' : `${vehicle.mileage.toLocaleString()} km`],
    ['Transmission', vehicle.transmission],
    ['Fuel Type', vehicle.fuel_type],
    ['Drivetrain', vehicle.drivetrain],
    ['Engine', vehicle.engine],
    ['Exterior Color', vehicle.exterior_color],
    ['Interior Color', vehicle.interior_color],
    ['Doors', vehicle.doors],
    ['Seats', vehicle.seats],
    ['Stock #', vehicle.stock_number],
    ['VIN', vehicle.vin || 'Available on request'],
  ].filter(([, v]) => v);

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="vehicle-detail-page">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-body transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Inventory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Gallery */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0A0A] mb-3" data-testid="vehicle-gallery">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-2 py-1 text-xs font-heading font-semibold tracking-wider uppercase ${vehicle.condition === 'new' ? 'bg-emerald-500 text-white' : 'bg-[#D4AF37] text-black'}`}>
                  {vehicle.condition === 'new' ? 'New' : 'Used'}
                </span>
                {vehicle.status === 'sold' && <span className="px-2 py-1 text-xs font-heading font-semibold bg-red-600 text-white tracking-wider uppercase">Sold</span>}
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 text-xs text-white/60 font-body">
                {imgIdx + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-20 h-16 overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-[#D4AF37]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 glass-card p-6">
              <h2 className="font-heading text-lg font-medium text-white mb-4">About This Vehicle</h2>
              <p className="text-white/60 font-body text-sm leading-relaxed">{vehicle.description || 'No description available.'}</p>
            </div>

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <div className="mt-4 glass-card p-6">
                <h2 className="font-heading text-lg font-medium text-white mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/60 font-body text-sm">
                      <Check size={14} className="text-[#D4AF37] flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="mt-4 glass-card p-6">
              <h2 className="font-heading text-lg font-medium text-white mb-4">Vehicle Specifications</h2>
              <div className="divide-y divide-white/[0.05]">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-white/40 font-body text-sm">{label}</span>
                    <span className="text-white font-body text-sm font-medium capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info + Lead Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="glass-card p-6 mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {vehicle.body_type && <span className="text-xs border border-white/10 text-white/40 px-2 py-1 font-body">{vehicle.body_type}</span>}
                  {vehicle.fuel_type && <span className="text-xs border border-white/10 text-white/40 px-2 py-1 font-body">{vehicle.fuel_type}</span>}
                </div>

                <h1 className="font-heading text-2xl font-medium text-white leading-tight mb-4" data-testid="vehicle-title">{vehicle.title}</h1>

                <div className="mb-6">
                  <p className="text-[#D4AF37] font-heading text-4xl font-semibold" data-testid="vehicle-price">${vehicle.price.toLocaleString()}</p>
                  <p className="text-white/30 text-xs font-body mt-1">+ applicable taxes & fees</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/[0.05]">
                  {[
                    [`${vehicle.year}`, 'Year'],
                    [vehicle.mileage === 0 ? '0 km' : `${vehicle.mileage.toLocaleString()} km`, 'Mileage'],
                    [vehicle.transmission, 'Transmission'],
                    [vehicle.drivetrain || 'N/A', 'Drivetrain'],
                  ].map(([val, lbl]) => (
                    <div key={lbl}>
                      <p className="text-white font-heading text-sm font-medium">{val}</p>
                      <p className="text-white/30 text-xs font-body">{lbl}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <a href="tel:+17805550100" className="btn-outline py-3 text-sm text-center flex items-center justify-center gap-2" data-testid="vehicle-call-btn">
                    <Phone size={16} /> Call 780-555-0100
                  </a>
                </div>
              </div>

              {/* Lead Form */}
              <div className="glass-card p-6">
                <div className="flex gap-1 mb-6">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSubmitted(false); }}
                      className={`flex-1 py-2 text-xs font-heading tracking-wider uppercase transition-all duration-200 border-b-2 ${activeTab === tab ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white/60'}`}
                      data-testid={`lead-tab-${tab}`}
                    >
                      {tab === 'contact' ? <MessageSquare size={12} className="inline mr-1" /> : tab === 'test_drive' ? <Calendar size={12} className="inline mr-1" /> : <span className="mr-1">$</span>}
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>

                {submitted ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
                      <Check size={20} className="text-[#D4AF37]" />
                    </div>
                    <p className="font-heading text-white text-base mb-1">Request Sent!</p>
                    <p className="text-white/40 text-sm font-body">We'll be in touch within 2 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-4 text-white/30 hover:text-white text-xs font-body transition-colors">Send another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3" data-testid="vehicle-lead-form">
                    <input className="input-dark w-full px-4 py-3 text-sm font-body" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="lead-name" />
                    <input type="email" className="input-dark w-full px-4 py-3 text-sm font-body" placeholder="Email Address *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="lead-email" />
                    <input type="tel" className="input-dark w-full px-4 py-3 text-sm font-body" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="lead-phone" />

                    {activeTab === 'test_drive' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" className="input-dark px-4 py-3 text-sm font-body" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} data-testid="lead-date" />
                        <select className="input-dark px-4 py-3 text-sm font-body" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} data-testid="lead-time">
                          <option value="">Preferred Time</option>
                          {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {activeTab === 'financing' && (
                      <input type="number" className="input-dark w-full px-4 py-3 text-sm font-body" placeholder="Down Payment ($)" value={form.down_payment} onChange={(e) => setForm({ ...form, down_payment: e.target.value })} data-testid="lead-down-payment" />
                    )}

                    {activeTab === 'contact' && (
                      <textarea className="input-dark w-full px-4 py-3 text-sm font-body resize-none" rows={3} placeholder="Message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="lead-message" />
                    )}

                    <button type="submit" disabled={sending} className="btn-gold w-full py-3 text-sm" data-testid="lead-submit-btn">
                      {sending ? 'Sending...' : activeTab === 'contact' ? 'Send Message' : activeTab === 'test_drive' ? 'Book Test Drive' : 'Apply for Financing'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
