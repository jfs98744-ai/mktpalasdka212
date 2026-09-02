import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Property, ReservationDetails, Currency } from '../types';
import { formatPrice } from '../utils/storage';

interface ReservationModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReservation: (propertyId: string, details: ReservationDetails) => void;
}

export function ReservationModal({
  property,
  isOpen,
  onClose,
  onConfirmReservation,
}: ReservationModalProps) {
  if (!isOpen || !property) return null;

  const [clientName, setClientName] = useState(property.reservationDetails?.clientName || '');
  const [clientPhone, setClientPhone] = useState(property.reservationDetails?.clientPhone || '');
  const [depositAmount, setDepositAmount] = useState<number>(
    property.reservationDetails?.depositAmount || Math.round(property.price * 0.05)
  );
  const [currency, setCurrency] = useState<Currency>(property.currency);
  const [date, setDate] = useState(
    property.reservationDetails?.date || new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    property.reservationDetails?.expiryDate || 
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(property.reservationDetails?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || depositAmount <= 0) {
      alert('يرجى إدخال اسم العميل ورقم الهاتف ومبلغ العربون بشكل صحيح');
      return;
    }

    const details: ReservationDetails = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      depositAmount,
      currency,
      date,
      expiryDate,
      notes: notes.trim(),
    };

    onConfirmReservation(property.id, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        
        {/* Header */}
        <div className="bg-amber-500 text-slate-950 p-4 sm:p-5 flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">تثبيت حجز عقار وقبض عربون</h3>
              <p className="text-xs text-amber-950 font-medium">العقار: [{property.id}] {property.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-900 hover:text-slate-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p>
              تثبيت الحجز يغير حالة العقار إلى <strong>محجوز</strong> في النظام لمنع تكرار العرض لحين استكمال إجراءات المكاتبة أو انتهاء مدة العربون.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المشتري / المستأجر الحازم</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="الاسم الثلاثي..."
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  required
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف العميل</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="0770..."
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                  required
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ العربون المقبوض</label>
              <input
                type="number"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عملة العربون</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                disabled
              >
                <option value="IQD">دينار عراقي (IQD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ دفع العربون</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ انتهاء صلاحية الحجز</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وشروط العربون</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: لحين استكمال تدقيق صحة الصدور والتنازل في التسجيل العقاري..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs h-16"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>تأكيد الحجز وتحديث الحالة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
