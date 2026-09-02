import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  User, 
  Phone, 
  Calendar, 
  Percent, 
  FileText, 
  Building2,
  Sparkles,
  Printer,
  Download,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, SaleDetails, Currency, Contract } from '../types';
import { formatPrice } from '../utils/storage';

// Arabic Tafqit (Number to Words) Helper for Iraqi Dinars
export function tafqit(num: number): string {
  if (num === 0) return 'صفر دينار عراقي';
  
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  
  function convertSection(n: number): string {
    let parts: string[] = [];
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;
    
    if (h > 0) {
      parts.push(hundreds[h]);
    }
    
    if (remainder > 0) {
      if (remainder < 10) {
        parts.push(ones[remainder]);
      } else if (remainder < 20) {
        parts.push(teens[remainder - 10]);
      } else {
        if (o > 0) {
          parts.push(ones[o] + ' و' + tens[t]);
        } else {
          parts.push(tens[t]);
        }
      }
    }
    
    return parts.join(' و');
  }

  let words = '';
  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;
  
  let parts: string[] = [];
  
  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else if (billions >= 3 && billions <= 10) parts.push(ones[billions] + ' مليارات');
    else parts.push(convertSection(billions) + ' مليار');
  }
  
  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(ones[millions] + ' ملايين');
    else parts.push(convertSection(millions) + ' مليون');
  }
  
  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(ones[thousands] + ' آلاف');
    else parts.push(convertSection(thousands) + ' ألف');
  }
  
  if (remainder > 0) {
    parts.push(convertSection(remainder));
  }
  
  return parts.join(' و') + ' دينار عراقي لا غير';
}

interface SaleRecordModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (propertyId: string, saleDetails: SaleDetails) => void;
  availableContracts: Contract[];
}

