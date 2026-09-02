import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Eye, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { Contract, Property, OfficeSettings } from '../types';
import { formatPrice } from '../utils/storage';

interface ContractsViewProps {
  contracts: Contract[];
  properties: Property[];
  officeSettings: OfficeSettings;
  onNewContract: () => void;
  onViewContract: (contract: Contract) => void;
  onSelectProperty: (property: Property) => void;
}

export function ContractsView({
  contracts,
  properties,
  officeSettings,
  onNewContract,
  onViewContract,
  onSelectProperty,
}: ContractsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale_deed' | 'rent_agreement'>('all');

  const filteredContracts = contracts.filter((c) => {
    if (typeFilter !== 'all' && c.contractType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        c.id.toLowerCase().includes(q) ||
        c.propertyId.toLowerCase().includes(q) ||
        c.propertyDetails.title.toLowerCase().includes(q) ||
        c.seller.name.toLowerCase().includes(q) ||
        c.buyer.name.toLowerCase().includes(q) ||
        c.seller.phone.includes(q) ||
        c.buyer.phone.includes(q);
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
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل المكاتبات والعقود الرسمية</h1>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredContracts.length} مكاتبة موثقة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              أرشيف المكاتبات وعقود الإيجار والبيع المبرمة داخل المكتب مع إمكانية الطباعة والمعاينة والتحقق الإلكتروني.
            </p>
          </div>

          <button
            onClick={onNewContract}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>تحرير مكاتبة جديدة</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم المكاتبة (CT-2026-088) أو اسم البائع أو المشتري أو رقم العقار..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 rounded-xl text-xs font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="sm:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع المكاتبات والعقود</option>
              <option value="sale_deed">مكاتبات بيع وشراء فقط</option>
              <option value="rent_agreement">عقود إيجار موثقة فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Cards List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد مكاتبات مسجلة تطابق البحث</h3>
          <p className="text-xs text-slate-500">
            يمكنك إنشاء مكاتبة جديدة فوراً واختيار العقار لتعبئة بياناته تلقائياً.
          </p>
          <button
            onClick={onNewContract}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
          >
            تحرير مكاتبة جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((contract) => {
            const relatedProp = properties.find((p) => p.id === contract.propertyId);

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-amber-400 px-2.5 py-1 rounded-lg">
                        {contract.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        contract.contractType === 'sale_deed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {contract.contractType === 'sale_deed' ? 'مكاتبة بيع وشراء' : 'عقد إيجار'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{contract.date}</span>
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {contract.propertyId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{contract.propertyDetails.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      {contract.propertyDetails.province} - {contract.propertyDetails.district} • المساحة: {contract.propertyDetails.area} م²
                    </p>
                  </div>

                  {/* Parties Box */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">البائع / المؤجر:</span>
                      <strong className="text-slate-900 block font-bold truncate">{contract.seller.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">{contract.seller.phone}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">المشتري / المستأجر:</span>
                      <strong className="text-slate-900 block font-bold truncate">{contract.buyer.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">{contract.buyer.phone}</span>
                    </div>
                  </div>

                  {/* Financials Row */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">المبلغ الإجمالي</span>
                      <strong className="text-base font-extrabold text-slate-950">
                        {formatPrice(contract.financials.totalAmount, contract.financials.currency)}
                      </strong>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-medium">عمولة المكتب</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {formatPrice(contract.financials.commissionAmount, contract.financials.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {relatedProp ? (
                    <button
                      onClick={() => onSelectProperty(relatedProp)}
                      className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>فتح ملف العقار</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">ملف العقار مؤرشف</span>
                  )}

                  <button
                    onClick={() => onViewContract(contract)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>عرض وطباعة المكاتبة</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
