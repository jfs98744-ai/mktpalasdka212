import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Layers, 
  Compass, 
  Calendar, 
  Phone, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  Info, 
  Sparkles,
  ExternalLink,
  Video
} from 'lucide-react';
import { Property, OfficeSettings } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '../utils/storage';

interface PublicPropertyViewProps {
  property: Property;
  officeSettings: OfficeSettings;
  onBackToDashboard?: () => void;
}

export function PublicPropertyView({
  property,
  officeSettings,
  onBackToDashboard
}: PublicPropertyViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [property.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `السلام عليكم، أستفسر عن العقار المعروض برمز (${property.id}):\n"${property.title}"\nالمساحة: ${property.area} م²\nالسعر: ${formatPrice(property.price, property.currency)}\nالموقع: ${property.province} - ${property.district}`;
  
  const whatsappUrl = `https://wa.me/${officeSettings.phone1.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(shareMessage)}`;
  const phoneCallUrl = `tel:${officeSettings.phone1}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      
      {/* Top Brand Banner */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl w-full mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">{officeSettings.officeName}</h1>
              <p className="text-[10px] sm:text-xs text-amber-400 font-medium">{officeSettings.officeTagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700/60"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>لوحة التحكم للمكتب</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Security / Quality Check Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-5.5 h-5.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs sm:text-sm">
            <span className="font-bold text-emerald-900 block">عرض عقار موثق ومعتمد</span>
            <p className="text-emerald-800 leading-relaxed">
              هذا الملف معتمد ومسجل رسمياً لدى <strong>{officeSettings.officeName}</strong>. معلومات الخصوصية والمالكين محجوبة ومحمية لضمان أمان المعاملة وسيرها القانوني عبر مكتبنا المعتمد.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Right Column: Media & Description (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Main Showcase Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200">
              <img
                src={property.images[activeImageIndex] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-950/80 text-amber-400 px-3 py-1 rounded-lg backdrop-blur-md border border-amber-500/20">
                  {property.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow bg-emerald-500/90 text-white`}>
                  متاح للحجز
                </span>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-md font-mono">
                صورة {activeImageIndex + 1} من {property.images.length || 1}
              </div>
            </div>

            {/* Thumbnails Carousel */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all snap-start ${
                      activeImageIndex === idx ? 'border-amber-500 scale-102 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Preview if available */}
            {property.videoUrl && (
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Video className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>معاينة الفيديو الترويجي الموثق للعقار:</span>
                </h4>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                  <video src={property.videoUrl} controls className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Property Title & Main Attributes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-lg">
                  {getPropertyTypeLabel(property.type)}
                </span>
                <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg">
                  {property.dealType === 'sale' ? 'معروض للبيع' : `للإيجار ${property.rentPeriod === 'monthly' ? 'الشهري' : 'السنوي'}`}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {property.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-3">
                {property.description}
              </p>
            </div>

          </div>

          {/* Left Column: Quick Stats, Contact & Map Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Price Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md text-center space-y-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">السعر المطلوب</span>
                <strong className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 block">
                  {formatPrice(property.price, property.currency)}
                </strong>
                {property.dealType === 'rent' && (
                  <span className="text-xs text-slate-300">
                    / دفعة {property.rentPeriod === 'yearly' ? 'سنوية' : 'شهرية'} متفق عليها
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">المساحة الإجمالية:</span>
                  <strong className="text-sm font-bold text-white font-mono">{formatArea(property.area)}</strong>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block text-[11px]">سعر المتر التقريبي:</span>
                  <strong className="text-sm font-bold text-white font-mono">
                    {formatPrice(Math.round(property.price / property.area), property.currency)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>المواصفات الفنية والهندسية</span>
              </h4>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/70">
                  <span className="text-[10px] text-slate-400 block mb-0.5">غرف النوم</span>
                  <strong className="text-slate-800 text-sm font-black">{property.bedrooms}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/70">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الحمامات</span>
                  <strong className="text-slate-800 text-sm font-black">{property.bathrooms}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/70">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الطوابق</span>
                  <strong className="text-slate-800 text-sm font-black">{property.floors}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/70 col-span-3 grid grid-cols-2 gap-2 text-right px-3 py-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">عرض الواجهة</span>
                    <strong className="text-slate-800 text-xs font-bold">{property.facadeWidth ? `${property.facadeWidth} م` : '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">النزال (العمق)</span>
                    <strong className="text-slate-800 text-xs font-bold">{property.depth ? `${property.depth} م` : '—'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Neighborhood */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>العنوان والموقع الجغرافي</span>
              </h4>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">المحافظة:</span>
                  <span className="font-bold text-slate-800">{property.province}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">المنطقة / الحي:</span>
                  <span className="font-bold text-slate-800">{property.district}</span>
                </div>
                
                {property.landmark && (
                  <div className="p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[11px] leading-relaxed">
                    <strong>أقرب نقطة دالة: </strong> {property.landmark}
                  </div>
                )}
              </div>
            </div>

            {/* Call Actions Panel */}
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-500 shadow-lg space-y-3 text-center">
              <span className="text-xs text-slate-500 font-bold block">هل أنت مهتم بهذا العقار؟ تواصل معنا فوراً</span>
              
              <div className="space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <Send className="w-4 h-4 fill-white stroke-none" />
                  <span>تواصل معنا عبر واتساب</span>
                </a>

                <a
                  href={phoneCallUrl}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 border border-slate-800"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>اتصال هاتفي مباشر للمكتب</span>
                </a>
              </div>

              {/* Utility Tools */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={handleCopyLink}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم نسخ الرابط' : 'نسخ رابط الصفحة'}</span>
                </button>

                <span className="text-slate-400 font-mono text-[10px]">كود: {property.id}</span>
              </div>
            </div>

            {/* Office Stamp Footer Card */}
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1.5">
              <strong className="text-xs text-slate-800 block">{officeSettings.officeName}</strong>
              <p className="text-[10px] text-slate-500">العنوان: {officeSettings.address}</p>
              <p className="text-[10px] text-slate-500 font-mono" dir="ltr">هاتف: {officeSettings.phone1}</p>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-800 text-[11px] font-semibold mt-12">
        <div className="max-w-6xl w-full mx-auto px-4 space-y-1">
          <p>جميع المعلومات الواردة في هذه الصفحة مرخصة وموثقة رسمياً لدى {officeSettings.officeName}.</p>
          <p>© {new Date().getFullYear()} {officeSettings.officeName}. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  );
}
