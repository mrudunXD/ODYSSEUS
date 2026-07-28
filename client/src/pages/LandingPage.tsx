import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, QrCode, ArrowRight, CheckCircle2, Lock, FileText, BellRing, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A]">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 lg:px-12 py-4 shadow-xs">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E85D04] text-white flex items-center justify-center font-black text-lg shadow-sm">
              <span>S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
              SchoolFin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF0E6] border border-[#E85D04]/20 rounded-full text-xs font-extrabold text-[#E85D04]">
            <Sparkles className="w-4 h-4" />
            Next-Gen School Financial Operations
          </span>

          <h1 className="text-4xl lg:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
            Production-Grade School Fee Management Platform
          </h1>

          <p className="text-base text-[#6B7280] font-medium leading-relaxed max-w-2xl">
            Streamline fee collection, reconcile counter cash & cheques, automate late fee penalties, and provide zero-fee UPI and Razorpay online checkouts for educational institutions.
          </p>

          <div className="flex items-center gap-4 justify-center lg:justify-start pt-2">
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3.5 bg-[#E85D04] hover:bg-[#C44D00] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#E85D04]/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign In to SchoolFin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E5E7EB] text-xs">
            <div>
              <span className="text-xl font-extrabold text-[#1A1A1A] block">100%</span>
              <span className="text-[#6B7280]">HMAC Verified</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#1A1A1A] block">₹0 Fee</span>
              <span className="text-[#6B7280]">UPI Settlements</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#1A1A1A] block">256-Bit</span>
              <span className="text-[#6B7280]">SSL Security</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <span className="text-xs font-extrabold text-[#1A1A1A]">Live Financial Summary</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-[#16A34A] rounded-full text-[10px] font-bold border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Total Term Revenue</span>
                  <span className="text-2xl font-extrabold text-[#1A1A1A]">{formatCurrency(210550)}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] font-bold block">Active Students</span>
                  <span className="text-base font-extrabold text-[#1A1A1A]">100 Enrolled</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] font-bold block">Overdue Balance</span>
                  <span className="text-base font-extrabold text-[#DC2626]">{formatCurrency(25700)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white py-16 border-t border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1A1A1A]">
              Comprehensive School Finance Infrastructure
            </h2>
            <p className="text-xs text-[#6B7280] mt-2">
              Everything required to manage fees, track defaulters, and audit transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F5F5F0] p-6 rounded-3xl border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E85D04] text-white flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Omnichannel Payments</h3>
              <p className="text-xs text-[#6B7280]">
                Integrates Razorpay Standard Checkout with HMAC-SHA256 signature verification and zero-fee UPI QR codes.
              </p>
            </div>

            <div className="bg-[#F5F5F0] p-6 rounded-3xl border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center font-bold">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Defaulters Control Center</h3>
              <p className="text-xs text-[#6B7280]">
                Automated daily late penalty calculations (₹50/day), overdue days aging, and 1-click WhatsApp/email notices.
              </p>
            </div>

            <div className="bg-[#F5F5F0] p-6 rounded-3xl border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Audit Trail & RBAC</h3>
              <p className="text-xs text-[#6B7280]">
                Strict server-enforced Role-Based Access Control and immutable transaction audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 text-center text-xs text-[#6B7280]">
        <p>Springfield International School Fin Platform | Built with React, Vite, Express & Prisma ORM.</p>
      </footer>
    </div>
  );
};
