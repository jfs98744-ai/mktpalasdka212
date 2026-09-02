import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Layers, 
  Image as ImageIcon, 
  User, 
  FileText, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Upload,
  Link,
  ShieldAlert,
  Info,
  Video
} from 'lucide-react';
import { Property, PropertyType, DealType, Currency, PropertyOwner } from '../types';
import { generateNextPropertyId } from '../utils/storage';

interface AddEditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Partial<Property>) => void;
  editingProperty: Property | null;
  existingProperties: Property[];
}

const COMMON_PROVINCES = ['بغداد', 'أربيل', 'البصرة', 'النجف الأشرف', 'كربلاء المقدسة', 'السليمانية', 'دهوك', 'بابل', 'نينوى', 'الأنبار', 'ديالى', 'واسط', 'ميسان', 'ذي قار', 'المثنى', 'صلاح الدين', 'كركوك', 'القادسية'];

const COMMON_FEATURES = [
  'سند ملكية طابو ملك صرف',
  'سند زراعي / إقرار قضائي',
  'كراج سيارات واسع',
  'حديقة منسقة',
  'بناء حديث 2024 درجة أولى',
  'واجهة حجر / مرمر تركي',
  'مسبح خاص',
  'مصعد ذكي',
  'منظومة كاميرات ومراقبة',
  'خط كهرباء مولدة سحب مباشر',
  'موقع تجاري حيوي',
  'مفروشة بالكامل أثاث فاخر',
  'إطلالة على نهر / شارع رئيسي',
  'حراسة وأمن 24 ساعة'
];

