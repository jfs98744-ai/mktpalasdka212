import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  Printer, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Archive, 
  Eye, 
  EyeOff, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Tag, 
  ShieldCheck, 
  User, 
  DollarSign,
  Maximize2,
  Video,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Property, PropertyHistoryEntry } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel, getStatusLabel } from '../utils/storage';
import { generateQRCodeDataUrl, buildPublicPropertyUrl } from '../utils/qrHelper';

interface PropertyDossierModalProps {
  property: Property | null;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onCreateContract: (property: Property) => void;
  onReserve: (property: Property) => void;
  onCancelReserve: (property: Property) => void;
  onRecordSale: (property: Property) => void;
  onAddHistoryNote: (propertyId: string, noteTitle: string, noteText: string) => void;
  onShowPublicQR: (property: Property) => void;
}

export function PropertyDossierModal({
  property,
  onClose,
  onEdit,
  onCreateContract,
  onReserve,
  onCancelReserve,
  onRecordSale,
  onAddHistoryNote,
  onShowPublicQR,
}: PropertyDossierModalProps) {
  if (!property) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOwnerDetails, setShowOwnerDetails] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  const publicUrl = buildPublicPropertyUrl(property.id);
  const statusBadge = getStatusLabel(property.status);

  useEffect(() => {
    generateQRCodeDataUrl(publicUrl).then((url) => setQrDataUrl(url));
  }, [property.id, publicUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteText.trim()) return;
    onAddHistoryNote(property.id, newNoteTitle.trim(), newNoteText.trim());
    setNewNoteTitle('');
    setNewNoteText('');
    setShowAddNoteForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                  {property.id}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
                <span className="text-xs text-slate-400">
                  {getPropertyTypeLabel(property.type)} • {property.dealType === 'sale' ? 'معروض للبيع' : 'معروض للإيجار'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                الملف الإلكتروني الشامل: {property.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="طباعة إضبارة العقار"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">طباعة الإضبارة</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-right">
          
          {/* Top Operational Action Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onEdit(property)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>تعديل المعلومات</span>
              </button>

              {property.status === 'available' ? (
                <button
                  onClick={() => onReserve(property)}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>تثبيت حجز (عربون)</span>
                </button>
              ) : property.status === 'reserved' ? (
                <button
                  onClick={() => onCancelReserve(property)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  إلغاء الحجز وإعادة التوفير
                </button>
              ) : null}

              {property.status !== 'sold' && property.status !== 'rented' && (
                <button
                  onClick={() => onCreateContract(property)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{property.dealType === 'sale' ? 'إنشاء مكاتبة بيع' : 'إنشاء عقد إيجار'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onShowPublicQR(property)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>كارت الـ QR للعرض</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 transition-colors"
                title="نسخ رابط صفحة العميل"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Reservation / Sale Alert Box if applicable */}
          {property.status === 'reserved' && property.reservationDetails && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-amber-900 block text-sm">العقار محجوز بعربون رسمي</span>
                <p className="text-amber-800">
                  المشتري/المستأجر: <strong>{property.reservationDetails.clientName}</strong> ({property.reservationDetails.clientPhone}) | 
                  العربون المدفوع: <strong>{formatPrice(property.reservationDetails.depositAmount, property.reservationDetails.currency)}</strong> | 
                  تاريخ انتهاء الحجز: <strong>{property.reservationDetails.expiryDate}</strong>
                </p>
                {property.reservationDetails.notes && (
                  <p className="text-amber-700 italic">ملاحظات: {property.reservationDetails.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Sale details if archived/sold */}
          {(property.status === 'sold' || property.status === 'rented') && property.saleDetails && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-blue-900 block text-sm">تفاصيل الصفقة المنجزة (الأرشيف)</span>
                <p className="text-blue-800">
                  المشتري: <strong>{property.saleDetails.buyerName}</strong> ({property.saleDetails.buyerPhone}) | 
                  سعر الإغلاق: <strong>{formatPrice(property.saleDetails.salePrice, property.saleDetails.currency)}</strong> | 
                  عمولة المكتب: <strong>{formatPrice(property.saleDetails.commission, property.saleDetails.currency)}</strong> | 
                  تاريخ البيع: <strong>{property.saleDetails.saleDate}</strong>
                </p>
                {property.saleDetails.contractId && (
                  <p className="text-blue-700 font-semibold">مرتبط بالمكاتبة رقم: {property.saleDetails.contractId}</p>
                )}
              </div>
            </div>
          )}

          {/* Gallery + Primary Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gallery (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={property.images[activeImageIndex] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur font-mono">
                  صورة {activeImageIndex + 1} من {property.images.length || 1}
                </div>
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              {property.videoUrl && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>فيديو معاينة العقار الموثق:</span>
                  </h4>
                  <div className="aspect-video w-full max-h-[300px] rounded-lg overflow-hidden bg-black border border-slate-800">
                    <video src={property.videoUrl} controls className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>الوصف ومواصفات العقار</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Right 5 Cols: Exact Specs & Location & Owner Info */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Financial Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400">السعر المطلوب</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-0.5">
                      {formatPrice(property.price, property.currency)}
                    </h3>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-bold">
                    {property.dealType === 'sale' ? 'بيع قطعي' : `إيجار (${property.rentPeriod === 'monthly' ? 'شهري' : 'سنوي'})`}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>المساحة الإجمالية:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{formatArea(property.area)}</span>
                </div>
              </div>

              {/* Full Address Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>الموقع الجغرافي والإداري (العنوان الدقيق)</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">المحافظة:</span>
                    <span className="font-bold text-slate-800">{property.province}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">المنطقة / الحي:</span>
                    <span className="font-bold text-slate-800">{property.district}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">رقم المحلة:</span>
                    <span className="font-bold text-slate-800 font-mono">{property.mahalla || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">رقم الزقاق:</span>
                    <span className="font-bold text-slate-800 font-mono">{property.zuqaq || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">رقم الدار / القطعة:</span>
                    <span className="font-bold text-slate-800 font-mono">{property.houseNo || '—'}</span>
                  </div>
                </div>

                {property.landmark && (
                  <div className="text-xs text-slate-600 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-slate-800">أقرب نقطة دالة: </span>
                    {property.landmark}
                  </div>
                )}
              </div>

              {/* Engineering Specs */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>المواصفات والأبعاد الهندسية</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">غرف النوم</span>
                    <span className="font-bold text-slate-900">{property.bedrooms}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">الحمامات</span>
                    <span className="font-bold text-slate-900">{property.bathrooms}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">عدد الطوابق</span>
                    <span className="font-bold text-slate-900">{property.floors || 1}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">عرض الواجهة</span>
                    <span className="font-bold text-slate-900">{property.facadeWidth ? `${property.facadeWidth} م` : '—'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">النزال (العمق)</span>
                    <span className="font-bold text-slate-900">{property.depth ? `${property.depth} م` : '—'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">الصنف</span>
                    <span className="font-bold text-slate-900">{getPropertyTypeLabel(property.type)}</span>
                  </div>
                </div>
              </div>

              {/* Private Owner Info Section (Office Private) */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-slate-900">بيانات صاحب العقار (سرية للمكتب)</span>
                  </div>
                  <button
                    onClick={() => setShowOwnerDetails(!showOwnerDetails)}
                    className="text-xs text-amber-800 hover:text-amber-900 flex items-center gap-1 font-semibold"
                  >
                    {showOwnerDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showOwnerDetails ? 'إخفاء' : 'إظهار'}</span>
                  </button>
                </div>

                {showOwnerDetails ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">اسم المالك:</span>
                      <strong className="text-slate-900 font-bold">{property.owner.name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">رقم الهاتف:</span>
                      <a 
                        href={`tel:${property.owner.phone}`} 
                        className="font-mono font-bold text-amber-800 hover:underline"
                        dir="ltr"
                      >
                        {property.owner.phone}
                      </a>
                    </div>
                    {property.owner.nationalId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">الرقم الوطني / الهوية:</span>
                        <span className="font-mono text-slate-700">{property.owner.nationalId}</span>
                      </div>
                    )}
                    {property.owner.notes && (
                      <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-amber-200/50">
                        <strong>ملاحظات المالك: </strong> {property.owner.notes}
                      </div>
                    )}
                    {property.internalNotes && (
                      <div className="text-[11px] text-red-900 bg-red-50 p-2 rounded border border-red-200">
                        <strong>ملاحظات داخلية للمكتب: </strong> {property.internalNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    البيانات الشخصية للمالك مخفية حالياً (آمن للعرض أمام الزبون)
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* History Timeline Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">السجل التاريخي والعمليات السابقة للعقار</h3>
                  <p className="text-xs text-slate-500">حفظ وتوثيق كافة العمليات (تسجيل، تعديلات السعر، الحجوزات، المكاتبات، البيع)</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة قيد / ملاحظة للسجل</span>
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNoteForm && (
              <form onSubmit={handleAddNote} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="عنوان العملية (مثال: زيارة معاينة للزبون، تفاوض على السعر)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="p-2 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="التفاصيل والملاحظات..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="p-2 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNoteForm(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    حفظ في السجل
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Stream */}
            <div className="space-y-3">
              {property.history.map((entry) => (
                <div key={entry.id} className="relative pr-6 pb-2 border-r-2 border-amber-400 last:border-transparent">
                  <div className="absolute -right-1.5 top-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{entry.title}</span>
                      <span className="font-mono text-[11px] text-slate-500">{entry.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{entry.description}</p>
                    {entry.performedBy && (
                      <span className="text-[10px] text-amber-800 font-medium block">
                        بواسطة: {entry.performedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>تم الإنشاء: {new Date(property.createdAt).toLocaleDateString('ar-IQ')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
          >
            إغلاق الملف
          </button>
        </div>

      </div>
    </div>
  );
}
