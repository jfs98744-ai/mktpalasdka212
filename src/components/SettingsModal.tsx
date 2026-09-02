import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Building2, 
  Phone, 
  MapPin, 
  DollarSign, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Percent
} from 'lucide-react';
import { OfficeSettings, Property, Contract, ClientRequest } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  officeSettings: OfficeSettings;
  onUpdateSettings: (settings: OfficeSettings) => void;
  onResetData: () => void;
  properties: Property[];
  archivedProperties: Property[];
  contracts: Contract[];
  clientRequests: ClientRequest[];
  onImportData: (data: {
    properties: Property[];
    archivedProperties: Property[];
    contracts: Contract[];
    clientRequests: ClientRequest[];
    officeSettings: OfficeSettings;
  }) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  officeSettings,
  onUpdateSettings,
  onResetData,
  properties,
  archivedProperties,
  contracts,
  clientRequests,
  onImportData,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const [officeName, setOfficeName] = useState(officeSettings.officeName);
  const [officeTagline, setOfficeTagline] = useState(officeSettings.officeTagline);
  const [phone1, setPhone1] = useState(officeSettings.phone1);
  const [phone2, setPhone2] = useState(officeSettings.phone2);
  const [address, setAddress] = useState(officeSettings.address);
  const [licenseNumber, setLicenseNumber] = useState(officeSettings.licenseNumber);
  const [managerName, setManagerName] = useState(officeSettings.managerName);
  const [defaultCurrency, setDefaultCurrency] = useState(officeSettings.defaultCurrency);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [defaultCommissionPercentage, setDefaultCommissionPercentage] = useState(
    officeSettings.defaultCommissionPercentage
  );
  const [autoArchiveOnSale, setAutoArchiveOnSale] = useState(officeSettings.autoArchiveOnSale ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...officeSettings,
      officeName: officeName.trim(),
      officeTagline: officeTagline.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim(),
      address: address.trim(),
      licenseNumber: licenseNumber.trim(),
      managerName: managerName.trim(),
      defaultCurrency,
      defaultCommissionPercentage,
      autoArchiveOnSale,
    });
    onClose();
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      system: 'الرافدين لإدارة العقارات والمكاتبات',
      officeSettings: {
        ...officeSettings,
        officeName,
        officeTagline,
        phone1,
        phone2,
        address,
        licenseNumber,
        managerName,
        defaultCurrency,
        defaultCommissionPercentage,
        autoArchiveOnSale,
      },
      properties,
      archivedProperties,
      contracts,
      clientRequests,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aqarat_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.properties && Array.isArray(parsed.properties)) {
          onImportData({
            properties: parsed.properties,
            archivedProperties: parsed.archivedProperties || [],
            contracts: parsed.contracts || [],
            clientRequests: parsed.clientRequests || [],
            officeSettings: parsed.officeSettings || officeSettings,
          });
          alert('تم استيراد نسخة البيانات الاحتياطية بنجاح!');
          onClose();
        } else {
          alert('الملف غير صالح كنسخة احتياطية للمنظومة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">إعدادات المكتب والنسخ الاحتياطي</h3>
              <p className="text-xs text-slate-400">تخصيص ترويسة العقود والمطبوعات وحفظ البيانات</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          
          {/* Office Branding */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>هوية وبيانات المكتب العقاري (تظهر في العقود والمطبوعات)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المكتب الرسمي</label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الشعار الترويجي / الوصف</label>
                <input
                  type="text"
                  value={officeTagline}
                  onChange={(e) => setOfficeTagline(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدير المسئول</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الإجازة / الرخصة النقابية</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل الرئيسي</label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل الإضافي</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان ومقر المكتب</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* System Defaults */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>الخيارات والعمولات الافتراضية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العملة الافتراضية</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  disabled
                >
                  <option value="IQD">دينار عراقي (IQD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نسبة العمولة الافتراضية (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultCommissionPercentage}
                  onChange={(e) => setDefaultCommissionPercentage(parseFloat(e.target.value) || 2)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Backup & Data Persistence Section */}
          <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
            <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 pb-2 border-b border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>أمان وحفظ البيانات (النسخ الاحتياطي)</span>
            </h4>

            <p className="text-xs text-slate-600">
              يتم حفظ جميع البيانات محلياً بشكل تلقائي في المتصفح. يمكنك في أي وقت تصدير نسخة احتياطية كاملة لملف خارجي أو استرجاعها على جهاز آخر.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية (Backup)</span>
              </button>

              <label className="px-3.5 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Upload className="w-4 h-4" />
                <span>استيراد نسخة سابقة</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-2 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 mr-auto transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط المصنع</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 mr-auto bg-red-50 p-1.5 rounded-xl border border-red-200">
                  <span className="text-[11px] text-red-700 font-bold">تأكيد تصفير البيانات؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      onClose();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    نعم، صفر
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
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
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
