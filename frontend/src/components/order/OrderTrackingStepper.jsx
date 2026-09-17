// src/components/order/OrderTrackingStepper.jsx
// Visual 5-Step Order Tracking Progress Stepper for AURA / OBJEK

import React from 'react';
import { Check, Clock, PackageCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export const OrderTrackingStepper = ({ status = 'pending', notes = null }) => {
  const normStatus = (status || 'pending').toLowerCase();

  // Mapping status to active step index (0 to 4)
  let currentStep = 0;
  if (normStatus === 'pending') {
    currentStep = 0;
  } else if (normStatus === 'accepted') {
    currentStep = 1;
  } else if (normStatus === 'processing') {
    currentStep = 2;
  } else if (normStatus === 'shipped') {
    currentStep = 3;
  } else if (normStatus === 'delivered' || normStatus === 'completed') {
    currentStep = 4;
  } else if (normStatus === 'cancelled') {
    currentStep = -1; // Cancelled state
  }

  const steps = [
    { label: 'Pesanan Dibuat', icon: Clock, desc: 'Menunggu pembayaran' },
    { label: 'Pembayaran Lunas', icon: CheckCircle2, desc: 'Dikonfirmasi sistem' },
    { label: 'Sedang Dikemas', icon: PackageCheck, desc: 'Diproses oleh Seller' },
    { label: 'Dalam Pengiriman', icon: Truck, desc: 'Diserahkan ke kurir' },
    { label: 'Pesanan Selesai', icon: Check, desc: 'Diterima pembeli' },
  ];

  if (normStatus === 'cancelled') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
        <div>
          <span className="font-bold uppercase tracking-wider block">Pesanan Dibatalkan</span>
          <span className="text-rose-600 text-[11px]">
            Pesanan ini telah dibatalkan dan tidak lagi diproses.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Desktop Stepper Bar */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting Background Line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#E5E0D8] -z-0" />
        {/* Connecting Active Progress Line */}
        <div
          className="absolute top-4 left-6 h-[2px] bg-[#171717] -z-0 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, (currentStep / (steps.length - 1)) * 100))}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 text-center w-24">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-[#171717] text-[#F5F1E8] border border-[#171717]'
                    : isCurrent
                    ? 'bg-[#F4512A] text-[#F5F1E8] border-2 border-[#171717] ring-4 ring-[#F4512A]/20'
                    : 'bg-[#FAF8F2] text-[#6B675F] border border-[#D8D2C6]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <span
                className={`font-mono text-[10px] uppercase tracking-wider mt-2.5 ${
                  isCurrent
                    ? 'font-bold text-[#171717]'
                    : isDone
                    ? 'text-[#171717]'
                    : 'text-[#6B675F]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="sm:hidden space-y-3 pl-2 border-l-2 border-[#171717]/20 font-mono text-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-start gap-2.5 relative">
              <div
                className={`w-4 h-4 rounded-full -ml-[17px] mt-0.5 shrink-0 flex items-center justify-center text-[9px] ${
                  isDone
                    ? 'bg-[#171717] text-white'
                    : isCurrent
                    ? 'bg-[#F4512A] text-white ring-2 ring-[#F4512A]/30'
                    : 'bg-[#FAF8F2] border border-[#D8D2C6] text-[#6B675F]'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <p className={`uppercase tracking-wider ${isCurrent ? 'font-bold text-[#171717]' : isDone ? 'text-[#171717]' : 'text-[#6B675F]'}`}>
                  {step.label}
                </p>
                <span className="text-[10px] text-[#6B675F] block">{step.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Number / Notes Pill if Available */}
      {notes && (
        <div className="mt-3 p-3 bg-[#FAF8F2] border border-[#D8D2C6] font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F4512A]" />
            <span className="text-[#171717] font-bold">{notes}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#6B675F]">Ekspedisi Terverifikasi</span>
        </div>
      )}
    </div>
  );
};