export function SaleRecordModal({
  property,
  isOpen,
  onClose,
  onConfirmSale,
  availableContracts,
}: SaleRecordModalProps) {
  if (!isOpen || !property) return null;

  // Seller Details (Pre-filled from property owner)
  const [sellerName, setSellerName] = useState(property.owner.name || '');
  const [sellerPhone, setSellerPhone] = useState(property.owner.phone || '');
  const [sellerId, setSellerId] = useState(property.owner.nationalId || '');
  const [sellerAddress, setSellerAddress] = useState('');

  // Buyer Details
  const [buyerName, setBuyerName] = useState(property.reservationDetails?.clientName || '');
  const [buyerPhone, setBuyerPhone] = useState(property.reservationDetails?.clientPhone || '');
  const [buyerId, setBuyerId] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  // Financial details
  const [salePrice, setSalePrice] = useState<number>(property.price);
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositPaid, setDepositPaid] = useState<number>(property.reservationDetails?.depositAmount || 0);
  const [commissionRate, setCommissionRate] = useState<number>(2);
  const [commission, setCommission] = useState<number>(Math.round(property.price * 0.02));
  const [commissionPaidBy, setCommissionPaidBy] = useState<'buyer' | 'seller' | 'split'>('split');
  const [contractId, setContractId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Witnesses details
  const [witness1Name, setWitness1Name] = useState('');
  const [witness1Info, setWitness1Info] = useState('');
  const [witness2Name, setWitness2Name] = useState('');
  const [witness2Info, setWitness2Info] = useState('');

  // Print/A4 state
  const [showPrintView, setShowPrintView] = useState(false);

  // Handle price change to recalculate commission
  const handlePriceChange = (val: number) => {
    setSalePrice(val);
    setCommission(Math.round((val * commissionRate) / 100));
  };

  const handleCommissionRateChange = (rate: number) => {
    setCommissionRate(rate);
    setCommission(Math.round((salePrice * rate) / 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('يرجى كتابة اسم المشتري / المستأجر ورقم هاتفه');
      return;
    }

    const saleDetails: SaleDetails = {
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      salePrice,
      currency,
      saleDate,
      commission,
      commissionPaidBy,
      contractId: contractId.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onConfirmSale(property.id, saleDetails);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    // Enter print receipt mode
    setShowPrintView(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const matchingContracts = availableContracts.filter(c => c.propertyId === property.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Dynamic print-only styling injected so that window.print() outputs a pristine, beautifully aligned A4 sheet without the surrounding modal UI */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: none !important;
          }
          #printable-a4-document, #printable-a4-document * {
            visibility: visible;
          }
          #printable-a4-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            border: none !important;
            box-shadow: none !important;
            direction: rtl !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[92vh]">
        
        {/* Left Side: Real-time A4 Print Preview Sheet (or Success Panel) */}
        <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex flex-col items-center border-l border-slate-200">
          
          <div className="w-full flex items-center justify-between mb-4 no-print">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>معاينة ورقة المكاتبة الرسمية (A4)</span>
            </h4>
            
            {showPrintView && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة المستند / حفظ PDF</span>
              </button>
            )}
          </div>

          {/* Elegant Printable A4 Document Sheet (Standard Proportion 210mm x 297mm) */}
          <div 
            id="printable-a4-document"
            className="w-full max-w-[210mm] aspect-[1/1.414] bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-md flex flex-col justify-between text-slate-900 text-[11px] leading-relaxed select-text"
            style={{ direction: 'rtl' }}
          >
            {/* Elegant Outer Border */}
            <div className="border-[2px] border-double border-slate-800 p-4 h-full flex flex-col justify-between">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
                  <div className="text-right space-y-0.5">
                    <h2 className="text-sm font-black text-slate-950">مكتب الرافدين للاستثمارات والتسويق العقاري</h2>
                    <p className="text-[9px] text-slate-500">إجازة نقابة العقاريين العراقيين رقم: 5419/بغداد</p>
                    <p className="text-[9px] text-slate-500">إدارة: الحاج مهدي عبد الحسين الخفاجي</p>
                  </div>

                  {/* Emblem / Logo */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center font-black text-slate-950 text-xs">
                      الرافدين
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 mt-1">عقارات معتمدة</span>
                  </div>

                  <div className="text-left space-y-0.5 text-[9px] text-slate-500 font-mono">
                    <p>رقم العقد: {property.id}-{new Date().getFullYear()}</p>
                    <p>تاريخ المكاتبة: {saleDate}</p>
                    <p>بغداد - الكرادة خارج</p>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center my-4">
                  <h1 className="text-base font-black underline decoration-double underline-offset-4 text-slate-950 tracking-wider">
                    {property.dealType === 'sale' ? 'مكاتبة عقد بيع وشراء عقار خارجية' : 'عقد إيجار عقار وسكني خارجي'}
                  </h1>
                </div>

                {/* Opening statement */}
                <p className="mb-3 text-justify text-slate-800">
                  بموجب هذا العقد والمكاتبة الشرعية والقانونية المبرمة في مدينة بغداد بجمهورية العراق بتاريخ <strong className="font-bold font-mono">{saleDate}</strong>، جرى الاتفاق والتراضي بين الأطراف الموقعة أدناه بكامل أهليتهم المعتبرة قانوناً على ما يلي:
                </p>

                {/* Parties details grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Seller Panel */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/50">
                    <strong className="text-slate-950 font-bold block mb-1.5 border-b border-slate-200 pb-0.5">الطرف الأول (البائع / المؤجر):</strong>
                    <table className="w-full text-[10px] text-slate-700">
                      <tbody>
                        <tr>
                          <td className="w-20 py-0.5 font-bold">الاسم الثلاثي:</td>
                          <td className="py-0.5 text-slate-950 font-semibold">{sellerName || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">رقم الهاتف:</td>
                          <td className="py-0.5 font-mono text-slate-950">{sellerPhone || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">البطاقة الوطنية:</td>
                          <td className="py-0.5 font-mono text-slate-950">{sellerId || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">عنوان السكن:</td>
                          <td className="py-0.5 text-slate-950">{sellerAddress || '................................'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Buyer Panel */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/50">
                    <strong className="text-slate-950 font-bold block mb-1.5 border-b border-slate-200 pb-0.5">الطرف الثاني (المشتري / المستأجر):</strong>
                    <table className="w-full text-[10px] text-slate-700">
                      <tbody>
                        <tr>
                          <td className="w-20 py-0.5 font-bold">الاسم الثلاثي:</td>
                          <td className="py-0.5 text-slate-950 font-semibold">{buyerName || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">رقم الهاتف:</td>
                          <td className="py-0.5 font-mono text-slate-950">{buyerPhone || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">البطاقة الوطنية:</td>
                          <td className="py-0.5 font-mono text-slate-950">{buyerId || '................................'}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-bold">عنوان السكن:</td>
                          <td className="py-0.5 text-slate-950">{buyerAddress || '................................'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Property description */}
                <div className="border border-slate-300 p-2 rounded mb-4">
                  <strong className="text-slate-950 font-bold block mb-1 border-b border-slate-200 pb-0.5">موضوع العقد ووصف العقار:</strong>
                  <p className="text-slate-800 text-[10px]">
                    اتفق الطرفان على التعامل على العقار ذي الرقم المرجعي <strong className="font-mono font-bold text-slate-950">{property.id}</strong>، الكائن في محافظة <strong className="font-bold">{property.province}</strong>، منطقة <strong className="font-bold">{property.district}</strong>، محلة <strong className="font-bold font-mono">{property.mahalla || '...'}</strong>، زقاق <strong className="font-bold font-mono">{property.zuqaq || '...'}</strong>، دار <strong className="font-bold font-mono">{property.houseNo || '...'}</strong>، أقرب نقطة دالة: <span className="font-medium text-slate-700">{property.landmark || '...'}</span>. المساحة الإجمالية للعقار <strong className="font-mono font-bold">{property.area}م²</strong> ونوع العقار هو <strong className="font-bold">{property.type === 'house' ? 'دار سكني' : property.type === 'apartment' ? 'شقة سكنية' : property.type === 'land' ? 'قطعة أرض' : property.type === 'villa' ? 'فيلا فخمة' : 'عقار تجاري'}</strong>.
                  </p>
                </div>

                {/* Financial details table */}
                <div className="border border-slate-300 rounded overflow-hidden mb-4">
                  <table className="w-full text-[10px] text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                        <th className="p-1.5 border-l border-slate-300">البيان المالي العقد</th>
                        <th className="p-1.5 border-l border-slate-300 w-1/3">المبلغ بالأرقام</th>
                        <th className="p-1.5 w-1/2">المبلغ تفقيطاً بالكلمات العربية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="p-1.5 font-bold border-l border-slate-300 text-slate-950">
                          {property.dealType === 'sale' ? 'سعر البيع الكلي المتفق عليه:' : 'بدل الإيجار المتفق عليه:'}
                        </td>
                        <td className="p-1.5 font-mono font-bold border-l border-slate-300 text-slate-950 text-xs">
                          {formatPrice(salePrice, 'IQD')}
                        </td>
                        <td className="p-1.5 font-semibold text-[9px] text-slate-900">
                          {tafqit(salePrice)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold border-l border-slate-300 text-slate-700">
                          {property.dealType === 'sale' ? 'مبلغ العربون / المقدم المدفوع:' : 'مبلغ التأمين المقبوض بمكتبنا:'}
                        </td>
                        <td className="p-1.5 font-mono border-l border-slate-300 text-slate-900 text-xs">
                          {formatPrice(depositPaid, 'IQD')}
                        </td>
                        <td className="p-1.5 text-[9px] text-slate-600">
                          {tafqit(depositPaid)}
                        </td>
                      </tr>
                      {property.dealType === 'sale' && (
                        <tr>
                          <td className="p-1.5 font-bold border-l border-slate-300 text-slate-950">
                            المبلغ المتبقي بذمة المشتري:
                          </td>
                          <td className="p-1.5 font-mono font-bold border-l border-slate-300 text-emerald-700 text-xs">
                            {formatPrice(salePrice - depositPaid, 'IQD')}
                          </td>
                          <td className="p-1.5 font-semibold text-[9px] text-emerald-800">
                            {tafqit(salePrice - depositPaid)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="p-1.5 font-bold border-l border-slate-300 text-slate-700">
                          أجور ودلالية مكتب العقار المعتمدة:
                        </td>
                        <td className="p-1.5 font-mono border-l border-slate-300 text-slate-900">
                          {formatPrice(commission, 'IQD')}
                        </td>
                        <td className="p-1.5 text-[9px] text-slate-600">
                          {commissionPaidBy === 'split' ? 'تُدفع مناصفة بين البائع والمشتري بنسبة 50% لكل طرف' : commissionPaidBy === 'buyer' ? 'تُدفع من الطرف الثاني (المشتري) بالكامل' : 'تُدفع من الطرف الأول (البائع) بالكامل'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Contract conditions */}
                <div className="space-y-1 text-slate-800 text-[9px] text-justify mb-4">
                  <strong className="text-slate-950 font-bold block text-[10px] mb-1">شروط وتعهدات المكاتبة الملزمة للطرفين:</strong>
                  {property.dealType === 'sale' ? (
                    <>
                      <p>١. يلتزم الطرف الأول (البائع) بالتنازل الرسمي عن العقار ونقل ملكيته للطرف الثاني (المشتري) في دائرة التسجيل العقاري المختصة فور استكمال الأوراق وبراءة الذمة الضريبية والبلدية والخلو من الرهن والحجز العيني.</p>
                      <p>٢. يلتزم الطرف الثاني بتسديد كامل المبلغ المتبقي المتفق عليه بذمته لصالح الطرف الأول نقداً أو بموجب صك مصدق عند توقيع وثيقة التنازل الفوري في الطابو الرسمي.</p>
                      <p>٣. في حال نكول الطرف الأول (تراجعه) عن البيع يلتزم برد قيمة العربون مضاعفاً للطرف الثاني، وفي حال نكول الطرف الثاني (المشتري) يسقط حقه بالمطالبة بالدولار أو العربون المدفوع ويعتبر تعويضاً قانونياً.</p>
                      <p>٤. تُستوفى دلالية وأجور مكتب الرافدين الموقعة فور تحرير هذه المكاتبة، وتعتبر الأجور حقاً مكتسباً للمكتب لا يُرد ولا يُلغى لأي سبب كان في حال تراجع أو فسخ العقد بتراضي الطرفين.</p>
                    </>
                  ) : (
                    <>
                      <p>١. يلتزم الطرف الثاني (المستأجر) بالمحافظة التامة على سلامة جدران ومنشآت العقار المأجور وملحقاته الكهربائية والصحية وتسليمه بذات الحالة النظيفة عند نهاية مدة العقد المتفق عليها.</p>
                      <p>٢. يلتزم المستأجر بتسديد فواتير استهلاك الطاقة الكهربائية، المولد الأهلي، الماء، وباقي رسوم الخدمات والنظافة المشتركة طيلة مدة إشغاله العقار المأجور بشكل دوري ومنتظم.</p>
                      <p>٣. لا يحق للمستأجر تأجير العقار المأجور للغير من الباطن أو التنازل عن المنفعة للغير بأي شكل من الأشكال إلا بعد استحصال الموافقة الخطية المباشرة من الطرف الأول (المؤجر).</p>
                      <p>٤. يُستقطع مبالغ التلفيات أو الأضرار إن وجدت من قيمة مبلغ التأمين المقبوض بموجب هذه المكاتبة عند تصفية العقد والذمة، ويُرد الباقي للمستأجر.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Signatures & Seal Box */}
              <div>
                <div className="grid grid-cols-4 gap-2 text-center border-t border-slate-300 pt-3 text-[10px] text-slate-700">
                  <div className="flex flex-col justify-between h-16">
                    <span className="font-bold text-slate-950">توقيع وبصمة الطرف الأول</span>
                    <span className="text-[9px] text-slate-400">البائع / المؤجر</span>
                  </div>
                  <div className="flex flex-col justify-between h-16 border-r border-slate-200">
                    <span className="font-bold text-slate-950">توقيع وبصمة الطرف الثاني</span>
                    <span className="text-[9px] text-slate-400">المشتري / المستأجر</span>
                  </div>
                  <div className="flex flex-col justify-between h-16 border-r border-slate-200">
                    <span className="font-bold text-slate-950">شهود العقد المكاتبة</span>
                    <span className="text-[9px] text-slate-400">{witness1Name || 'شاهد أول'} • {witness2Name || 'شاهد ثان'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-between h-16 border-r border-slate-200">
                    <span className="font-bold text-emerald-950">ختم وتوقيع مدير المكتب</span>
                    <div className="w-10 h-10 rounded-full border border-dashed border-emerald-500/50 text-emerald-500 flex items-center justify-center text-[7px] font-bold">
                      مكتب الرافدين
                    </div>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-center mt-3 pt-2 border-t border-slate-200 text-[8px] text-slate-400">
                  * تم تحرير هذا العقد بمقر مكتب الرافدين العقاري وبحضور جميع الأطراف والشهود واعتبر العقد ساري المفعول فور التوقيع.
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Informative Inputs & Control Panel */}
        <div className="w-full md:w-[380px] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto no-print">
          
          <div>
            {/* Modal Mini-Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900">
                {showPrintView ? '🎉 تم إغلاق الصفقة بنجاح!' : 'تعبئة معلومات المكاتبة الرسمية'}
              </h3>
              {!showPrintView && (
                <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {showPrintView ? (
              /* Post-Submission Instructions */
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تم توثيق البيع وأرشفة العقار!</span>
                  </h4>
                  <p className="leading-relaxed">
                    تم تحويل حالة العقار <strong className="font-bold">{property.id}</strong> في المنظومة تلقائياً إلى <strong>مباع</strong> وتحديث سجله التاريخي.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-xl space-y-1.5">
                  <h5 className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>تعليمات طباعة المكاتبة A4:</span>
                  </h5>
                  <ul className="list-decimal list-inside space-y-1 text-amber-900 pr-1">
                    <li>اضغط على زر <strong>"طباعة المستند / حفظ PDF"</strong> بالأعلى.</li>
                    <li>في نافذة الطباعة، اختر حفظ كملف <strong>PDF</strong> أو طابعة الورق المباشرة.</li>
                    <li>تأكد من اختيار قياس الورق <strong>A4</strong>.</li>
                    <li>تأكد من تفعيل <strong>"طباعة خلفيات الرسوم" (Background Graphics)</strong> لظهور خطوط وهوية المكتب الفاخرة بشكل كامل.</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all text-center"
                  >
                    العودة للوحة التحكم الرئيسية
                  </button>
                </div>
              </div>
            ) : (
              /* Editable details form to enrich the A4 Print sheet */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Section header */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">عقار المعاملة:</span>
                  <p className="text-xs font-bold text-slate-900">{property.title}</p>
                  <p className="text-[10px] text-slate-500">القيمة المسجلة: {formatPrice(property.price, 'IQD')}</p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 block border-b pb-1">١. معلومات البائع (الطرف الأول):</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">اسم البائع الثلاثي</label>
                    <input 
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">رقم هاتف البائع</label>
                      <input 
                        type="text"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">رقم الهوية الوطنية</label>
                      <input 
                        type="text"
                        placeholder="مثال: 19803241593"
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">عنوان سكن البائع</label>
                    <input 
                      type="text"
                      placeholder="بغداد - المنصور - محلة 609"
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-slate-400 block border-b pb-1">٢. معلومات المشتري (الطرف الثاني):</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">اسم المشتري الثلاثي *</label>
                    <input 
                      type="text"
                      required
                      placeholder="اسم المشتري الثلاثي"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">رقم هاتف المشتري *</label>
                      <input 
                        type="text"
                        required
                        placeholder="077XXXXXXXX"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">البطاقة الوطنية للمشتري</label>
                      <input 
                        type="text"
                        placeholder="البطاقة الوطنية"
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">عنوان سكن المشتري</label>
                    <input 
                      type="text"
                      placeholder="بغداد - الكرادة خارج"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-slate-400 block border-b pb-1">٣. التفاصيل المالية وتأكيد المبيعات:</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">سعر الصفقة النهائي *</label>
                      <input 
                        type="number"
                        required
                        value={salePrice || ''}
                        onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">العربون المقبوض</label>
                      <input 
                        type="number"
                        value={depositPaid || ''}
                        onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">نسبة عمولة المكتب (%)</label>
                      <input 
                        type="number"
                        value={commissionRate || ''}
                        onChange={(e) => handleCommissionRateChange(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">مبلغ دلالية المكتب</label>
                      <input 
                        type="number"
                        value={commission || ''}
                        onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">الجهة المسددة للعمولة</label>
                    <select
                      value={commissionPaidBy}
                      onChange={(e) => setCommissionPaidBy(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="split">مناصفة (50% بائع / 50% مشتري)</option>
                      <option value="buyer">على المشتري / المستأجر بالكامل</option>
                      <option value="seller">على البائع / المؤجر بالكامل</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-slate-400 block border-b pb-1">٤. شهود المعاملة:</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">اسم الشاهد الأول</label>
                      <input 
                        type="text"
                        placeholder="الشاهد الأول"
                        value={witness1Name}
                        onChange={(e) => setWitness1Name(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">اسم الشاهد الثاني</label>
                      <input 
                        type="text"
                        placeholder="الشاهد الثاني"
                        value={witness2Name}
                        onChange={(e) => setWitness2Name(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submitting Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد ونقل للأرشيف وعرض العقد</span>
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
