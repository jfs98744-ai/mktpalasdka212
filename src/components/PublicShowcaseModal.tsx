import { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Eye, 
  Phone, 
  ShieldCheck,
  Send,
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { Property, OfficeSettings } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '../utils/storage';
import { generateQRCodeDataUrl, buildPublicPropertyUrl } from '../utils/qrHelper';

interface PublicShowcaseModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  officeSettings: OfficeSettings;
}

export function PublicShowcaseModal({
  property,
  isOpen,
  onClose,
  officeSettings,
}: PublicShowcaseModalProps) {
  if (!isOpen || !property) return null;

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'client_mobile'>('card');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const publicUrl = buildPublicPropertyUrl(property.id);

  useEffect(() => {
    generateQRCodeDataUrl(publicUrl).then((url) => setQrCodeUrl(url));
  }, [property.id, publicUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `السلام عليكم، تفضل بمعاينة ملف العقار (${property.id}):\n${property.title}\nالمساحة: ${property.area} م²\nالسعر: ${formatPrice(property.price, property.currency)}\nالموقع: ${property.province} - ${property.district}\n\nرابط المعاينة:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] text-right">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-amber-400 text-xs">
                {property.id} • بطاقة العرض والـ QR الذكي
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                مشاركة العقار مع الزبائن وطباعة البوستر التسويقي
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'card' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                بطاقة التسويق والطباعة
              </button>
              <button
                onClick={() => setActiveTab('client_mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'client_mobile' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>شاشة الزبون بعد المسح</span>
              </button>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-100 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 no-print text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-semibold">
              حماية الخصوصية مفعلة: معلومات المالك ورقم هاتفه محجوبة تماماً عن الزبائن ويظهر رقم هاتف المكتب فقط.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال عبر واتساب</span>
            </button>

            <button
              onClick={handlePrintCard}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة كارت الـ QR</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {activeTab === 'card' ? (
            /* PRINTABLE / MARKETING CARD */
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-xl print-container print:border-none print:shadow-none space-y-6">
              
              {/* Header Office Info */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">{officeSettings.officeName}</h1>
                  <p className="text-xs text-slate-600 font-semibold">{officeSettings.officeTagline}</p>
                  <p className="text-[11px] text-slate-500 mt-1">العنوان: {officeSettings.address}</p>
                  <p className="text-xs text-slate-800 font-mono font-bold" dir="ltr">
                    هاتف: {officeSettings.phone1} | {officeSettings.phone2}
                  </p>
                </div>

                <div className="text-left">
                  <span className="font-mono text-sm font-black bg-slate-900 text-amber-400 px-3 py-1 rounded-lg">
                    {property.id}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">كود العقار الحصري</p>
                </div>
              </div>

              {/* Property Image & QR Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                
                <div className="sm:col-span-2 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                  <img
                    src={property.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/90 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md">
                    {property.dealType === 'sale' ? 'معروض للبيع' : 'معروض للإيجار'}
                  </div>
                </div>

                {/* QR Code Block */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-36 h-36 border border-slate-800 p-1 rounded-lg bg-white" />
                  ) : (
                    <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg" />
                  )}
                  <p className="text-[11px] font-bold text-slate-800">امسح الكود بكاميرا هاتفك لمعاينة الصور والمواصفات الكاملة</p>
                </div>

              </div>

              {/* Title & Key Stats */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">{property.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
                    {getPropertyTypeLabel(property.type)}
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
                    المساحة: {formatArea(property.area)}
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
                    الموقع: {property.province} - {property.district}
                  </span>
                  {property.bedrooms > 0 && (
                    <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
                      {property.bedrooms} غرف نوم
                    </span>
                  )}
                </div>
              </div>

              {/* Price Banner */}
              <div className="bg-amber-500/15 border-2 border-amber-500 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-950 font-bold block">السعر المطلوب:</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-950">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  {property.dealType === 'rent' && (
                    <span className="text-xs text-slate-600 mr-1">
                      {property.rentPeriod === 'yearly' ? '/ سنوي' : '/ شهري'}
                    </span>
                  )}
                </div>

                <div className="text-left">
                  <span className="text-xs text-slate-700 font-bold block">للحجز والاستفسار الفوري:</span>
                  <span className="text-sm font-bold text-slate-950 font-mono" dir="ltr">
                    {officeSettings.phone1}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
                جميع الحقوق محفوظة لدى {officeSettings.officeName} • تم توليد هذا المستند إلكترونياً
              </div>

            </div>
          ) : (
            /* SIMULATED CLIENT MOBILE SCREEN */
            <div className="max-w-sm mx-auto bg-white rounded-3xl border-8 border-slate-900 shadow-2xl overflow-hidden text-right">
              
              {/* Phone Top Notch */}
              <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[11px]">
                <span>9:41</span>
                <span className="font-mono text-amber-400 text-xs font-bold">{property.id}</span>
                <span>5G 100%</span>
              </div>

              {/* Mobile Content */}
              <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
                
                {/* Gallery */}
                <div className="space-y-2">
                  <div className="aspect-video rounded-xl overflow-hidden relative shadow-sm">
                    <img
                      src={property.images[activeImageIndex] || property.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {activeImageIndex + 1} / {property.images.length}
                    </div>
                  </div>

                  {property.images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {property.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                            activeImageIndex === i ? 'border-amber-500 scale-95' : 'border-transparent opacity-70'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title & Price */}
                <div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {property.dealType === 'sale' ? 'معروض للبيع' : 'معروض للإيجار'} • {getPropertyTypeLabel(property.type)}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{property.title}</h3>
                  <div className="text-lg font-black text-slate-950 mt-1">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{property.province} - {property.district} {property.landmark ? `(قرب ${property.landmark})` : ''}</span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">المساحة</span>
                    <strong className="text-slate-900">{formatArea(property.area)}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">الغرف</span>
                    <strong className="text-slate-900">{property.bedrooms} غرف</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">الطوابق</span>
                    <strong className="text-slate-900">{property.floors}</strong>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    <p>{property.description}</p>
                  </div>
                )}

                {/* Office Contact Button */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${officeSettings.phone1.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن العقار المعروض برمز (${property.id}):\n${property.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>تواصل مع {officeSettings.officeName} عبر واتساب</span>
                  </a>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
