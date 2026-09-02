import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  FileText, 
  Printer, 
  Calendar, 
  Download,
  ArrowUpRight,
  PieChart as PieIcon,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Property, Contract, ClientRequest, OfficeSettings } from '../types';
import { formatPrice, formatArea } from '../utils/storage';

interface ReportsViewProps {
  properties: Property[];
  archivedProperties: Property[];
  contracts: Contract[];
  clientRequests: ClientRequest[];
  officeSettings: OfficeSettings;
}

export function ReportsView({
  properties,
  archivedProperties,
  contracts,
  clientRequests,
  officeSettings,
}: ReportsViewProps) {
  const [period, setPeriod] = useState<'all' | 'year' | 'month'>('all');

  const allProps = [...properties, ...archivedProperties];
  const availableProps = properties.filter((p) => p.status === 'available');
  const reservedProps = properties.filter((p) => p.status === 'reserved');
  const soldProps = allProps.filter((p) => p.status === 'sold');
  const rentedProps = allProps.filter((p) => p.status === 'rented');

  // Financial calculations
  const totalSalesVolumeIQD = soldProps
    .reduce((acc, p) => acc + (p.saleDetails?.salePrice || p.price), 0);

  const totalCommissionsIQD = soldProps
    .reduce((acc, p) => acc + (p.saleDetails?.commission || Math.round(p.price * (officeSettings.defaultCommissionPercentage / 100))), 0) +
    rentedProps
      .reduce((acc, p) => acc + (p.saleDetails?.commission || Math.round(p.price * 0.05)), 0);

  // Property types distribution
  const typeCounts: Record<string, number> = {};
  allProps.forEach((p) => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });

  // District distribution
  const districtCounts: Record<string, number> = {};
  allProps.forEach((p) => {
    districtCounts[p.district] = (districtCounts[p.district] || 0) + 1;
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">لوحة الإحصائيات والتقارير المالية</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تقرير الأداء العام للمكتب العقاري، حركة المبيعات والإيجارات، وأرباح العمولات والدلالية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة تقرير الإدارة المالي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Layout */}
      <div className="space-y-6 print-container">
        
        {/* Print Header */}
        <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-950">{officeSettings.officeName}</h1>
              <p className="text-xs text-slate-700">تقرير الإحصائيات والحركة العقارية والمالية الشامل</p>
            </div>
            <div className="text-left text-xs font-mono">
              <p>تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-IQ')}</p>
              <p>الهاتف: {officeSettings.phone1}</p>
            </div>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">إجمالي المبيعات المحققة</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {formatPrice(totalSalesVolumeIQD, 'IQD')}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              عبر {soldProps.length} صفقات بيع ناجحة
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">أرباح عمولات المكتب (د.ع)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {formatPrice(totalCommissionsIQD, 'IQD')}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              مجموع عمولات مبيعات وإيجارات صفقات المكتب
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">المعروض المتاح حالياً</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">
              {availableProps.length} <span className="text-xs text-slate-400 font-normal">عقار معروض</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              بالإضافة إلى {reservedProps.length} عقارات محجوزة بعربون
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">المكاتبات والزبائن</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-700">
              {contracts.length} <span className="text-xs text-slate-400 font-normal">مكاتبة</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {clientRequests.length} طلبات زبائن مسجلة بالمنظومة
            </p>
          </div>

        </div>

        {/* Detailed Breakdown Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Completed Deals Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>سجل الصفقات المغلقة والعمولات المحصلة</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">{soldProps.length + rentedProps.length} صفقة</span>
            </h3>

            <div className="space-y-3">
              {[...soldProps, ...rentedProps].slice(0, 5).map((prop) => (
                <div
                  key={prop.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {prop.id}
                      </span>
                      <strong className="text-slate-900">{prop.title}</strong>
                    </div>
                    <p className="text-slate-500">
                      {prop.district} • المشتري: {prop.saleDetails?.buyerName || 'عميل المكتب'}
                    </p>
                  </div>

                  <div className="text-left space-y-0.5">
                    <strong className="text-slate-950 block font-black">
                      {formatPrice(prop.saleDetails?.salePrice || prop.price, prop.saleDetails?.currency || prop.currency)}
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      عمولة: {formatPrice(prop.saleDetails?.commission || Math.round(prop.price * 0.02), prop.saleDetails?.currency || prop.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area & Region Density */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <PieIcon className="w-4 h-4 text-amber-600" />
              <span>توزيع العقارات جغرافياً حسب المناطق والأحياء</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(districtCounts).map(([district, count]) => {
                const percentage = Math.round((count / allProps.length) * 100) || 0;
                return (
                  <div key={district} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{district}</span>
                      <span className="text-slate-500 font-mono">{count} عقار ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
