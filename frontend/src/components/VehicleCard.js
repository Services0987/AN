import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Fuel, ArrowRight, Star } from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=60';

export default function VehicleCard({ vehicle, index = 0 }) {
  const img = vehicle.images?.[0] || PLACEHOLDER;
  const isNew = vehicle.condition === 'new';
  const isFeatured = vehicle.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="vehicle-card glass-card overflow-hidden group"
      data-testid={`vehicle-card-${vehicle.id}`}
    >
      <Link to={`/vehicle/${vehicle.id}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={img}
            alt={vehicle.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2 py-1 text-xs font-heading font-semibold tracking-wider uppercase ${
              isNew ? 'bg-emerald-500 text-white' : 'bg-[#D4AF37] text-black'
            }`}>
              {isNew ? 'New' : 'Used'}
            </span>
            {isFeatured && (
              <span className="px-2 py-1 text-xs font-heading font-semibold tracking-wider uppercase bg-white/10 backdrop-blur-sm text-white flex items-center gap-1">
                <Star size={9} fill="currentColor" /> Featured
              </span>
            )}
          </div>

          {vehicle.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-heading text-2xl font-bold tracking-widest border-2 border-white/30 px-6 py-2 rotate-[-15deg]">SOLD</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-heading text-white font-medium text-base leading-tight mb-1 group-hover:text-[#D4AF37] transition-colors duration-200 line-clamp-2">
            {vehicle.title}
          </h3>

          <div className="flex items-center gap-4 mb-4 mt-2">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-body">
              <Gauge size={12} />
              <span>{vehicle.mileage === 0 ? '0 km' : `${vehicle.mileage.toLocaleString()} km`}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-body">
              <Fuel size={12} />
              <span>{vehicle.fuel_type}</span>
            </div>
            <span className="text-white/20 text-xs font-body">{vehicle.year}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#D4AF37] font-heading font-semibold text-xl">
                ${vehicle.price.toLocaleString()}
              </p>
              <p className="text-white/30 text-xs font-body">+ taxes & fees</p>
            </div>
            <div className="flex items-center gap-1 text-white/40 group-hover:text-[#D4AF37] transition-colors duration-200 text-xs font-body tracking-wider uppercase">
              <span>Details</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