export function AddEditPropertyModal({
  isOpen,
  onClose,
  onSave,
  editingProperty,
  existingProperties,
}: AddEditPropertyModalProps) {
  if (!isOpen) return null;

  const isEdit = !!editingProperty;

  // Form State
  const [propertyCode, setPropertyCode] = useState(
    editingProperty ? editingProperty.id : generateNextPropertyId(existingProperties)
  );
  const [title, setTitle] = useState(editingProperty?.title || '');
  const [type, setType] = useState<PropertyType>(editingProperty?.type || 'house');
  const [dealType, setDealType] = useState<DealType>(editingProperty?.dealType || 'sale');
  const [rentPeriod, setRentPeriod] = useState<'monthly' | 'yearly'>(editingProperty?.rentPeriod || 'monthly');
  const [area, setArea] = useState<string>(editingProperty?.area ? editingProperty.area.toString() : '');
  const [price, setPrice] = useState<string>(editingProperty?.price ? editingProperty.price.toString() : '');
  const [currency, setCurrency] = useState<Currency>(editingProperty?.currency || 'IQD');

  // Location Hierarchy
  const [province, setProvince] = useState(editingProperty?.province || 'بغداد');
  const [district, setDistrict] = useState(editingProperty?.district || 'الكرادة');
  const [mahalla, setMahalla] = useState(editingProperty?.mahalla || '');
  const [zuqaq, setZuqaq] = useState(editingProperty?.zuqaq || '');
  const [houseNo, setHouseNo] = useState(editingProperty?.houseNo || '');
  const [landmark, setLandmark] = useState(editingProperty?.landmark || '');

  // Specs
  const [bedrooms, setBedrooms] = useState<string>(editingProperty?.bedrooms !== undefined ? editingProperty.bedrooms.toString() : '3');
  const [bathrooms, setBathrooms] = useState<string>(editingProperty?.bathrooms !== undefined ? editingProperty.bathrooms.toString() : '2');
  const [floors, setFloors] = useState<string>(editingProperty?.floors !== undefined ? editingProperty.floors.toString() : '2');
  const [facadeOrientation, setFacadeOrientation] = useState(editingProperty?.facadeOrientation || 'شمالية');
  const [facadeWidth, setFacadeWidth] = useState<string>(editingProperty?.facadeWidth ? editingProperty.facadeWidth.toString() : '');
  const [depth, setDepth] = useState<string>(editingProperty?.depth ? editingProperty.depth.toString() : '');

  // Features & Description
  const [features, setFeatures] = useState<string[]>(editingProperty?.features || ['سند ملكية طابو ملك صرف', 'كراج سيارات واسع']);
  const [customFeature, setCustomFeature] = useState('');
  const [description, setDescription] = useState(editingProperty?.description || '');

  // Images & Video
  const [images, setImages] = useState<string[]>(
    editingProperty?.images && editingProperty.images.length > 0 
      ? editingProperty.images 
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(editingProperty?.videoUrl || '');
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  // Owner Info
  const [ownerName, setOwnerName] = useState(editingProperty?.owner?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(editingProperty?.owner?.phone || '');
  const [ownerNationalId, setOwnerNationalId] = useState(editingProperty?.owner?.nationalId || '');
  const [ownerNotes, setOwnerNotes] = useState(editingProperty?.owner?.notes || '');
  const [internalNotes, setInternalNotes] = useState(editingProperty?.internalNotes || '');

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      setFeatures([...features, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            setImages((prev) => [...prev, uploadEvent.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Advise max size but let the system convert to base64
      if (file.size > 80 * 1024 * 1024) {
        alert('حجم ملف الفيديو كبير جداً. يرجى رفع ملف فيديو بحجم أقل من 80 ميغابايت لضمان سرعة التحميل.');
        return;
      }
      setIsVideoUploading(true);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setVideoUrl(uploadEvent.target.result as string);
        }
        setIsVideoUploading(false);
      };
      reader.onerror = () => {
        alert('حدث خطأ أثناء تحميل الفيديو.');
        setIsVideoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('يرجى كتابة عنوان العقار');
      return;
    }
    if (!ownerName.trim() || !ownerPhone.trim()) {
      alert('يرجى إدخال اسم المالك ورقم هاتفه للتواصل');
      return;
    }

    const payload: Partial<Property> = {
      id: propertyCode,
      title: title.trim(),
      type,
      dealType,
      rentPeriod: dealType === 'rent' ? rentPeriod : undefined,
      area: parseFloat(area) || 0,
      price: parseFloat(price) || 0,
      currency,
      province,
      district: district.trim(),
      mahalla: mahalla.trim() || undefined,
      zuqaq: zuqaq.trim() || undefined,
      houseNo: houseNo.trim() || undefined,
      landmark: landmark.trim() || undefined,
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 0,
      floors: parseInt(floors, 10) || 1,
      facadeOrientation,
      facadeWidth: facadeWidth ? parseFloat(facadeWidth) : undefined,
      depth: depth ? parseFloat(depth) : undefined,
      features,
      description: description.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: videoUrl.trim() || undefined,
      owner: {
        name: ownerName.trim(),
        phone: ownerPhone.trim(),
        nationalId: ownerNationalId.trim() || undefined,
        notes: ownerNotes.trim() || undefined,
      },
      internalNotes: internalNotes.trim() || undefined,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                  {propertyCode}
                </span>
                <span className="text-xs text-slate-300">
                  {isEdit ? 'تعديل بيانات الملف الإلكتروني' : 'تسجيل عقار جديد وتوليد كود الـ QR'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isEdit ? `تعديل العقار: ${editingProperty.title}` : 'استمارة إدخال ملف العقار الإلكتروني'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-right">
          
          {/* Section 1: Core Property Details */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>البيانات الأساسية للعقار</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان العقار الترويجي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: دار سكني طابقين بناء حديث - الكرادة"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع العقار</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="house">دار سكني</option>
                  <option value="apartment">شقة سكنية</option>
                  <option value="land">قطعة أرض</option>
                  <option value="commercial">محل / تجاري</option>
                  <option value="villa">فيلا فاخرة</option>
                  <option value="building">عمارة / مجمع</option>
                  <option value="farm">بستان / مزرعة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المعاملة</label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value as DealType)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50"
                >
                  <option value="sale">معروض للبيع</option>
                  <option value="rent">معروض للإيجار</option>
                </select>
              </div>

            </div>

            {dealType === 'rent' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">فترة الإيجار</label>
                  <select
                    value={rentPeriod}
                    onChange={(e) => setRentPeriod(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="monthly">إيجار شهري</option>
                    <option value="yearly">إيجار سنوي</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المساحة الإجمالية (م²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="200"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر المطلوب <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="300000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العملة</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  disabled
                >
                  <option value="IQD">دينار عراقي (IQD)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Section 2: Precise Location Breakdown */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>الموقع الدقيق وبيانات العنوان والتسجيل</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="col-span-2 sm:col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  {COMMON_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المنطقة / الحي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: الكرادة، المنصور، الجادرية..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم المحلة</label>
                <input
                  type="text"
                  placeholder="903"
                  value={mahalla}
                  onChange={(e) => setMahalla(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الزقاق</label>
                <input
                  type="text"
                  placeholder="14"
                  value={zuqaq}
                  onChange={(e) => setZuqaq(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الدار / رقم القطعة</label>
                <input
                  type="text"
                  placeholder="24 / قطعة 12 م"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أقرب نقطة دالة / علامة مميزة</label>
                <input
                  type="text"
                  placeholder="مثال: قرب ساحة الواثق أو خلف جامع الصادق"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Engineering Specs & Dimensions */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>المواصفات والأبعاد الهندسية</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الغرف</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الحمامات</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الطوابق</label>
                <input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عرض الواجهة (م)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={facadeWidth}
                  onChange={(e) => setFacadeWidth(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النزال / العمق (م)</label>
                <input
                  type="number"
                  placeholder="25"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Property Description */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>وصف العقار</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف العقار بالتفصيل والملاحظات العامة</label>
              <textarea
                rows={4}
                placeholder="تفاصيل الغرف، التشطيبات، المواد المستخدمة، وضع السند، التنازل، والملاحظات الإضافية..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Media (Images & Video) */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>الصور والفيديو</span>
            </h3>

            {/* Existing images list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-300 group bg-slate-900">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new image controls */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="رابط صورة مباشر (URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                إضافة رابط
              </button>

              <label className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>رفع من الجهاز</span>
                <input type="file" accept="image/*" multiple onChange={handleImageFileUpload} className="hidden" />
              </label>
            </div>

             <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">فيديو العقار الترويجي (اختياري)</label>
              
              {!videoUrl ? (
                <div className="flex items-center gap-3">
                  <label className={`px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-sm transition-all ${isVideoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>{isVideoUploading ? 'جاري معالجة الفيديو...' : 'اختيار ورفع فيديو للعقار من الجهاز'}</span>
                    <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-500">صيغ مدعومة: MP4, WebM, MOV (الحجم المفضل أقل من 50MB)</p>
                </div>
              ) : (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="aspect-video max-w-sm rounded-lg overflow-hidden bg-black border border-slate-200 relative">
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الفيديو المرفوع</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">تم تحميل الفيديو وحفظه في ملف العقار الإلكتروني</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Owner & Internal Notes (Private) */}
          <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 pb-2 border-b border-amber-200">
              <User className="w-4 h-4 text-amber-700" />
              <span>بيانات صاحب العقار والملاحظات الخاصة (سرية للمكتب فقط)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم صاحب العقار (المالك) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: الحاج أبو أحمد السعدون"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم هاتف المالك <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0770xxxxxxx"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني / الهوية</label>
                <input
                  type="text"
                  placeholder="رقم البطاقة الوطنية الموحدة"
                  value={ownerNationalId}
                  onChange={(e) => setOwnerNationalId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وطلبات المالك</label>
                <input
                  type="text"
                  placeholder="مثال: مستعجل للبيع، شروط الدفع، موعد التسليم..."
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات مكتبية خاصة وسرية</label>
                <input
                  type="text"
                  placeholder="مكان المفتاح، نسبة العمولة المتفق عليها، ملاحظات التنازل..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEdit ? 'حفظ التعديلات' : 'حفظ وإنشاء ملف العقار مع الـ QR'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
