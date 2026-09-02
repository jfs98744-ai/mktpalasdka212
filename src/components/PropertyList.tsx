import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Building2, 
  Grid, 
  List, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Plus, 
  MapPin, 
  BedDouble, 
  Bath, 
  Layers, 
  Compass, 
  Phone, 
  Tag, 
  Share2, 
  X,
  Sparkles,
  Printer,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Property, PropertyType, DealType, PropertyStatus } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel, getStatusLabel } from '../utils/storage';

interface PropertyListProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onAddNewProperty: () => void;
  onShowQR: (property: Property) => void;
  onCreateContract: (property: Property) => void;
  onRecordSale: (property: Property) => void;
  onReserveProperty: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function PropertyList({
  properties,
  onSelectProperty,
  onAddNewProperty,
  onShowQR,
  onCreateContract,
  onRecordSale,
  onReserveProperty,
  onDeleteProperty,
  searchQuery,
  setSearchQuery,
}: PropertyListProps) {
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | DealType>('all');
  const [propertyIdToDelete, setPropertyIdToDelete] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | PropertyType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [roomsFilter, setRoomsFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'area_desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Available districts
  const districts = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.district) set.add(p.district);
    });
    return Array.from(set);
  }, [properties]);

  // Active inventory only (excluding sold & rented which live in Archive)
  const activeInventory = useMemo(() => {
    return properties.filter((p) => p.status === 'available' || p.status === 'reserved');
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return activeInventory.filter((prop) => {
      // 1. Text Search (ID, Title, District, Province, Mahalla, Zuqaq, HouseNo, Features, Description, Owner)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText =
          prop.id.toLowerCase().includes(q) ||
          prop.title.toLowerCase().includes(q) ||
          prop.district.toLowerCase().includes(q) ||
          prop.province.toLowerCase().includes(q) ||
          (prop.mahalla && prop.mahalla.includes(q)) ||
          (prop.zuqaq && prop.zuqaq.includes(q)) ||
          (prop.houseNo && prop.houseNo.toLowerCase().includes(q)) ||
          (prop.landmark && prop.landmark.toLowerCase().includes(q)) ||
          prop.features.some((f) => f.toLowerCase().includes(q)) ||
          prop.description.toLowerCase().includes(q) ||
          prop.owner.name.toLowerCase().includes(q) ||
          prop.owner.phone.includes(q);

        if (!matchesText) return false;
      }

      // 2. Deal Type
      if (dealTypeFilter !== 'all' && prop.dealType !== dealTypeFilter) {
        return false;
      }

      // 3. Property Type
      if (typeFilter !== 'all' && prop.type !== typeFilter) {
        return false;
      }

      // 4. Status
      if (statusFilter !== 'all' && prop.status !== statusFilter) {
        return false;
      }

      // 5. District
      if (districtFilter !== 'all' && prop.district !== districtFilter) {
        return false;
      }

      // 6. Price Range
      if (minPrice && prop.price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && prop.price > parseFloat(maxPrice)) {
        return false;
      }

      // 7. Area Range
      if (minArea && prop.area < parseFloat(minArea)) {
        return false;
      }
      if (maxArea && prop.area > parseFloat(maxArea)) {
        return false;
      }

      // 8. Rooms
      if (roomsFilter !== 'all') {
        const minRooms = parseInt(roomsFilter, 10);
        if (prop.bedrooms < minRooms) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'area_desc') {
        return b.area - a.area;
      }
      return 0;
    });
  }, [
    activeInventory,
    searchQuery,
    dealTypeFilter,
    typeFilter,
    statusFilter,
    districtFilter,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    roomsFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setDealTypeFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setDistrictFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setRoomsFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    dealTypeFilter !== 'all' || 
    typeFilter !== 'all' || 
    statusFilter !== 'all' || 
    districtFilter !== 'all' || 
    minPrice !== '' || 
    maxPrice !== '' || 
    minArea !== '' || 
    maxArea !== '' || 
    roomsFilter !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Fast Filter Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل العقارات والمعروضات</h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredProperties.length} من {activeInventory.length} عقار متوفر
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              قاعدة بيانات العقارات الحالية، مع كود إلكتروني و QR Code خاص لكل عقار وسجل تاريخي ومكاتبة فورية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddNewProperty}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>تسجيل عقار جديد</span>
            </button>

            <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="عرض شبكي"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="عرض قائمة"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Search Input and Quick Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالرقم (AQ-1001)، المنطقة، المحلة، الزقاق، رقم الدار، المواصفات، المالك..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-amber-500"
            >
              <option value="all">كل العروض (بيع وإيجار)</option>
              <option value="sale">معروض للبيع فقط</option>
              <option value="rent">معروض للإيجار فقط</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-amber-500"
            >
              <option value="all">جميع الأصناف</option>
              <option value="house">دار سكني</option>
              <option value="apartment">شقة سكنية</option>
              <option value="land">قطعة أرض</option>
              <option value="commercial">محل / تجاري</option>
              <option value="villa">فيلا فاخرة</option>
              <option value="building">عمارة / مجمع</option>
              <option value="farm">بستان / مزرعة</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>فلاتر متقدمة</span>
            </button>
          </div>

        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">تصفية سريعة:</span>
          
          <button
            onClick={() => { setDealTypeFilter('all'); setStatusFilter('all'); }}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              dealTypeFilter === 'all' && statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الكل ({activeInventory.length})
          </button>

          <button
            onClick={() => { setDealTypeFilter('sale'); setStatusFilter('available'); }}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              dealTypeFilter === 'sale' && statusFilter === 'available'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            للبيع فقط ({activeInventory.filter(p => p.dealType === 'sale' && p.status === 'available').length})
          </button>

          <button
            onClick={() => { setDealTypeFilter('rent'); setStatusFilter('available'); }}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              dealTypeFilter === 'rent' && statusFilter === 'available'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            للإيجار فقط ({activeInventory.filter(p => p.dealType === 'rent' && p.status === 'available').length})
          </button>

          <button
            onClick={() => setStatusFilter('reserved')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              statusFilter === 'reserved'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            المحجوزة بعربون ({activeInventory.filter(p => p.status === 'reserved').length})
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700 font-bold px-2 py-1 flex items-center gap-1 hover:underline mr-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء التصفية</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl">
            
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة / الحي</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="all">كل المناطق</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نطاق السعر</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="من"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="إلى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Area Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المساحة (م²)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="أدنى م²"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="أقصى م²"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ترتيب النتائج</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="newest">الأحدث إضافة</option>
                <option value="price_asc">السعر (من الأقل للأعلى)</option>
                <option value="price_desc">السعر (من الأعلى للأقل)</option>
                <option value="area_desc">المساحة (الأكبر أولاً)</option>
              </select>
            </div>

          </div>
        )}
      </div>

      {/* Property Results List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">لا توجد عقارات تطابق معايير البحث</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              جرب تخفيف شروط البحث أو التحقق من كتابة رقم العقار أو المنطقة، أو قم بتسجيل عقار جديد في المنظومة.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              إلغاء جميع الفلاتر
            </button>
            <button
              onClick={onAddNewProperty}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
            >
              تسجيل عقار جديد
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const statusBadge = getStatusLabel(prop.status);
            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-amber-400/80 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image and Badges */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs bg-slate-950/90 text-amber-400 px-2.5 py-1 rounded-lg backdrop-blur border border-amber-500/30 shadow-md">
                      {prop.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.8 rounded-lg shadow-sm border backdrop-blur ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-md ${
                      prop.dealType === 'sale' ? 'bg-emerald-600/95' : 'bg-blue-600/95'
                    }`}>
                      {prop.dealType === 'sale' ? 'للبيع' : `للإيجار ${prop.rentPeriod === 'monthly' ? 'شهرياً' : 'سنوياً'}`}
                    </span>
                    {onDeleteProperty && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertyIdToDelete(prop.id);
                        }}
                        className="p-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg shadow-md transition-colors"
                        title="حذف العقار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{prop.province} - {prop.district}</span>
                    </div>
                    <span className="bg-slate-900/80 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
                      {formatArea(prop.area)}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {getPropertyTypeLabel(prop.type)}
                      </span>
                      {prop.mahalla && (
                        <span className="text-[11px] text-slate-500">
                          م {prop.mahalla} • ز {prop.zuqaq || '-'} • دار {prop.houseNo || '-'}
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => onSelectProperty(prop)}
                      className="text-base font-bold text-slate-900 mt-2 line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {prop.description}
                    </p>
                  </div>

                  {/* Specs Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs text-slate-600">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 font-medium">الغرف</span>
                      <span className="font-bold text-slate-800">{prop.bedrooms || '—'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium">الحمامات</span>
                      <span className="font-bold text-slate-800">{prop.bathrooms || '—'}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 font-medium">الواجهة</span>
                      <span className="font-bold text-slate-800 truncate px-1 max-w-[80px]">
                        {prop.facadeOrientation || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Price and Owner info snippet */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">السعر المطلوب:</span>
                      <span className="text-lg font-black text-slate-950">
                        {formatPrice(prop.price, prop.currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => onShowQR(prop)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="عرض وطباعة QR Code العقار"
                    >
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span className="hidden sm:inline">كارت QR</span>
                    </button>
                  </div>

                  {/* Operational Action Buttons Bar */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض العقار</span>
                    </button>

                    <button
                      onClick={() => onCreateContract(prop)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{prop.dealType === 'sale' ? 'بيع (مكاتبة)' : 'تحرير عقد إيجار'}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List Layout */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">كود العقار</th>
                  <th className="p-3.5">العقار والعنوان</th>
                  <th className="p-3.5">الصنف</th>
                  <th className="p-3.5">المساحة</th>
                  <th className="p-3.5">السعر</th>
                  <th className="p-3.5">المالك</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات وسريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => {
                  const statusBadge = getStatusLabel(prop.status);
                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {prop.id}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div 
                          onClick={() => onSelectProperty(prop)}
                          className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer"
                        >
                          {prop.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {prop.province} - {prop.district} {prop.mahalla ? `(م ${prop.mahalla} ز ${prop.zuqaq || '-'})` : ''}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {getPropertyTypeLabel(prop.type)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {formatArea(prop.area)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-950">
                        {formatPrice(prop.price, prop.currency)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{prop.owner.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{prop.owner.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectProperty(prop)}
                            className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                            title="عرض العقار"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onShowQR(prop)}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 rounded-lg"
                            title="QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCreateContract(prop)}
                            className="p-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500"
                            title={prop.dealType === 'sale' ? "تحرير مكاتبة بيع" : "تحرير عقد إيجار"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteProperty && (
                            <button
                              onClick={() => setPropertyIdToDelete(prop.id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                              title="حذف العقار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {propertyIdToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4" dir="rtl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">حذف العقار نهائياً؟</h3>
              <p className="text-xs text-slate-500">
                هل أنت متأكد من رغبتك في حذف العقار ذو الكود <strong className="font-mono text-amber-700">{propertyIdToDelete}</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteProperty?.(propertyIdToDelete);
                  setPropertyIdToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                نعم، احذف العقار
              </button>
              <button
                onClick={() => setPropertyIdToDelete(null)}
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
