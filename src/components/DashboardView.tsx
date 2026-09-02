import { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  Plus, 
  MapPin, 
  Key, 
  Tag,
  AlertCircle,
  Percent,
  Calendar,
  Layers
} from 'lucide-react';
import { Property, ClientRequest, Contract, OfficeSettings } from '../types';
import { formatPrice, getPropertyTypeLabel, getStatusLabel } from '../utils/storage';
import { findMatchingProperties } from '../utils/matcher';

interface DashboardViewProps {
  properties: Property[];
  clientRequests: ClientRequest[];
  contracts: Contract[];
  officeSettings: OfficeSettings;
  onSelectProperty: (property: Property) => void;
  onAddNewProperty: () => void;
  onAddNewClient: () => void;
  onNewContract: (property?: Property) => void;
  onNavigateTab: (tab: string) => void;
}

export function DashboardView({
  properties,
  clientRequests,
  contracts,
  officeSettings,
  onSelectProperty,
  onAddNewProperty,
  onAddNewClient,
  onNewContract,
  onNavigateTab,
}: DashboardViewProps) {
  // Commission display visibility toggler
  const [showCommissions, setShowCommissions] = useState(false);

  // Statistics calculations
  const availableProps = properties.filter((p) => p.status === 'available');
  const reservedProps = properties.filter((p) => p.status === 'reserved');
  const soldProps = properties.filter((p) => p.status === 'sold');
  const rentedProps = properties.filter((p) => p.status === 'rented');
  const activeClients = clientRequests.filter((c) => c.status === 'active');

  // Financial aggregates
  const totalSalesVolumeIQD = properties
    .filter((p) => p.status === 'sold' && p.saleDetails)
    .reduce((sum, p) => sum + (p.saleDetails?.salePrice || 0), 0);

  const totalCommissionsIQD = properties
    .filter((p) => (p.status === 'sold' || p.status === 'rented') && p.saleDetails)
    .reduce((sum, p) => sum + (p.saleDetails?.commission || 0), 0);

  // Property types distribution
  const typeCounts = properties.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Districts distribution
  const districtCounts = properties.reduce((acc, p) => {
    acc[p.district] = (acc[p.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top smart matches
  const topMatches = activeClients
    .map((client) => {
      const matches = findMatchingProperties(client, properties);
      return {
        client,
        bestMatch: matches[0],
        matchCount: matches.length,
      };
    })
    .filter((item) => item.bestMatch && item.bestMatch.score >= 70)
    .slice(0, 3);

  // Recent timeline activities across all properties
  const allHistory = properties
    .flatMap((p) =>
      p.history.map((h) => ({
        ...h,
        propertyId: p.id,
        propertyTitle: p.title,
        propertyObj: p,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Fast Operations Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>مرحبا بك في النظام العقاري المعتمد</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {officeSettings.officeName}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              نظام إلكتروني متكامل لإدارة العقارات المعروضة، توليد كود الـ QR، أرشفة المعاملات، إنشاء المكاتبات الرسمية، ومطابقة طلبات الزبائن فورياً.
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddNewProperty}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>تسجيل عقار جديد</span>
            </button>

            <button
              onClick={onAddNewClient}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>تسجيل طلب زبون</span>
            </button>

            <button
              onClick={() => onNewContract()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>إنشاء مكاتبة رسمية</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Available Properties */}
        <div 
          onClick={() => onNavigateTab('properties')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">العقارات المعروضة</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{availableProps.length}</span>
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">متوفر حالياً</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{availableProps.filter(p => p.dealType === 'sale').length} للبيع • {availableProps.filter(p => p.dealType === 'rent').length} للإيجار</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
          </div>
        </div>

        {/* Reserved Properties */}
        <div 
          onClick={() => onNavigateTab('properties')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">العقارات المحجوزة</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{reservedProps.length}</span>
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">عربون مثبت</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>قيد إجراءات التسجيل والمكاتبة</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600" />
          </div>
        </div>

        {/* Closed Deals & Archive */}
        <div 
          onClick={() => onNavigateTab('archive')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المبيعات والأرشيف</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{soldProps.length + rentedProps.length}</span>
            <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded">صفقة مغلقة</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{soldProps.length} مباع • {rentedProps.length} مؤجر</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
          </div>
        </div>

        {/* Active Client Requests */}
        <div 
          onClick={() => onNavigateTab('clients')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">طلبات الزبائن النشطة</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeClients.length}</span>
            <span className="text-xs text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded">طلب قيد المتابعة</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{topMatches.length} طلبات لها مطابقة فورية</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600" />
          </div>
        </div>

      </div>

      {/* Main Grid: Smart Client Matches + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Smart Auto-Matches for Clients */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">تنبيهات المطابقة الذكية بين الزبائن والعقارات</h2>
                  <p className="text-xs text-slate-500">عقارات متوفرة تتطابق مع طلبات الزبائن المسجلة في النظام</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('clients')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline"
              >
                عرض كل الطلبات ({activeClients.length})
              </button>
            </div>

            {topMatches.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">لا توجد مطابقات حالية أو لم يتم تسجيل طلبات زبائن جديدة بعد</p>
                <button
                  onClick={onAddNewClient}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  تسجيل طلب جديد
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {topMatches.map(({ client, bestMatch }, index) => {
                  const prop = bestMatch.property;
                  return (
                    <div
                      key={client.id}
                      className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{client.clientName}</span>
                          <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                            {client.phone}
                          </span>
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            مطابقة {bestMatch.score}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          يبحث عن: <strong className="text-slate-800">{getPropertyTypeLabel(client.propertyType)} ({client.dealType === 'sale' ? 'شراء' : 'استئجار'})</strong> في {client.preferredDistricts.join('، ')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-amber-900">
                          <span className="font-semibold text-slate-800">العقار المقترح:</span>
                          <button
                            onClick={() => onSelectProperty(prop)}
                            className="font-bold text-amber-700 hover:underline flex items-center gap-1"
                          >
                            [{prop.id}] {prop.title} ({formatPrice(prop.price, prop.currency)})
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectProperty(prop)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض العقار</span>
                        </button>
                        <button
                          onClick={() => onNewContract(prop)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                        >
                          إنشاء مكاتبة
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Available Featured Properties */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">أحدث العقارات المضافة للمنظومة</h2>
              <button
                onClick={() => onNavigateTab('properties')}
                className="text-xs text-amber-700 hover:underline font-bold"
              >
                تصفح المعروضات ({availableProps.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableProps.slice(0, 4).map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex gap-3 group bg-white"
                >
                  <img
                    src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
                    alt={prop.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {prop.id}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {prop.district}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-1 group-hover:text-amber-700 transition-colors">
                        {prop.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-900">
                        {formatPrice(prop.price, prop.currency)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {prop.area} م²
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Office Activity Log & Location/Type distribution */}
        <div className="space-y-6">
          
          {/* Quick Stats Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>توزيع العقارات حسب الصنف</span>
            </h2>

            <div className="space-y-2.5">
              {Object.entries(typeCounts).map(([typeKey, count]) => {
                const percentage = Math.round((count / properties.length) * 100) || 0;
                return (
                  <div key={typeKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{getPropertyTypeLabel(typeKey)}</span>
                      <span className="font-bold text-slate-900">{count} عقار ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 mb-2">المناطق الأكثر نشاطاً:</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(districtCounts).slice(0, 6).map(([dist, count]) => (
                  <span key={dist} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {dist} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log Stream */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>سجل النشاطات والعمليات الأخيرة</span>
            </h2>

            <div className="space-y-3">
              {allHistory.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد عمليات مسجلة حتى الآن.</p>
              ) : (
                allHistory.map((item, idx) => (
                  <div key={item.id || idx} className="text-right border-r-2 border-amber-400 pr-3 py-0.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{item.title}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{item.date.split('T')[0]}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                    <button
                      onClick={() => onSelectProperty(item.propertyObj)}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      عقار: [{item.propertyId}] {item.propertyTitle}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* قسم أرباح وعمولات المكتب (مخفي/مظهر بزر العين بل الأخير) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Percent className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">أرباح وعمولات المكتب المحصلة (الدلالية)</h3>
              <p className="text-xs text-slate-500">حسابات الإيرادات والعمولات الإجمالية للصفقات المغلقة بالمكتب</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCommissions(!showCommissions)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-400 text-xs font-bold transition-all border border-slate-800 shadow-sm"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{showCommissions ? 'إخفاء الأرباح السرية' : 'عرض الأرباح والعمولات'}</span>
          </button>
        </div>

        {showCommissions && (
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">إجمالي عمولات الصفقات المحصلة بالمكتب:</span>
                <strong className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mt-1 block">
                  {formatPrice(totalCommissionsIQD, 'IQD')}
                </strong>
              </div>
              <div className="w-16 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                د.ع
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">النسبة القياسية للعمولة:</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-100">{officeSettings.defaultCommissionPercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">الصفقات والتبايعات المكتملة:</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-100">{soldProps.length + rentedProps.length} صفقة عقارية</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">للحصول على كشوف تفصيلية:</span>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="text-emerald-700 hover:text-emerald-800 hover:underline font-bold text-xs"
                >
                  عرض التقرير المالي المفصل ←
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
