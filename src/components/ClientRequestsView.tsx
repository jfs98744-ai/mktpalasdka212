import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Sparkles, 
  Phone, 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Eye,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { ClientRequest, Property, PropertyType, DealType, Currency } from '../types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '../utils/storage';
import { findMatchingProperties, MatchResult } from '../utils/matcher';

interface ClientRequestsViewProps {
  clientRequests: ClientRequest[];
  properties: Property[];
  onAddClient: (req: Partial<ClientRequest>) => void;
  onUpdateClient: (req: ClientRequest) => void;
  onDeleteClient: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onCreateContract: (property: Property, buyerName?: string, buyerPhone?: string) => void;
}

const COMMON_DISTRICTS = ['الكرادة', 'المنصور', 'الجادرية', 'زيونة', 'اليرموك', 'حي الجامعة', 'الحارثية', 'القادسية', 'الدورة', 'الزعفرانية', 'الغزالية', 'السيدية', 'شارع فلسطين', 'الأعظمية', 'الشعب'];

export function ClientRequestsView({
  clientRequests,
  properties,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSelectProperty,
  onCreateContract,
}: ClientRequestsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientIdToDelete, setClientIdToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'fulfilled'>('all');
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | DealType>('all');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Modal for adding/editing client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRequest | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [dealType, setDealType] = useState<DealType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('house');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [province, setProvince] = useState('بغداد');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['الكرادة']);
  const [customDistrict, setCustomDistrict] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingClient(null);
    setClientName('');
    setPhone('');
    setDealType('sale');
    setPropertyType('house');
    setMinArea('150');
    setMaxArea('300');
    setProvince('بغداد');
    setSelectedDistricts(['الكرادة']);
    setMinBudget('');
    setMaxBudget('');
    setCurrency('IQD');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientRequest) => {
    setEditingClient(client);
    setClientName(client.clientName);
    setPhone(client.phone);
    setDealType(client.dealType);
    setPropertyType(client.propertyType);
    setMinArea(client.minArea ? client.minArea.toString() : '');
    setMaxArea(client.maxArea ? client.maxArea.toString() : '');
    setProvince(client.province);
    setSelectedDistricts(client.preferredDistricts);
    setMinBudget(client.minBudget ? client.minBudget.toString() : '');
    setMaxBudget(client.maxBudget ? client.maxBudget.toString() : '');
    setCurrency(client.currency);
    setNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const toggleDistrict = (d: string) => {
    if (selectedDistricts.includes(d)) {
      setSelectedDistricts(selectedDistricts.filter((item) => item !== d));
    } else {
      setSelectedDistricts([...selectedDistricts, d]);
    }
  };

  const handleAddCustomDistrict = () => {
    if (customDistrict.trim() && !selectedDistricts.includes(customDistrict.trim())) {
      setSelectedDistricts([...selectedDistricts, customDistrict.trim()]);
      setCustomDistrict('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) {
      alert('يرجى كتابة اسم العميل ورقم الهاتف');
      return;
    }

    const payload: Partial<ClientRequest> = {
      clientName: clientName.trim(),
      phone: phone.trim(),
      dealType,
      propertyType,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      province,
      preferredDistricts: selectedDistricts.length > 0 ? selectedDistricts : ['الكرادة'],
      minBudget: minBudget ? parseFloat(minBudget) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      currency,
      notes: notes.trim() || undefined,
    };

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        ...payload,
      } as ClientRequest);
    } else {
      onAddClient(payload);
    }

    setIsModalOpen(false);
  };

  // Filter client list
  const filteredClients = clientRequests.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (dealTypeFilter !== 'all' && c.dealType !== dealTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        c.clientName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.preferredDistricts.some((d) => d.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل طلبات الزبائن والمطابقة الذكية</h1>
              <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredClients.length} طلب
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تسجيل رغبات المشترين والمستأجرين، ومطابقتها آلياً مع العقارات المتوفرة في المنظومة وإشعارك بالفرص المباشرة.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>تسجيل طلب زبون جديد</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الزبون، رقم الهاتف، أو المنطقة المطلوبة..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-500 rounded-xl text-xs font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">طلبات نشطة قيد المتابعة</option>
              <option value="fulfilled">طلبات تم إنجازها</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">كل الرغبات (شراء وإيجار)</option>
              <option value="sale">راغب بالشراء</option>
              <option value="rent">راغب بالاستئجار</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client List with Matching Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">لا توجد طلبات زبائن مسجلة تطابق التصفية</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              سجل رغبات ومواصفات العقارات التي يطلبها الزبائن للربط التلقائي وتسهيل عمليات البيع والإيجار.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            تسجيل طلب زبون جديد
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const matches = findMatchingProperties(client, properties);
            const isExpanded = expandedClientId === client.id;

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-purple-300 transition-all overflow-hidden"
              >
                {/* Client Main Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Client Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        {client.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{client.clientName}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        client.dealType === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {client.dealType === 'sale' ? 'يبحث عن شراء' : 'يبحث عن إيجار'}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {getPropertyTypeLabel(client.propertyType)}
                      </span>
                      {client.status === 'fulfilled' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          تمت التلبية بنجاح
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-800" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                        <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                      </span>
                      <span>
                        المساحة: <strong>{client.minArea || 0} - {client.maxArea || 'مفتوح'} م²</strong>
                      </span>
                      <span>
                        الميزانية: <strong>{client.maxBudget ? formatPrice(client.maxBudget, client.currency) : 'غير محددة'}</strong>
                      </span>
                      <span>
                        المناطق المفضلة: <strong>{client.preferredDistricts.join('، ')}</strong>
                      </span>
                    </div>

                    {client.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        ملاحظات الطلب: {client.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions and Match Badge */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    
                    {/* Auto Match Trigger Button */}
                    <button
                      onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        matches.length > 0
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>العقارات المطابقة ({matches.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => openEditModal(client)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="تعديل الطلب"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setClientIdToDelete(client.id);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

                {/* Expanded Smart Matches Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200/80 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>نتائج المطابقة الذكية للعميل ({client.clientName}) من واقع المعروضات الحالية:</span>
                      </h4>
                    </div>

                    {matches.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        لا يوجد عقار مطابق حالياً بنفس المساحة والميزانية والمنطقة.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matches.map(({ property, score, matchedReasons }) => (
                          <div
                            key={property.id}
                            className="bg-white p-3.5 rounded-xl border border-amber-200/90 shadow-sm flex flex-col justify-between gap-3 hover:border-amber-400 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-xs">
                                    {property.id}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{property.title}</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {property.district} • {formatArea(property.area)} • <strong>{formatPrice(property.price, property.currency)}</strong>
                                </p>
                              </div>

                              <span className="text-xs font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                تطابق {score}%
                              </span>
                            </div>

                            {/* Match Highlights */}
                            <div className="flex flex-wrap gap-1 text-[11px] text-emerald-700">
                              {matchedReasons.map((r, idx) => (
                                <span key={idx} className="bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ✓ {r}
                                </span>
                              ))}
                            </div>

                            {/* Operations */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <button
                                onClick={() => onSelectProperty(property)}
                                className="text-xs text-slate-800 hover:text-amber-700 font-bold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة العقار</span>
                              </button>

                              <button
                                onClick={() => onCreateContract(property, client.clientName, client.phone)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>إنشاء مكاتبة فورية</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">
                  {editingClient ? 'تعديل طلب الزبون' : 'تسجيل طلب زبون جديد في المنظومة'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-right">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الزبون / العميل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: د. حيدر العبيدي"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم هاتف الزبون <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0770xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المعاملة المطلوبة</label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value as DealType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="sale">شراء عقار (راغب بالشراء)</option>
                    <option value="rent">استئجار عقار (راغب بالإيجار)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع العقار المطلوب</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="all">أي نوع (غير محدد)</option>
                    <option value="house">دار سكني</option>
                    <option value="apartment">شقة سكنية</option>
                    <option value="land">قطعة أرض</option>
                    <option value="commercial">محل / تجاري</option>
                    <option value="villa">فيلا فاخرة</option>
                    <option value="building">عمارة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المساحة المطلوبة (م²)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="أدنى م²"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="number"
                      placeholder="أقصى م²"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الميزانية والقدرة المالية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="أقصى ميزانية"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                      disabled
                    >
                      <option value="IQD">IQD د.ع</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المناطق والأحياء المفضلة:</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {COMMON_DISTRICTS.map((dist) => {
                    const isSelected = selectedDistricts.includes(dist);
                    return (
                      <button
                        type="button"
                        key={dist}
                        onClick={() => toggleDistrict(dist)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {dist}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="إضافة منطقة أخرى مخصصة..."
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDistrict}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  إضافة
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وطلبات خاصة للعميل</label>
                <textarea
                  rows={2}
                  placeholder="مثال: يفضل دفع نقدي كاش، يشترط وجود كراج سيارات أو طابو ملك صرف..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingClient ? 'حفظ التعديل' : 'تسجيل وبدء المطابقة'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Client Delete Confirmation Modal */}
      {clientIdToDelete && (() => {
        const clientToDelete = clientRequests.find(c => c.id === clientIdToDelete);
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4" dir="rtl">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">حذف طلب الزبون؟</h3>
                <p className="text-xs text-slate-500">
                  هل أنت متأكد من رغبتك في حذف طلب العميل <strong className="text-purple-700">{clientToDelete?.clientName || 'هذا'}</strong> ذو الكود <strong className="font-mono text-purple-700">{clientIdToDelete}</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onDeleteClient(clientIdToDelete);
                    setClientIdToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  نعم، احذف الطلب
                </button>
                <button
                  onClick={() => setClientIdToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  تراجع وإلغاء
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
