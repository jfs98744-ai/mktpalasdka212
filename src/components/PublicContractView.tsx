import React from 'react';
import { ShieldCheck, CheckCircle, FileText, Calendar, DollarSign, User, Building, Landmark, Phone, ArrowLeft } from 'lucide-react';
import { Contract, OfficeSettings } from '../types';
import { formatPrice } from '../utils/storage';
import { tafqit } from './ContractBuilderModal';

interface PublicContractViewProps {
  contract: Contract;
  officeSettings: OfficeSettings;
  onBackToDashboard?: () => void;
}

export function PublicContractView({ contract, officeSettings, onBackToDashboard }: PublicContractViewProps) {
  const parsedDate = new Date(contract.date);
  const formattedDateStr = parsedDate.toLocaleDateString('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950" dir="rtl">
      {/* Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">{officeSettings.officeName}</h1>
            <p className="text-[10px] text-slate-400">بوابة التحقق الرقمي والتوثيق العقاري</p>
          </div>
        </div>

        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة للوحة الإدارة</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow p-4 md:p-8 max-w-2xl w-full mx-auto space-y-6">
        
        {/* Verification Success Box */}
        <div className="bg-slate-950 border-2 border-emerald-500/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-emerald-500" />
          
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8 stroke-[2.5] animate-pulse" />
          </div>

          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            مستند مكاتبة رسمي معتمد وموثق
          </span>

          <h2 className="text-lg md:text-xl font-extrabold text-white mt-4">
            تم التحقق من صحة المكاتبة بنجاح
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            البيانات المستعرضة أدناه مطابقة تماماً للمستند القانوني المسجل في قاعدة البيانات المركزية لـ <strong className="text-emerald-300">{officeSettings.officeName}</strong> بإشراف المدير العام <strong className="text-emerald-300">الحاج مهدي الخفاجي</strong>.
          </p>

          {/* Document ID badge */}
          <div className="mt-5 inline-flex flex-col items-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">رقم المكاتبة الرسمي</span>
            <span className="font-mono text-base font-black text-amber-400 tracking-wider mt-0.5">{contract.id}</span>
          </div>
        </div>

        {/* Contract Core Info Cards */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-5">
          <h3 className="text-xs font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>تفاصيل ومعلومات العقد</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">نوع المكاتبة</span>
              <strong className="text-white text-sm">
                {contract.contractType === 'sale_deed' ? 'عقد بيع وشراء عقار قطعي' : 'عقد إيجار عقار موثق'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">تاريخ التحرير</span>
              <strong className="text-white text-sm">{formattedDateStr}</strong>
            </div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Party 1: Seller */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>الطرف الأول (البائع / المؤجر)</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-slate-400">الاسم الكامل:</span>
                <strong className="text-white">{contract.seller.name}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">رقم الهوية:</span>
                <strong className="text-slate-200 font-mono">{contract.seller.idNumber}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">الهاتف:</span>
                <strong className="text-slate-200 font-mono" dir="ltr">{contract.seller.phone}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">العنوان:</span>
                <strong className="text-slate-200">
                  {contract.seller.mahalla ? `م ${contract.seller.mahalla} ز ${contract.seller.zuqaq || '-'} د ${contract.seller.houseNo || '-'}` : contract.seller.address}
                </strong>
              </p>
            </div>
          </div>

          {/* Party 2: Buyer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <User className="w-4 h-4 text-purple-400" />
              <span>الطرف الثاني (المشتري / المستأجر)</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-slate-400">الاسم الكامل:</span>
                <strong className="text-white">{contract.buyer.name}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">رقم الهوية:</span>
                <strong className="text-slate-200 font-mono">{contract.buyer.idNumber}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">الهاتف:</span>
                <strong className="text-slate-200 font-mono" dir="ltr">{contract.buyer.phone}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">العنوان:</span>
                <strong className="text-slate-200">
                  {contract.buyer.mahalla ? `م ${contract.buyer.mahalla} ز ${contract.buyer.zuqaq || '-'} د ${contract.buyer.houseNo || '-'}` : contract.buyer.address}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Property Specification Details */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          <h3 className="text-xs font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building className="w-4 h-4 text-blue-400" />
            <span>بيانات العقار والملك المسجل</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">نوع الملك</span>
              <strong className="text-white">{contract.propertyDetails.type}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">المساحة الإجمالية</span>
              <strong className="text-white">{contract.propertyDetails.area} م²</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">الرقم والتسلسل</span>
              <strong className="text-white">{contract.propertyDetails.registrationNo || 'غير محدد'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">الموقع</span>
              <strong className="text-white">{contract.propertyDetails.province} - {contract.propertyDetails.district}</strong>
            </div>
          </div>

          {contract.contractType === 'rent_agreement' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-900">
              <div>
                <span className="text-amber-400 block mb-0.5">غرض الاستعمال</span>
                <strong className="text-white">{contract.financials.rentUsage || 'للسكن والمأوى'}</strong>
              </div>
              <div>
                <span className="text-amber-400 block mb-0.5">تاريخ بدء الإيجار</span>
                <strong className="text-white font-mono">{contract.financials.rentStartDate || 'غير محدد'}</strong>
              </div>
              <div>
                <span className="text-amber-400 block mb-0.5">تاريخ نهاية الإيجار</span>
                <strong className="text-white font-mono">{contract.financials.rentEndDate || 'غير محدد'}</strong>
              </div>
            </div>
          )}

          <div className="text-xs pt-2 border-t border-slate-900 leading-relaxed">
            <span className="text-slate-400 block mb-0.5">وصف سند الملكية</span>
            <p className="text-slate-200 font-semibold">{contract.propertyDetails.deedType || 'سند طابو ملك صرف خالي من أي موانع'}</p>
          </div>
        </div>

        {/* Financial Section */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          <h3 className="text-xs font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{contract.contractType === 'rent_agreement' ? 'التفاصيل المالية لملف الإيجار' : 'التفاصيل المالية والبدل المتفق عليه'}</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">
                {contract.contractType === 'rent_agreement' ? 'بدل الإيجار الشهري:' : 'بدل البيع الكلي:'}
              </span>
              <div className="text-left">
                <strong className="text-emerald-400 text-sm md:text-base font-black">{formatPrice(contract.financials.totalAmount, 'IQD')}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">({tafqit(contract.financials.totalAmount)})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-1">
                  {contract.contractType === 'rent_agreement' ? 'التأمين المالي المدفوع:' : 'العربون المدفوع:'}
                </span>
                <strong className="text-white">{formatPrice(contract.financials.depositPaid, 'IQD')}</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-1">
                  {contract.contractType === 'rent_agreement' ? 'المتبقي من الشهر الأول:' : 'المبلغ المتبقي:'}
                </span>
                <strong className="text-amber-400">{formatPrice(contract.financials.totalAmount - contract.financials.depositPaid, 'IQD')}</strong>
              </div>
            </div>

            {contract.contractType === 'rent_agreement' ? (
              contract.financials.sellerPenalty && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-red-300 text-[11px] leading-relaxed">
                  <strong>الشرط الجزائي عن التأخير بالتخلية:</strong> في حال تأخر المستأجر عن تسليم العقار بعد نهاية مدة العقد، يلتزم بدفع تعويض يومي للمؤجر قدره ثلاثة أضعاف الإيجار اليومي المتفق عليه.
                </div>
              )
            ) : (
              contract.financials.sellerPenalty && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-red-300 text-[11px] leading-relaxed">
                  <strong>الشرط الجزائي المتفق عليه:</strong> يلتزم الطرف الناكل في حالة النكول أو الامتناع عن إتمام التنازل بتأدية تعويضات مالية للطرف الآخر قدرها <strong className="text-red-400 font-bold">{formatPrice(contract.financials.sellerPenalty, 'IQD')}</strong> ({tafqit(contract.financials.sellerPenalty)}).
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer Seal representation */}
        <div className="text-center pt-8 pb-12 text-slate-500 text-[10px] space-y-1.5 border-t border-slate-800/60">
          <p className="font-bold text-slate-400">مكتب الرافدين المعتمد للخدمات والتطوير العقاري</p>
          <p>بوابة التوثيق الإلكتروني الرسمية مرخصة بموجب إجازة النقابة العراقية رقم: {officeSettings.licenseNumber}</p>
          <p className="font-mono text-[9px] text-slate-600">Verification ID: {contract.id} - System UTC Time Lock</p>
        </div>

      </main>
    </div>
  );
}
