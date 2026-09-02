import { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  Check, 
  DollarSign, 
  User, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Calendar, 
  Percent,
  Eye,
  Edit2,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, Contract, OfficeSettings, ClientRequest, Currency } from '../types';
import { generateNextContractId, formatPrice, getPropertyTypeLabel } from '../utils/storage';
import { generateQRCodeDataUrl, buildPublicContractUrl } from '../utils/qrHelper';

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

interface ContractBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContract: (contract: Contract) => void;
  property?: Property | null;
  existingContracts: Contract[];
  officeSettings: OfficeSettings;
  prefillBuyerName?: string;
  prefillBuyerPhone?: string;
  clientList?: ClientRequest[];
  initialContract?: Contract | null;
}

export function ContractBuilderModal({
  isOpen,
  onClose,
  onSaveContract,
  property,
  existingContracts,
  officeSettings,
  prefillBuyerName,
  prefillBuyerPhone,
  clientList = [],
  initialContract = null,
}: ContractBuilderModalProps) {
  if (!isOpen) return null;

  // Standalone Mode toggle state
  const [isStandalone, setIsStandalone] = useState<boolean>(!property && !initialContract);

  // Core Contract Details
  const [contractId, setContractId] = useState(
    initialContract?.id || generateNextContractId(existingContracts)
  );
  const [contractType, setContractType] = useState<'sale_deed' | 'rent_agreement'>(
    initialContract?.contractType || (property?.dealType === 'rent' ? 'rent_agreement' : 'sale_deed')
  );
  const [contractDate, setContractDate] = useState(
    initialContract?.date || new Date().toISOString().split('T')[0]
  );

  // Property details (Manual typing or auto-populated)
  const [propCode, setPropCode] = useState(initialContract?.propertyDetails?.code || property?.id || `AQ-MAN-${Date.now().toString().slice(-4)}`);
  const [propTitle, setPropTitle] = useState(initialContract?.propertyDetails?.title || property?.title || 'عقار مكاتبة منفصلة');
  const [propType, setPropType] = useState(
    initialContract?.propertyDetails?.type || (property ? getPropertyTypeLabel(property.type) : 'دار سكني')
  );
  const [propArea, setPropArea] = useState<number>(
    initialContract?.propertyDetails?.area || property?.area || 200
  );
  const [province, setProvince] = useState(initialContract?.propertyDetails?.province || property?.province || 'بغداد');
  const [district, setDistrict] = useState(initialContract?.propertyDetails?.district || property?.district || 'الكرادة');
  const [mahalla, setMahalla] = useState(initialContract?.propertyDetails?.mahalla || property?.mahalla || '');
  const [zuqaq, setZuqaq] = useState(initialContract?.propertyDetails?.zuqaq || property?.zuqaq || '');
  const [houseNo, setHouseNo] = useState(initialContract?.propertyDetails?.houseNo || property?.houseNo || '');
  const [deedType, setDeedType] = useState(
    initialContract?.propertyDetails?.deedType || 'سند طابو ملك صرف خالي من أي رهن أو حجز'
  );
  const [propSpecs, setPropSpecs] = useState(
    initialContract?.propertyDetails?.specs || property?.description || 'بناء درجة أولى متكامل المواصفات'
  );
  const [registrationNo, setRegistrationNo] = useState(
    initialContract?.propertyDetails?.registrationNo || ''
  );

  // Seller details
  const [sellerName, setSellerName] = useState(
    initialContract?.seller?.name || property?.owner?.name || ''
  );
  const [sellerPhone, setSellerPhone] = useState(
    initialContract?.seller?.phone || property?.owner?.phone || ''
  );
  const [sellerIdNumber, setSellerIdNumber] = useState(
    initialContract?.seller?.idNumber || property?.owner?.nationalId || 'بطاقة وطنية موحدة'
  );
  const [sellerAddress, setSellerAddress] = useState(
    initialContract?.seller?.address || (property ? `${property.province} - ${property.district}` : 'بغداد')
  );
  const [sellerMahalla, setSellerMahalla] = useState(initialContract?.seller?.mahalla || '');
  const [sellerZuqaq, setSellerZuqaq] = useState(initialContract?.seller?.zuqaq || '');
  const [sellerHouseNo, setSellerHouseNo] = useState(initialContract?.seller?.houseNo || '');

  // Buyer details
  const [buyerName, setBuyerName] = useState(
    initialContract?.buyer?.name || prefillBuyerName || ''
  );
  const [buyerPhone, setBuyerPhone] = useState(
    initialContract?.buyer?.phone || prefillBuyerPhone || ''
  );
  const [buyerIdNumber, setBuyerIdNumber] = useState(
    initialContract?.buyer?.idNumber || 'بطاقة وطنية موحدة'
  );
  const [buyerAddress, setBuyerAddress] = useState(
    initialContract?.buyer?.address || 'بغداد'
  );
  const [buyerMahalla, setBuyerMahalla] = useState(initialContract?.buyer?.mahalla || '');
  const [buyerZuqaq, setBuyerZuqaq] = useState(initialContract?.buyer?.zuqaq || '');
  const [buyerHouseNo, setBuyerHouseNo] = useState(initialContract?.buyer?.houseNo || '');

  // Financials
  const [totalAmount, setTotalAmount] = useState<number>(
    initialContract?.financials?.totalAmount || property?.price || 250000000
  );
  const [depositPaid, setDepositPaid] = useState<number>(
    initialContract?.financials?.depositPaid || property?.reservationDetails?.depositAmount || Math.round((property?.price || 250000000) * 0.05)
  );
  const [currency, setCurrency] = useState<Currency>('IQD');
  const remainingAmount = Math.max(0, totalAmount - depositPaid);

  const [commissionPercentage, setCommissionPercentage] = useState<number>(
    officeSettings.defaultCommissionPercentage || 2
  );
  const commissionAmount = Math.round((totalAmount * commissionPercentage) / 100);
  const [commissionPaidBy, setCommissionPaidBy] = useState<'buyer' | 'seller' | 'split'>(
    initialContract?.financials?.commissionPaidBy || 'split'
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialContract?.financials?.paymentTerms || 'يُدفع المبلغ المتبقي عند استدعاء دائرة التسجيل العقاري والتنازل الرسمي عن العقار.'
  );

  // Penalties
  const [sellerPenalty, setSellerPenalty] = useState<number>(
    initialContract?.financials?.sellerPenalty || 10000000
  );
  const [buyerPenalty, setBuyerPenalty] = useState<number>(
    initialContract?.financials?.buyerPenalty || 10000000
  );

  // Rent variables
  const [rentStartDate, setRentStartDate] = useState(
    initialContract?.financials?.rentStartDate || new Date().toISOString().split('T')[0]
  );
  const [rentEndDate, setRentEndDate] = useState(
    initialContract?.financials?.rentEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [rentUsage, setRentUsage] = useState<string>(
    initialContract?.financials?.rentUsage || 'للسكن'
  );

  // Witnesses
  const [witness1Name, setWitness1Name] = useState(
    initialContract?.witnesses?.[0]?.name || 'أحمد جاسم السعدي'
  );
  const [witness1Phone, setWitness1Phone] = useState(
    initialContract?.witnesses?.[0]?.phone || '07701122334'
  );
  const [witness1Id, setWitness1Id] = useState(
    initialContract?.witnesses?.[0]?.idNumber || 'وطنية/٠٠١٢٤٥٦٣'
  );

  const [witness2Name, setWitness2Name] = useState(
    initialContract?.witnesses?.[1]?.name || 'علي حسين الخفاجي'
  );
  const [witness2Phone, setWitness2Phone] = useState(
    initialContract?.witnesses?.[1]?.phone || '07809988776'
  );
  const [witness2Id, setWitness2Id] = useState(
    initialContract?.witnesses?.[1]?.idNumber || 'وطنية/٠٠٩٨٤٥١٢'
  );

  // Custom Clauses (for additional notes/remarks)
  const [extraLine1, setExtraLine1] = useState(
    initialContract?.terms?.[5] || ''
  );
  const [extraLine2, setExtraLine2] = useState(
    initialContract?.terms?.[6] || ''
  );
  const [extraLine3, setExtraLine3] = useState(
    initialContract?.terms?.[7] || ''
  );

  // UI Modes
  const [viewMode, setViewMode] = useState<'form' | 'preview'>(initialContract ? 'preview' : 'form');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [numCopies, setNumCopies] = useState<number>(3);

  const getCopyLabel = (index: number, type: 'sale_deed' | 'rent_agreement') => {
    if (index === 0) return 'نسخة المكتب العقاري (أصلية)';
    if (index === 1) return 'نسخة الطرف الأول (البائع)';
    if (index === 2) {
      return type === 'sale_deed' ? 'نسخة الطرف الثاني (المشتري)' : 'نسخة الطرف الثاني (المستأجر)';
    }
    return `نسخة إضافية رقم ${index - 2} معتمدة`;
  };

  const renderCopiesControlPanel = () => {
    return (
      <div className="bg-[#fffbeb] border-2 border-amber-500 rounded-2xl p-5 mb-6 shadow-sm text-right print:hidden max-w-[210mm] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-4 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">خيارات ومطبوعات المكاتبة الرسمية العراقية</h4>
              <p className="text-xs text-slate-600 mt-1">
                تم حفظ المكاتبة بنجاح في النظام وتسجيل الصفقة عقارياً ونقلها للأرشيف. يرجى تحديد عدد النسخ المراد طباعتها بالعداد أدناه:
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-start lg:self-auto shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">عدد النسخ:</span>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <button 
                  type="button"
                  onClick={() => setNumCopies(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-mono font-bold text-sm min-w-[36px] text-center text-amber-800 bg-amber-50/20">{numCopies}</span>
                <button 
                  type="button"
                  onClick={() => setNumCopies(prev => Math.min(5, prev + 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة {numCopies} نسخ معاً</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-[11px] font-bold text-slate-500 mb-2.5 font-sans">توزيع النسخ المعينة ومسمياتها بالختم الرسمي:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {Array.from({ length: numCopies }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white/70 px-3 py-2 rounded-xl border border-amber-200/50 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">{idx + 1}</div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-[11px]">{getCopyLabel(idx, contractType)}</span>
                  <span className="text-[9px] text-slate-400">ستطبع كصفحة مستقلة مخصصة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle Loading Initial Contract
  useEffect(() => {
    if (initialContract) {
      setContractId(initialContract.id);
      setContractType(initialContract.contractType);
      setContractDate(initialContract.date);
      
      const pd = initialContract.propertyDetails;
      setPropCode(pd.code);
      setPropTitle(pd.title);
      setPropType(pd.type);
      setPropArea(pd.area);
      setProvince(pd.province);
      setDistrict(pd.district);
      setMahalla(pd.mahalla || '');
      setZuqaq(pd.zuqaq || '');
      setHouseNo(pd.houseNo || '');
      setDeedType(pd.deedType || '');
      setPropSpecs(pd.specs);
      setRegistrationNo(pd.registrationNo || '');

      setSellerName(initialContract.seller.name);
      setSellerPhone(initialContract.seller.phone);
      setSellerIdNumber(initialContract.seller.idNumber);
      setSellerAddress(initialContract.seller.address);
      setSellerMahalla(initialContract.seller.mahalla || '');
      setSellerZuqaq(initialContract.seller.zuqaq || '');
      setSellerHouseNo(initialContract.seller.houseNo || '');

      setBuyerName(initialContract.buyer.name);
      setBuyerPhone(initialContract.buyer.phone);
      setBuyerIdNumber(initialContract.buyer.idNumber);
      setBuyerAddress(initialContract.buyer.address);
      setBuyerMahalla(initialContract.buyer.mahalla || '');
      setBuyerZuqaq(initialContract.buyer.zuqaq || '');
      setBuyerHouseNo(initialContract.buyer.houseNo || '');

      setTotalAmount(initialContract.financials.totalAmount);
      setDepositPaid(initialContract.financials.depositPaid);
      setCurrency(initialContract.financials.currency);
      setCommissionPaidBy(initialContract.financials.commissionPaidBy);
      setPaymentTerms(initialContract.financials.paymentTerms || '');
      setSellerPenalty(initialContract.financials.sellerPenalty || 10000000);
      setBuyerPenalty(initialContract.financials.buyerPenalty || 10000000);
      
      if (initialContract.financials.rentStartDate) setRentStartDate(initialContract.financials.rentStartDate);
      if (initialContract.financials.rentEndDate) setRentEndDate(initialContract.financials.rentEndDate);
      if (initialContract.financials.rentUsage) setRentUsage(initialContract.financials.rentUsage);

      if (initialContract.witnesses?.[0]) {
        setWitness1Name(initialContract.witnesses[0].name);
        setWitness1Phone(initialContract.witnesses[0].phone);
        setWitness1Id(initialContract.witnesses[0].idNumber || '');
      }
      if (initialContract.witnesses?.[1]) {
        setWitness2Name(initialContract.witnesses[1].name);
        setWitness2Phone(initialContract.witnesses[1].phone);
        setWitness2Id(initialContract.witnesses[1].idNumber || '');
      }

      setViewMode('preview');
    }
  }, [initialContract]);

  // Generate QR code for Contract Verification
  useEffect(() => {
    const publicUrl = buildPublicContractUrl(contractId);
    generateQRCodeDataUrl(publicUrl).then(url => setQrCodeUrl(url));
  }, [contractId]);

  const handleSelectClient = (client: ClientRequest) => {
    setBuyerName(client.clientName);
    setBuyerPhone(client.phone);
  };

  const handleSave = () => {
    if (!buyerName.trim() || !sellerName.trim()) {
      alert('يرجى ملء أسماء الطرفين (البائع والمشتري)');
      return;
    }

    const newContract: Contract = {
      id: contractId,
      propertyId: propCode,
      contractType,
      date: contractDate,
      propertyDetails: {
        code: propCode,
        title: propTitle,
        type: propType,
        area: propArea,
        province,
        district,
        mahalla: mahalla || undefined,
        zuqaq: zuqaq || undefined,
        houseNo: houseNo || undefined,
        deedType,
        specs: propSpecs,
        registrationNo: registrationNo || undefined,
      },
      seller: {
        name: sellerName,
        phone: sellerPhone,
        idNumber: sellerIdNumber,
        address: sellerAddress,
        mahalla: sellerMahalla || undefined,
        zuqaq: sellerZuqaq || undefined,
        houseNo: sellerHouseNo || undefined,
      },
      buyer: {
        name: buyerName,
        phone: buyerPhone,
        idNumber: buyerIdNumber,
        address: buyerAddress,
        mahalla: buyerMahalla || undefined,
        zuqaq: buyerZuqaq || undefined,
        houseNo: buyerHouseNo || undefined,
      },
      financials: {
        totalAmount,
        depositPaid,
        remainingAmount,
        currency,
        commissionAmount,
        commissionPaidBy,
        paymentTerms,
        rentStartDate: contractType === 'rent_agreement' ? rentStartDate : undefined,
        rentEndDate: contractType === 'rent_agreement' ? rentEndDate : undefined,
        rentUsage: contractType === 'rent_agreement' ? rentUsage : undefined,
        sellerPenalty,
        buyerPenalty,
      },
      terms: [
        'يقر الطرف الأول بملكيته التامة والشرعية للعقار وخلوه من أي رهن أو حجز قانوني.',
        'يلتزم الطرف الثاني بتسديد المبالغ المستحقة بموجب جدول الدفعات والبنود المتفق عليها.',
        'يعتبر هذا العقد ملزماً للطرفين وخلفائهم القانونيين في التنازل والتسجيل.',
        extraLine1,
        extraLine2,
        extraLine3,
      ],
      witnesses: [
        { name: witness1Name, phone: witness1Phone, idNumber: witness1Id },
        { name: witness2Name, phone: witness2Phone, idNumber: witness2Id },
      ],
      createdAt: new Date().toISOString(),
    };

    onSaveContract(newContract);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setViewMode('preview');

    // Auto trigger printing after a short delay to let the preview render
    setTimeout(() => {
      window.print();
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert Date string (e.g. 2026-08-31) to Day / Month / Year
  const parsedDate = new Date(contractDate);
  const dayStr = String(parsedDate.getDate()).padStart(2, '0');
  const monthStr = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const yearStr = String(parsedDate.getFullYear()).slice(-1); // gets last digit for ٢٠٢[سنة]

  const parsedRentStartDate = new Date(rentStartDate);
  const rentStartDayStr = String(parsedRentStartDate.getDate()).padStart(2, '0');
  const rentStartMonthStr = String(parsedRentStartDate.getMonth() + 1).padStart(2, '0');
  const rentStartYearStr = String(parsedRentStartDate.getFullYear()).slice(-1);

  const parsedRentEndDate = new Date(rentEndDate);
  const rentEndDayStr = String(parsedRentEndDate.getDate()).padStart(2, '0');
  const rentEndMonthStr = String(parsedRentEndDate.getMonth() + 1).padStart(2, '0');
  const rentEndYearStr = String(parsedRentEndDate.getFullYear()).slice(-1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Style tag injection for custom printing layout */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              direction: rtl !important;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              background: white !important;
              width: 100% !important;
              height: auto !important;
            }
            @page {
              size: A4;
              margin: 12mm 10mm;
            }
          }
        `}} />

        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                  {contractId}
                </span>
                <span className="text-xs text-slate-300">
                  {isStandalone ? 'مكاتبة بيع منفصلة (بدون عقار مسبق)' : 'عقد عقار موثق بالمنظومة'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                منظومة توليد العقود والمكاتبات الرسمية العراقية
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'preview' ? (
              <>
                <button
                  onClick={() => setViewMode('form')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المكاتبة (A4) / حفظ PDF</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setViewMode('preview')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة المستند</span>
              </button>
            )}

            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          
          {viewMode === 'form' ? (
            /* FORM EDIT MODE */
            <div className="space-y-6 text-right max-w-4xl mx-auto">
              
              {/* Info alert about Standalone Mode */}
              {isStandalone && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">وضع المكاتبة الحرة المنفصلة</h4>
                    <p className="text-[11px] mt-1 text-amber-800 leading-relaxed">
                      أنت تقوم الآن بتحرير مكاتبة بيع حرة بدون عقار مسبق في النظام. سيقوم التطبيق بتوليد العقد والمكاتبة مع رمز باركود QR ذكي فريد، ليتسنى للمشتري قراءته من هاتفه واستعراض بيانات وتفاصيل المكاتبة مباشرة!
                    </p>
                  </div>
                </div>
              )}

              {/* Basic configuration bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المكاتبة</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="sale_deed">عقد بيع وشراء قطعي (مكاتبة بيع)</option>
                    <option value="rent_agreement">عقد إيجار عقاري رسمي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المكاتبة</label>
                  <input
                    type="date"
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم المتسلسل للمكاتبة (No.)</label>
                  <input
                    type="text"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>
              </div>

              {/* Section: Property Details */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>أولاً: بيانات ومعلومات الملك موضوع العقد</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نوع الملك</label>
                    <input
                      type="text"
                      placeholder="مثال: دار سكني، شقة، أرض زراعية"
                      value={propType}
                      onChange={(e) => setPropType(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المساحة الإجمالية (م²)</label>
                    <input
                      type="number"
                      placeholder="مثال: 200"
                      value={propArea || ''}
                      onChange={(e) => setPropArea(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الرقم والتسلسل العقاري</label>
                    <input
                      type="text"
                      placeholder="مثال: ١٢٤/الداودي"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحلة (اسم الحي أو المنطقة)</label>
                    <input
                      type="text"
                      placeholder="مثال: حي الداودي"
                      value={mahalla}
                      onChange={(e) => setMahalla(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">القضاء / المنطقة</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">كود العقار الاختياري</label>
                    <input
                      type="text"
                      value={propCode}
                      onChange={(e) => setPropCode(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">توصيف سند الملكية والحدود القانونية للعقار</label>
                  <input
                    type="text"
                    value={deedType}
                    onChange={(e) => setDeedType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                    placeholder="سند طابو ملك صرف خالي من الموانع القانونية"
                  />
                </div>

                {contractType === 'rent_agreement' && (
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">غرض الاستعمال (لاتخاذه)</label>
                      <input
                        type="text"
                        placeholder="مثال: للسكن، لمحل تجاري، لمكتب"
                        value={rentUsage}
                        onChange={(e) => setRentUsage(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">تاريخ بداية الإيجار</label>
                      <input
                        type="date"
                        value={rentStartDate}
                        onChange={(e) => setRentStartDate(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">تاريخ نهاية الإيجار</label>
                      <input
                        type="date"
                        value={rentEndDate}
                        onChange={(e) => setRentEndDate(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Seller and Buyer details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Seller Form Block */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <User className="w-4 h-4" />
                    <span>الطرف الأول (البائع / المؤجر)</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الثلاثي واللقب</label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      placeholder="اكتب اسم البائع الثلاثي"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                      <input
                        type="text"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                        placeholder="077XXXXXXXX"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني / رقم الهوية</label>
                      <input
                        type="text"
                        value={sellerIdNumber}
                        onChange={(e) => setSellerIdNumber(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                        placeholder="بطاقة وطنية موحدة"
                      />
                    </div>
                  </div>

                  {/* Seller Detailed Address (م ز د) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل عنوان البائع للسكن</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="محلة"
                          value={sellerMahalla}
                          onChange={(e) => setSellerMahalla(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="زقاق"
                          value={sellerZuqaq}
                          onChange={(e) => setSellerZuqaq(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="دار"
                          value={sellerHouseNo}
                          onChange={(e) => setSellerHouseNo(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة والمنطقة الإجمالية</label>
                    <input
                      type="text"
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                      placeholder="مثال: بغداد - الكرادة"
                    />
                  </div>
                </div>

                {/* Buyer Form Block */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>الطرف الثاني (المشتري / المستأجر)</span>
                    </h3>

                    {clientList.length > 0 && (
                      <select
                        onChange={(e) => {
                          const cl = clientList.find((c) => c.id === e.target.value);
                          if (cl) handleSelectClient(cl);
                        }}
                        className="text-[10px] p-1 bg-purple-50 border border-purple-300 rounded font-semibold text-purple-800"
                      >
                        <option value="">استيراد من الزبائن...</option>
                        {clientList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.clientName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الثلاثي واللقب</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      placeholder="اكتب اسم المشتري الثلاثي"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                      <input
                        type="text"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                        placeholder="07XXXXXXXXX"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني / رقم الهوية</label>
                      <input
                        type="text"
                        value={buyerIdNumber}
                        onChange={(e) => setBuyerIdNumber(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                        placeholder="بطاقة وطنية موحدة"
                      />
                    </div>
                  </div>

                  {/* Buyer Detailed Address (م ز د) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل عنوان المشتري للسكن</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="محلة"
                          value={buyerMahalla}
                          onChange={(e) => setBuyerMahalla(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="زقاق"
                          value={buyerZuqaq}
                          onChange={(e) => setBuyerZuqaq(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="دار"
                          value={buyerHouseNo}
                          onChange={(e) => setBuyerHouseNo(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة والمنطقة الإجمالية</label>
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                      placeholder="مثال: بغداد - الحارثية"
                    />
                  </div>
                </div>

              </div>

              {/* Financials & Penalties Block */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>ثانياً: البنود المالية والتعهدات والشرط الجزائي</span>
                </h3>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {contractType === 'rent_agreement' ? 'بدل الإيجار الشهري (دينار عراقي)' : 'بدل البيع الكلي (دينار عراقي)'}
                    </label>
                    <input
                      type="number"
                      value={totalAmount || ''}
                      onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {contractType === 'rent_agreement' ? 'مبلغ التأمين المالي (دينار عراقي)' : 'العربون المدفوع المقبوض (دينار عراقي)'}
                    </label>
                    <input
                      type="number"
                      value={depositPaid || ''}
                      onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {contractType === 'rent_agreement' ? 'المتبقي من بدل الشهر الأول' : 'المبلغ المتبقي المستحق'}
                    </label>
                    <div className="p-2 bg-amber-50 text-amber-950 font-mono font-black text-center text-xs border border-amber-200 rounded-lg">
                      {formatPrice(remainingAmount, 'IQD')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-red-800 mb-1">
                      {contractType === 'rent_agreement' ? 'الشرط الجزائي عن التأخير اليومي بالتخلية' : 'تضمينات نكول البائع (الشرط الجزائي)'}
                    </label>
                    <input
                      type="number"
                      value={sellerPenalty || ''}
                      onChange={(e) => setSellerPenalty(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-red-50 text-red-950 border border-red-200 rounded-lg text-xs font-mono font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-red-800 mb-1">
                      {contractType === 'rent_agreement' ? 'الشرط الجزائي عن الإخلال ببنود العقد' : 'تضمينات نكول المشتري (الشرط الجزائي)'}
                    </label>
                    <input
                      type="number"
                      value={buyerPenalty || ''}
                      onChange={(e) => setBuyerPenalty(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-red-50 text-red-950 border border-red-200 rounded-lg text-xs font-mono font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة وموعد تسديد المبلغ المتبقي</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Witnesses Input */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ثالثاً: الشهود الحاضرون في مجلس العقد لتوثيق التوقيعات</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Witness 1 */}
                  <div className="border border-slate-200 p-3 rounded-lg space-y-2 bg-slate-50/50">
                    <span className="block text-[11px] font-bold text-slate-500">الشاهد الأول</span>
                    <input
                      type="text"
                      placeholder="الاسم الكامل للشاهد الأول"
                      value={witness1Name}
                      onChange={(e) => setWitness1Name(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                    />
                     <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="هاتف الشاهد"
                        value={witness1Phone}
                        onChange={(e) => setWitness1Phone(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Witness 2 */}
                  <div className="border border-slate-200 p-3 rounded-lg space-y-2 bg-slate-50/50">
                    <span className="block text-[11px] font-bold text-slate-500">الشاهد الثاني</span>
                    <input
                      type="text"
                      placeholder="الاسم الكامل للشاهد الثاني"
                      value={witness2Name}
                      onChange={(e) => setWitness2Name(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                    />
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="هاتف الشاهد"
                        value={witness2Phone}
                        onChange={(e) => setWitness2Phone(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Custom Clauses (Paragraph y) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {contractType === 'sale_deed' 
                      ? 'رابعاً: ملاحظات إضافية خاصة تكتب أسفل ورقة العقد (اختياري)' 
                      : 'رابعاً: ي - فقرات إضافية اختيارية تكتب أسفل ورقة العقد'}
                  </span>
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={extraLine1}
                    onChange={(e) => setExtraLine1(e.target.value)}
                    placeholder={contractType === 'sale_deed' ? 'الملاحظة الإضافية الأولى' : 'الفقرة الإضافية الأولى'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={extraLine2}
                    onChange={(e) => setExtraLine2(e.target.value)}
                    placeholder={contractType === 'sale_deed' ? 'الملاحظة الإضافية الثانية' : 'الفقرة الإضافية الثانية'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  {contractType !== 'sale_deed' && (
                    <input
                      type="text"
                      value={extraLine3}
                      onChange={(e) => setExtraLine3(e.target.value)}
                      placeholder="الفقرة الإضافية الثالثة"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Save / Confirm Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء التحرير
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>توليد ومعاينة ورقة المكاتبة الرسمية (A4)</span>
                </button>
              </div>

            </div>
          ) : contractType === 'rent_agreement' ? (
            <div className="space-y-8 print:space-y-0">
              {renderCopiesControlPanel()}
              {Array.from({ length: numCopies }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`${idx > 0 ? 'hidden print:block' : 'block'} relative`}
                  style={idx > 0 ? { pageBreakBefore: 'always', marginTop: '0' } : {}}
                >
                  {/* Stamp of copy label on the document */}
                  <div className="absolute top-4 right-4 border-4 border-dashed border-red-500 text-red-600 font-black px-4 py-1.5 rounded-lg text-xs tracking-wider rotate-[-6deg] bg-white/95 shadow-md z-50 pointer-events-none print:block hidden">
                    {getCopyLabel(idx, 'rent_agreement')}
                  </div>

                  {/* OFFICIAL LEASE AGREEMENT (عقد إيجار) TEMPLATE MATCHING THE PICTURE */}
                  <div className="max-w-[210mm] mx-auto bg-white border-[16px] border-double border-[#854d0e] p-0 shadow-lg print-container relative text-slate-950 select-text overflow-hidden" style={{ minHeight: '297mm' }}>
                    
                    {/* Main outer content block */}
                    <div className="p-6 sm:p-8 space-y-4 flex flex-col justify-between" style={{ minHeight: '290mm' }}>
                
                <div className="space-y-3">
                  {/* Classical Traditional Arabic Header */}
                  <div className="flex justify-between items-center border-b-2 border-amber-800 pb-3">
                    <div className="w-1/3 text-right text-[10px] text-slate-600 font-bold space-y-0.5">
                      <p>المحافظة: <span className="text-slate-900 font-black">{province}</span></p>
                      <p>المنطقة: <span className="text-slate-900 font-black">{district}</span></p>
                      <p>المحلة: <span className="text-slate-900 font-black">{mahalla || '........'}</span></p>
                    </div>
                    
                    <div className="w-1/3 text-center">
                      <h1 className="text-3xl font-black text-[#991b1b] tracking-wider">عقد إيجار</h1>
                      <span className="text-[10px] text-amber-800 font-bold block mt-0.5 tracking-widest">مجموعة مكاتب الرافدين العقارية</span>
                    </div>

                    <div className="w-1/3 flex flex-col items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">No. {contractId.replace('CT-', '') || '001818'}</span>
                      {qrCodeUrl ? (
                        <div className="mt-1 p-0.5 bg-white border border-amber-800 rounded shadow-sm">
                          <img src={qrCodeUrl} alt="Verification QR" className="w-12 h-12" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 animate-pulse mt-1" />
                      )}
                    </div>
                  </div>

                  {/* Header metadata lines */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-bold pt-1.5">
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-slate-700">تسلسل العقار:</span>
                      <span className="flex-grow border-b border-dotted border-slate-700 font-extrabold text-blue-900 px-2">
                        {registrationNo || '..........................................................'}
                      </span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-slate-700">رقم الأبواب:</span>
                      <span className="flex-grow border-b border-dotted border-slate-700 font-extrabold text-blue-900 px-2 text-center">
                        {houseNo || '..........................................................'}
                      </span>
                    </div>
                    <div className="flex items-end gap-1 col-span-2">
                      <span className="shrink-0 text-slate-700">الطرف الأول:</span>
                      <span className="flex-grow border-b border-dotted border-slate-700 font-extrabold text-[#991b1b] text-xs px-2">
                        {sellerName || '....................................................................................................'}
                      </span>
                      <span className="shrink-0 text-slate-500 font-bold">/ المدعو المؤجر</span>
                    </div>
                    <div className="flex items-end gap-1 col-span-2">
                      <span className="shrink-0 text-slate-700">الطرف الثاني:</span>
                      <span className="flex-grow border-b border-dotted border-slate-700 font-extrabold text-[#1e3a8a] text-xs px-2">
                        {buyerName || '....................................................................................................'}
                      </span>
                      <span className="shrink-0 text-slate-500 font-bold">/ المدعو المستأجر</span>
                    </div>
                  </div>

                  {/* Main Paragraph Declaration */}
                  <p className="text-[11px] text-justify leading-relaxed font-extrabold border-t border-slate-200 pt-2 text-slate-900">
                    أن الطرف الأول (المؤجر) قد أجر الى الطرف الثاني (المستأجر) بعد الرؤية والاطلاع العقار الموصوف أعلاه جنسه ( <span className="text-[#991b1b] underline font-black">{propType || '..................'}</span> ) لاتخاذه ( <span className="text-blue-900 underline font-black">{rentUsage || '..................'}</span> ) ببدل ايجار شهري قدره ( <span className="text-emerald-800 underline font-black">{totalAmount ? `${formatPrice(totalAmount, 'IQD')} (${tafqit(totalAmount)})` : '.............................................'}</span> ) ابتداءً من <span className="font-mono text-blue-900 underline">{rentStartDayStr} / {rentStartMonthStr} / ٢٠٢{rentStartYearStr} م</span> وفقاً للشروط الآتية :
                  </p>

                  {/* The 14 Terms exactly from printed image */}
                  <div className="space-y-1 text-[9.5px] text-justify leading-normal text-slate-800 pr-1 select-text font-semibold">
                    <p><strong>١.</strong> لا يحق للمستأجر استعماله لغير الغرض المبين في العقد الا بموافقة المؤجر التحريرية بعد ان شاهد المستأجر المأجور واطلع عليه كاملاً وقبله وتسلمه بحالته الكاملة عند الاستلام.</p>
                    <p><strong>٢.</strong> لا يجوز للمستأجر أجراء أي تغيير في المأجور مهما كان نوعه الا بعد حصول موافقة المؤجر التحريرية عند ذلك تكون كلفة التغيير على المستأجر ولا يحق له الرجوع بها على المؤجر كما لا يحق له ان يلغي هذا التغيير او المطالبة بكلفته في حالة ترك المأجور لأي سبب كان وكذلك الترميمات والاصلاح والصبغ والديكورات والتغليف وما شابه ذلك والتي يقوم بها المستأجر فتكون على نفقته الخاصة وليس له الحق بالرجوع بها على المؤجر لا قائمة ولا مستحقة للقلع.</p>
                    <p><strong>٣.</strong> لا يجوز للمستأجر الايجار من الباطن او التنازل عن المأجور كلاً أو جزءاً كما لا يجوز مشاركة غيره في المأجور الا بموافقة المؤجر التحريرية وبخلافه يعد ذلك اخلالاً بالعقد.</p>
                    <p><strong>٤.</strong> أن رسوم الماء والكهرباء والحراسة وأمانة بغداد ورسوم المهنة وضريبة الدخل يتحملها المستأجر ويدفعها منتظماً من خالص ماله وفي حالة ورود رسوم الماء والكهرباء بقائمة مجتمعاً لعدم وجود مقاييس كافية لتغطية عموم محلات البناية او المجمع فتدفع من قبل المؤجر اولاً وبعدها يجري تسديدها من قبل المستأجر مع بدل الايجار المشار اليه في الفقرة اعلاه بعد احتسابها كقسمة متساوية بين المستأجرين جميعاً.</p>
                    <p><strong>٥.</strong> ان المؤجر غير مسؤول عن السرقات نهائياً ان حدثت وتكون حراسة المأجور من مسؤولية المستأجر مباشرة.</p>
                    <p><strong>٦.</strong> في حالة اشغال المستأجر شقة في بناية تعود للمؤجر فعلى المستأجر الالتزام بأوقات فتح وغلق البناية المحدد من قبل المؤجر وحسب تعليمات الدوائر ذات العلاقة والاختصاص وكذلك لا يجوز المبيت في المأجور مطلقاً لأي سبب كان وعليه احترام الاعراف والتقاليد العامة وعدم قيامه بما يخالف ذلك.</p>
                    <p><strong>٧.</strong> عند انتهاء مدة الايجار او اخلاء المأجور لأي سبب يلتزم المستأجر بتخلية المأجور ويتعهد بتسليمه بالحالة التي كان قد سلمها وبحالة جيدة وخالية من جميع النواقص ويلتزم باصلاح جميع التركيبات الثابتة ويجعلها صالحة للاستعمال وبخلافه يتحمل الاضرار الكاملة عن ذلك.</p>
                    <p><strong>٨.</strong> في حالة تخلية المأجور بعد انتهاء مدة الايجار يكون المستأجر ملزماً بدفع عن مدة التأخير تعويض مقدره (ثلاثة اضعاف الايجار اليومي المتفق عليه) كشرط جزائي ملزم.</p>
                    <p><strong>٩.</strong> يقبل المستأجر التبليغات في المحل المستأجر من قبله الموصوف اعلاه وعليه تم الايجاب والقبول بشروط هذا العقد.</p>
                    <p><strong>١٠.</strong> الالتزام بنص قانون رقم ٢٥ لسنة ١٩٩٦ حالياً واي قوانين اخرى تخص الايجار مستقبلاً.</p>
                    <p><strong>١١.</strong> ان المستأجر مسؤول عن تأشير هذا العقد في الدوائر المختصة ذات العلاقة.</p>
                    <p><strong>١٢.</strong> ان المستأجر اعلاه اقر واعترف وأويد باني لم ادفع أي مبلغ الى مالك العقار (المؤجر) عند ابرام العقد او بعد ذلك عدا الايجار المنصوص عليه في هذا العقد والله على ما اقول شهيد.</p>
                    <p><strong>١٣.</strong> ان ضريبة العقار من مسؤولية المؤجر.</p>
                    <p className="font-extrabold text-[#b45309]"><strong>١٤.</strong> حرر هذا العقد بثلاث نسخ ووقع في بغداد واستلم كل طرف نسخة منه بتاريخ : <span className="font-mono text-blue-950 underline">{dayStr} / {monthStr} / ٢٠٢{yearStr} م</span></p>
                  </div>

                  {/* Additional/Custom Paragraphs (y) */}
                  {(extraLine1 || extraLine2 || extraLine3) && (
                    <div className="pt-1.5 border-t border-dashed border-amber-800/40">
                      <p className="font-bold text-slate-950 text-[10px] mb-0.5">شروط إضافية خاصة متفق عليها بين الطرفين :</p>
                      <ul className="list-disc list-inside space-y-0.5 pr-2 font-semibold text-slate-800 text-[9.5px]">
                        {extraLine1 && <li>{extraLine1}</li>}
                        {extraLine2 && <li>{extraLine2}</li>}
                        {extraLine3 && <li>{extraLine3}</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Signatures section mirroring the actual sheet */}
                <div className="pt-3 border-t-2 border-amber-800 grid grid-cols-4 gap-3 text-[9px] text-slate-950">
                  {/* Seller/Landlord block */}
                  <div className="border border-amber-800/30 p-2 rounded bg-amber-50/5 space-y-0.5">
                    <span className="block font-black text-[#991b1b] text-[10px] border-b border-amber-800/20 pb-0.5 text-center">الطرف الاول (المؤجر)</span>
                    <p className="truncate">الاسم: <strong className="text-slate-900">{sellerName || '...................'}</strong></p>
                    <p className="truncate">رقم الهوية: <span className="font-mono text-slate-700">{sellerIdNumber || '...................'}</span></p>
                    <p className="truncate">الموبايل: <span className="font-mono text-slate-700">{sellerPhone || '...................'}</span></p>
                    <p className="pt-2 text-[8px] text-slate-400 text-center">التوقيع والبصمة:</p>
                  </div>

                  {/* Witness 1 */}
                  <div className="border border-amber-800/30 p-2 rounded bg-amber-50/5 space-y-0.5">
                    <span className="block font-black text-slate-900 text-[10px] border-b border-amber-800/20 pb-0.5 text-center">الشاهد الأول</span>
                    <p className="truncate">الاسم: <strong className="text-slate-900">{witness1Name || '...................'}</strong></p>
                    <p className="truncate">الموبايل: <span className="font-mono text-slate-700">{witness1Phone || '...................'}</span></p>
                    <p className="pt-2 text-[8px] text-slate-400 text-center">التوقيع والبصمة:</p>
                  </div>

                  {/* Witness 2 */}
                  <div className="border border-amber-800/30 p-2 rounded bg-amber-50/5 space-y-0.5">
                    <span className="block font-black text-slate-900 text-[10px] border-b border-amber-800/20 pb-0.5 text-center">الشاهد الثاني</span>
                    <p className="truncate">الاسم: <strong className="text-slate-900">{witness2Name || '...................'}</strong></p>
                    <p className="truncate">الموبايل: <span className="font-mono text-slate-700">{witness2Phone || '...................'}</span></p>
                    <p className="pt-2 text-[8px] text-slate-400 text-center">التوقيع والبصمة:</p>
                  </div>

                  {/* Buyer/Tenant block */}
                  <div className="border border-amber-800/30 p-2 rounded bg-amber-50/5 space-y-0.5">
                    <span className="block font-black text-blue-900 text-[10px] border-b border-amber-800/20 pb-0.5 text-center">الطرف الثاني (المستأجر)</span>
                    <p className="truncate">الاسم: <strong className="text-slate-900">{buyerName || '...................'}</strong></p>
                    <p className="truncate">رقم الهوية: <span className="font-mono text-slate-700">{buyerIdNumber || '...................'}</span></p>
                    <p className="truncate">الموبايل: <span className="font-mono text-slate-700">{buyerPhone || '...................'}</span></p>
                    <p className="pt-2 text-[8px] text-slate-400 text-center">التوقيع والبصمة:</p>
                  </div>
                </div>



              </div>
            </div>
          </div>
        ))
        }
        {/* Rent agreement copy block end */}
      </div>
      ) : (
        <div className="space-y-8 print:space-y-0">
          {renderCopiesControlPanel()}
          {Array.from({ length: numCopies }).map((_, idx) => (
            <div 
              key={idx}
              className={`${idx > 0 ? 'hidden print:block' : 'block'} relative`}
              style={idx > 0 ? { pageBreakBefore: 'always', marginTop: '0' } : {}}
            >
              {/* Stamp of copy label on the document */}
              <div className="absolute top-4 right-4 border-4 border-dashed border-red-500 text-red-600 font-black px-4 py-1.5 rounded-lg text-xs tracking-wider rotate-[-6deg] bg-white/95 shadow-md z-50 pointer-events-none print:block hidden">
                {getCopyLabel(idx, 'sale_deed')}
              </div>

              {/* OFFICIAL A4 DESIGN TEMPLATE (عقد بيع وشراء الدور والأراضي السكنية والزراعية) */}
              <div className="max-w-[210mm] mx-auto bg-white border border-slate-300 p-0 shadow-lg print-container relative text-slate-950 select-text overflow-hidden" style={{ minHeight: '297mm' }}>
                
                {/* Main outer content block with thin black frame */}
                <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between" style={{ minHeight: '297mm' }}>
                
                <div className="space-y-4">
                  {/* Elegant Traditional Header Banner */}
                  <div className="relative text-center bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-xl shadow-md border-4 border-double border-amber-500">
                    {/* QR Code on the Left */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-1 rounded-lg shadow border-2 border-amber-500 no-print">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Verification" className="w-16 h-16 sm:w-20 sm:h-20" />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 animate-pulse" />
                      )}
                    </div>

                    {/* QR Code visible on PRINT */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-1 rounded-lg border-2 border-amber-500 hidden print:block">
                      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 sm:w-20 sm:h-20" />}
                    </div>

                    {/* Banner Titles */}
                    <div className="pl-20 pr-4 text-right sm:text-center sm:pl-16">
                      <h1 className="text-2xl md:text-3xl font-black tracking-wide text-amber-400 drop-shadow">
                        عقد بيع وشراء الدور والأراضي السكنية والزراعية
                      </h1>
                      <div className="mt-2 inline-block bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-md">
                        <p className="text-xs md:text-sm font-black text-slate-100 tracking-wider">
                          مكتب الأصدقاء للعقار <span className="text-amber-400">|</span> الشعب - الجمعيات
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Serial Number & Official License Row */}
                  <div className="flex items-center justify-between px-2 pt-2 text-xs">
                    <span className="font-mono text-red-600 font-black text-sm md:text-base">
                      № {contractId.replace('CT-', '') || '003711'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      مكتب الأصدقاء للعقار | الشعب - الجمعيات | إجازة نقابة رقم: {officeSettings.licenseNumber || '٥٤٢'}
                    </span>
                  </div>

                  {/* Core Content Lines with dashed styling as preprinted form */}
                  <div className="space-y-3.5 text-xs text-slate-900 leading-relaxed pt-2">
                    
                    {/* Seller Line */}
                    <div className="flex items-end gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-950 shrink-0">الطرف الاول البائع :</span>
                      <span className="flex-1 min-w-[200px] border-b border-dotted border-slate-600 pb-0.5 font-extrabold text-blue-900 text-[13px] px-2">
                        {sellerName || '........................................................................'}
                      </span>
                    </div>

                    {/* Seller Address */}
                    <div className="flex items-end gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-950 shrink-0">عنوان البائع :</span>
                      <span className="flex-1 grid grid-cols-3 gap-2">
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          محلة: <strong className="text-blue-900 font-black">{sellerMahalla || '...'}</strong>
                        </span>
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          زقاق: <strong className="text-blue-900 font-black">{sellerZuqaq || '...'}</strong>
                        </span>
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          دار: <strong className="text-blue-900 font-black">{sellerHouseNo || '...'}</strong>
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-500">({sellerAddress})</span>
                    </div>

                    {/* Buyer Line */}
                    <div className="flex items-end gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-950 shrink-0">الطرف الثاني المشتري :</span>
                      <span className="flex-1 min-w-[200px] border-b border-dotted border-slate-600 pb-0.5 font-extrabold text-blue-900 text-[13px] px-2">
                        {buyerName || '........................................................................'}
                      </span>
                    </div>

                    {/* Buyer Address */}
                    <div className="flex items-end gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-950 shrink-0">عنوان المشتري :</span>
                      <span className="flex-1 grid grid-cols-3 gap-2">
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          محلة: <strong className="text-blue-900 font-black">{buyerMahalla || '...'}</strong>
                        </span>
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          زقاق: <strong className="text-blue-900 font-black">{buyerZuqaq || '...'}</strong>
                        </span>
                        <span className="border-b border-dotted border-slate-600 pb-0.5 px-2">
                          دار: <strong className="text-blue-900 font-black">{buyerHouseNo || '...'}</strong>
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-500">({buyerAddress})</span>
                    </div>

                    <div className="text-center font-bold text-slate-950 border-t border-b border-slate-200 py-1 my-2">
                      تم الاتفاق بين الطرفين على ابرام هذا العقد وبالشروط الاتية :
                    </div>

                    {/* Property Specs Block */}
                    <div className="space-y-3">
                      <div className="flex items-end gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-950 shrink-0">اولاً : أ - يعترف الطرف الاول ( البائع ) بأنه قد باع الى الطرف الثاني (المشتري) الملك المفصل فيما يلي : -</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div className="flex items-end gap-1">
                          <span className="shrink-0 font-bold">نوع الملك:</span>
                          <span className="flex-1 border-b border-dotted border-slate-600 font-black text-blue-900 pb-0.5 px-2">
                            {propType || '.....................................'}
                          </span>
                        </div>
                        <div className="flex items-end gap-1">
                          <span className="shrink-0 font-bold">المساحة:</span>
                          <span className="flex-1 border-b border-dotted border-slate-600 font-black text-blue-900 pb-0.5 px-2 text-center">
                            {propArea ? `${propArea} م²` : '.....................................'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div className="flex items-end gap-1">
                          <span className="shrink-0 font-bold">الرقم والتسلسل:</span>
                          <span className="flex-1 border-b border-dotted border-slate-600 font-black text-blue-900 pb-0.5 px-2">
                            {registrationNo || '.....................................'}
                          </span>
                        </div>
                        <div className="flex items-end gap-1">
                          <span className="shrink-0 font-bold">المحلة / الحي:</span>
                          <span className="flex-1 border-b border-dotted border-slate-600 font-black text-blue-900 pb-0.5 px-2">
                            {mahalla || '.....................................'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Blocks & Clauses (أ، ب، ج، د، هـ، و، ز، ح، ط، ي، ك، ل) */}
                    <div className="space-y-2.5 pt-2 text-xs">
                      {/* B: Total Amount */}
                      <div className="flex items-end gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-950 shrink-0">ب - ان بدل البيع المتفق عليه هو :</span>
                        <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 font-black text-blue-900 px-2 text-center text-[12.5px]">
                          {totalAmount ? `${formatPrice(totalAmount, 'IQD')} (${tafqit(totalAmount)})` : '..........................................................................................'}
                        </span>
                      </div>

                      {/* C: Deposit Paid */}
                      <div className="flex items-end gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-950 shrink-0">ج - العربون المدفوع هو :</span>
                        <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 font-black text-emerald-800 px-2 text-center text-[12.5px]">
                          {depositPaid ? `${formatPrice(depositPaid, 'IQD')} (${tafqit(depositPaid)})` : '..........................................................................................'}
                        </span>
                      </div>

                      {/* D: Remaining */}
                      <div className="flex items-end gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-950 shrink-0">د - المتبقي من المبلغ هو :</span>
                        <span className="flex-1 border-b border-dotted border-slate-600 pb-0.5 font-black text-amber-900 px-2 text-center text-[12.5px]">
                          {remainingAmount ? `${formatPrice(remainingAmount, 'IQD')} (${tafqit(remainingAmount)})` : '..........................................................................................'}
                        </span>
                      </div>

                      {/* E: Penalty Seller */}
                      <div className="space-y-1 leading-relaxed text-right">
                        <span className="font-bold text-slate-950 block">هـ - اذا امتنع الطرف الاول (البائع) عن التنازل او نكل عن البيع بأية صورة كانت فانه يكون ملزماً بأعادة العربون ويتعهد بدفع تضمينات للمشتري قدرها :</span>
                        <div className="w-full border-b border-dotted border-slate-600 pb-0.5 font-black text-red-900 px-2 text-center text-[12.5px] min-h-[22px]">
                          {sellerPenalty ? `${formatPrice(sellerPenalty, 'IQD')} (${tafqit(sellerPenalty)})` : '..........................................................................................................................................................................................'}
                        </div>
                      </div>

                      {/* F: Penalty Buyer */}
                      <div className="space-y-1 leading-relaxed text-right">
                        <span className="font-bold text-slate-950 block">و - يعترف الطرف الثاني (المشتري) بأنه قد قبل الشراء وفي حالة النكول عن الشراء وتأدية قصور البدل فأنه يتعهد بتأدية تضمينات للبائع قدرها :</span>
                        <div className="w-full border-b border-dotted border-slate-600 pb-0.5 font-black text-red-900 px-2 text-center text-[12.5px] min-h-[22px]">
                          {buyerPenalty ? `${formatPrice(buyerPenalty, 'IQD')} (${tafqit(buyerPenalty)})` : '..........................................................................................................................................................................................'}
                        </div>
                      </div>

                      {/* Date and Place right under paragraph و */}
                      <div className="flex items-end justify-between pt-2.5 pb-2 font-bold border-b border-dashed border-slate-300 my-2">
                        <span>فبناء على حصول التراضي والايجاب والقبول قرر هذا العقد في تاريخ :</span>
                        <div className="flex items-center gap-1 font-mono text-xs text-blue-900 pl-4">
                          <span>{dayStr}</span>
                          <span>/</span>
                          <span>{monthStr}</span>
                          <span>/</span>
                          <span>٢٠٢{yearStr} م</span>
                        </div>
                      </div>

                      {/* Standard Fixed Sequential Clauses (1 to 7) */}
                      <div className="space-y-1.5 pt-2 text-[11px] leading-relaxed border-t border-slate-100 text-right" dir="rtl">
                        <p><strong>١ -</strong> كل مكاتبة غير مختومة بختم المكتب تعتبر باطلة.</p>
                        <p><strong>٢ -</strong> يلتزم الطرفان بالحضور أمام مديريات التسجيل العقاري والدوائر التابعة لها.</p>
                        <p><strong>٣ -</strong> يتحمل الطرفان كافة المصاريف القانونية وأتعاب الدلالية بالكامل للمكتب العقاري.</p>
                        <p><strong>٤ -</strong> نسبة أجور الدلالية ووساطة المكتب المستحقة هي ٢٪ وتدفع مناصفة بين الطرفين ولا تسترجع عند حصول أي خلاف بين الطرفين.</p>
                        <p><strong>٥ -</strong> تم تحرير هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها عند الحاجة.</p>
                        <p><strong>٦ -</strong> يتحمل البائع رسوم الأمانة والضريبة وجباية الماء والكهرباء.</p>
                        <p><strong>٧ -</strong> يتحمل المشتري رسوم الشراء وتعقيب المعاملة.</p>
                      </div>
                    </div>

                    {/* Additional Custom Remarks Section */}
                    <div className="pt-2 border-t border-dashed border-slate-300 mt-2 text-right" dir="rtl">
                      <p className="font-bold text-slate-950 mb-1.5 text-[11px]">( ملاحظات إضافية ( خاصة )</p>
                      <div className="space-y-1.5 text-slate-800 text-[10.5px] font-semibold pr-1">
                        <div className="flex items-center gap-1">
                          <span className="shrink-0">١.</span>
                          <span className="flex-1 border-b border-dotted border-slate-500 pb-0.5 text-right font-bold text-blue-900 min-h-[16px] px-2">
                            {extraLine1 || '_________________________________________________________________________________'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="shrink-0">٢.</span>
                          <span className="flex-1 border-b border-dotted border-slate-500 pb-0.5 text-right font-bold text-blue-900 min-h-[16px] px-2">
                            {extraLine2 || '_________________________________________________________________________________'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Signatures section mirroring the actual sheet */}
                <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-4 gap-4 text-[10px] text-slate-950">
                  
                  {/* Seller Sign block */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/40 space-y-1">
                    <span className="block font-black text-slate-900 text-[11px] border-b border-slate-300 pb-0.5 text-center">الطرف الاول (البائع)</span>
                    <p>الاسم: <strong className="text-slate-900">{sellerName || '...................'}</strong></p>
                    <p>رقم الهوية: <span className="font-mono">{sellerIdNumber || '...................'}</span></p>
                    <p>الموبايل: <span className="font-mono">{sellerPhone || '...................'}</span></p>
                    <p className="pt-3 text-[9px] text-slate-400 text-center">توقيعه وبصمته:</p>
                  </div>

                   {/* Witness 1 */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/40 space-y-1">
                    <span className="block font-black text-slate-900 text-[11px] border-b border-slate-300 pb-0.5 text-center">الشاهد الاول</span>
                    <p>الاسم: <strong className="text-slate-900">{witness1Name || '...................'}</strong></p>
                    <p>الموبايل: <span className="font-mono">{witness1Phone || '...................'}</span></p>
                    <p className="pt-3 text-[9px] text-slate-400 text-center">توقيعه وبصمته:</p>
                  </div>

                  {/* Witness 2 */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/40 space-y-1">
                    <span className="block font-black text-slate-900 text-[11px] border-b border-slate-300 pb-0.5 text-center">الشاهد الثاني</span>
                    <p>الاسم: <strong className="text-slate-900">{witness2Name || '...................'}</strong></p>
                    <p>الموبايل: <span className="font-mono">{witness2Phone || '...................'}</span></p>
                    <p className="pt-3 text-[9px] text-slate-400 text-center">توقيعه وبصمته:</p>
                  </div>

                  {/* Buyer Sign block */}
                  <div className="border border-slate-300 p-2 rounded bg-slate-50/40 space-y-1">
                    <span className="block font-black text-slate-900 text-[11px] border-b border-slate-300 pb-0.5 text-center">الطرف الثاني (المشتري)</span>
                    <p>الاسم: <strong className="text-slate-900">{buyerName || '...................'}</strong></p>
                    <p>رقم الهوية: <span className="font-mono">{buyerIdNumber || '...................'}</span></p>
                    <p>الموبايل: <span className="font-mono">{buyerPhone || '...................'}</span></p>
                    <p className="pt-3 text-[9px] text-slate-400 text-center">توقيعه وبصمته:</p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        ))
        }
        {/* Sale deed copy block end */}
      </div>
    )}

        </div>

      </div>
    </div>
  );
}
