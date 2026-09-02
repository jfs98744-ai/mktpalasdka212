import { useState } from 'react';
import { 
  Archive, 
  Search, 
  RotateCcw, 
  Eye, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { Property, Contract, OfficeSettings } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '../utils/storage';

interface ArchiveViewProps {
  archivedProperties: Property[];
  contracts: Contract[];
  onSelectProperty: (property: Property) => void;
  onRestoreProperty: (propertyId: string) => void;
  onViewContract: (contract: Contract) => void;
}

export function ArchiveView({
  archivedProperties,
  contracts,
  onSelectProperty,
  onRestoreProperty,
  onViewContract,
}: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyIdToRestore, setPropertyIdToRestore] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sold' | 'rented' | 'withdrawn'>('all');

  const filtered = archivedProperties.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.owner.name.toLowerCase().includes(q) ||
        p.owner.phone.includes(q) ||
        (p.saleDetails?.buyerName && p.saleDetails.buyerName.toLowerCase().includes(q)) ||
        (p.saleDetails?.buyerPhone && p.saleDetails.buyerPhone.includes(q));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الأرشيف العقاري وسجل العمليات السابقة</h1>
              <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filtered.length} عقار مؤرشف
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              أرشيف دائم لكافة العقارات المباعة والمؤجرة والمسحوبة. لا يُحذف أي عقار نهائياً مع إمكانية استرجاع تاريخ العمليات أو إعادة تفعيل العرض.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم العقار، العنوان، اسم البائع، أو اسم المشتري السابق..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-500 rounded-xl text-xs font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">كل الحالات في الأرشيف</option>
              <option value="sold">عقارات مباعة بالكامل</option>
              <option value="rented">عقارات مؤجرة</option>
              <option value="withdrawn">عقارات مسحوبة / متوقفة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Archived Properties List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Archive className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد عقارات مطابقة في الأرشيف</h3>
          <p className="text-xs text-slate-500">
            عند إتمام البيع أو الإيجار لعقار متوفر، يتم تحويله وحفظ كامل سجلاته هنا تلقائياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prop) => {
            const relatedContract = contracts.find((c) => c.propertyId === prop.id);

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-slate-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                        {prop.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        prop.status === 'sold'
                          ? 'bg-red-100 text-red-800'
                          : prop.status === 'rented'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {prop.status === 'sold' ? 'مباع ومكتمل' : prop.status === 'rented' ? 'مؤجر' : 'مسحوب'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>أُضيف: {prop.createdAt ? new Date(prop.createdAt).toLocaleDateString('ar-IQ') : '-'}</span>
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="flex gap-3">
                    <img
                      src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 grayscale contrast-125"
                    />
                    <div className="space-y-1 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prop.title}</h3>
                      <p className="text-xs text-slate-500">
                        {getPropertyTypeLabel(prop.type)} • {formatArea(prop.area)} • {prop.province} - {prop.district}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        السعر الأصلي: {formatPrice(prop.price, prop.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Outcome Box */}
                  {prop.saleDetails && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
                        <span>بيانات الإغلاق والتعامل:</span>
                        <span className="font-mono text-emerald-800">
                          {formatPrice(prop.saleDetails.salePrice, prop.saleDetails.currency)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 block">الطرف المشتري / المستأجر:</span>
                          <strong className="text-slate-900">{prop.saleDetails.buyerName}</strong>
                          <p className="text-[10px] font-mono" dir="ltr">{prop.saleDetails.buyerPhone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">تاريخ العملية:</span>
                          <strong className="text-slate-900 font-mono">{prop.saleDetails.saleDate}</strong>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            العمولة: {formatPrice(prop.saleDetails.commission, prop.saleDetails.currency)}
                          </p>
                        </div>
                      </div>

                      {prop.saleDetails.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                          ملاحظات: {prop.saleDetails.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Previous Owner Details */}
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>صاحب العقار السابق: <strong>{prop.owner.name}</strong></span>
                    <span className="font-mono" dir="ltr">{prop.owner.phone}</span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض كامل الملف</span>
                    </button>

                    {relatedContract && (
                      <button
                        onClick={() => onViewContract(relatedContract)}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>المكاتبة</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPropertyIdToRestore(prop.id);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة تفعيل وعرض</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Custom Property Restore Confirmation Modal */}
      {propertyIdToRestore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4" dir="rtl">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6 animate-spin text-amber-600" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">إعادة تفعيل العقار؟</h3>
              <p className="text-xs text-slate-500">
                هل تريد إعادة تفعيل العقار ذو الكود <strong className="font-mono text-amber-700">{propertyIdToRestore}</strong> وإعادته من الأرشيف إلى قائمة العقارات المتوفرة للعرض المباشر؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onRestoreProperty(propertyIdToRestore);
                  setPropertyIdToRestore(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
              >
                نعم، قم بإعادة التفعيل
              </button>
              <button
                onClick={() => setPropertyIdToRestore(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                تراجع وإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
