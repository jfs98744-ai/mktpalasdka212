import { Property, ClientRequest, Contract, OfficeSettings } from '../types';

export const defaultOfficeSettings: OfficeSettings = {
  officeName: 'مكتب الرافدين للاستثمارات والتسويق العقاري',
  officeTagline: 'خدمات الوساطة العقارية المعتمدة وإدارة الأملاك والمكاتبات الرسمية',
  licenseNumber: 'إجازة نقابة العقاريين العراقيين رقم: 5419/بغداد',
  managerName: 'الحاج مهدي عبد الحسين الخفاجي',
  phone1: '+964 770 123 4567',
  phone2: '+964 780 987 6543',
  email: 'info@alrafidain-realestate.iq',
  address: 'بغداد - الكرادة خارج - تقاطع المسبح - مجمع النور التجاري ط1',
  defaultCommissionPercentage: 2,
  defaultCurrency: 'IQD',
};

export const initialProperties: Property[] = [
  {
    id: 'AQ-1001',
    title: 'دار سكني حديث طابقين بناء درجة أولى',
    type: 'house',
    dealType: 'sale',
    area: 250,
    price: 500000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'الكرادة',
    mahalla: '903',
    zuqaq: '18',
    houseNo: '24',
    landmark: 'قرب ساحة الواثق وشارع السعدون',
    bedrooms: 5,
    bathrooms: 4,
    floors: 2,
    facadeOrientation: 'شمالية شرقية',
    facadeWidth: 10,
    depth: 25,
    features: [
      'سند ملكية طابو ملك صرف',
      'كراج لسيارتين',
      'حديقة أمامية منسقة',
      'بناء حديث 2023 مرمر تركي',
      'منظومة كاميرات ومراقبة',
      'خط مولدة سحب مباشر',
      'عزل حراري وصوتي'
    ],
    description: 'دار سكني راقي جداً بموقع مميز وهادئ بالكرادة، واجهة حجرية إيطالية، تشطيبات ديلوكس، صالة ضيوف واسعة مع هول داخلي، مطبخ حار وبارد، سويت نوم ماستر مع بلكونة واسعة.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'أبو أحمد السعدون',
      phone: '07705551122',
      nationalId: '19782294101',
      notes: 'المالك جاد ومستعجل للبيع لسفر العائلة، السعر قابل للتفاوض البسيط للزبون النقدي.'
    },
    internalNotes: 'المفتاح متوفر لدى المكتب في الدرج رقم 4. مراجعة الطابو جاهزة وبدون أي حجز أو مانع قانوني.',
    status: 'available',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-08-10T11:00:00Z',
    history: [
      {
        id: 'h-1',
        date: '2026-08-10 11:00',
        action: 'created',
        title: 'تسجيل العقار في المنظومة',
        description: 'تم إنشاء الملف الإلكتروني وتوليد كود العقار والـ QR بنجاح عبر موظف المكتب.',
        performedBy: 'أحمد التميمي (مسؤول الإدخال)'
      }
    ]
  },
  {
    id: 'AQ-1002',
    title: 'شقة فاخرة للإيجار مجمع سكني مغلق',
    type: 'apartment',
    dealType: 'rent',
    rentPeriod: 'monthly',
    area: 175,
    price: 1500000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'الجادرية',
    mahalla: '915',
    zuqaq: '7',
    houseNo: 'عمارة برج دجلة ط4 شقة 16',
    landmark: 'مطلة على نهر دجلة وقرب جامعة بغداد',
    bedrooms: 3,
    bathrooms: 3,
    floors: 1,
    facadeOrientation: 'غربية بحرية',
    facadeWidth: 12,
    depth: 14.5,
    features: [
      'مفروشة بالكامل أثاث تركي ملكي',
      'إطلالة مباشرة على كورنيش دجلة',
      'حراسة وأمن 24 ساعة',
      'مصاعد ميتسوبيشي ذكية',
      'موقف سيارات تحت الأرض مخصص',
      'كهرباء مستمرة 24 ساعة'
    ],
    description: 'شقة سكنية راقية جداً في أرقى أبراج الجادرية، ديكورات جبسية إنارة مخفية، تكييف مركزي متكامل، بلكونة زجاجية بانورامية، صالة استقبال فخمة.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'د. سرمد النعيمي',
      phone: '07801239988',
      notes: 'يفضل التأجير لعائلة هادئة أو موظفي منظمات وشركات أجنبية بعقد سنوي.'
    },
    internalNotes: 'الإيجار يدفع مقدماً كل 6 أشهر، التأمين يعادل شهر واحد.',
    status: 'available',
    createdAt: '2026-08-14T09:30:00Z',
    updatedAt: '2026-08-14T09:30:00Z',
    history: [
      {
        id: 'h-2',
        date: '2026-08-14 09:30',
        action: 'created',
        title: 'تسجيل العقار للإيجار',
        description: 'تم تسجيل الشقة وإدراج صور المعاينة وتفاصيل المؤجر.',
        performedBy: 'علي الكرخي'
      }
    ]
  },
  {
    id: 'AQ-1003',
    title: 'قطعة أرض تجارية موقع استراتيجي ركن',
    type: 'land',
    dealType: 'sale',
    area: 400,
    price: 1250000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'المنصور',
    mahalla: '601',
    zuqaq: '32',
    houseNo: 'قطعة 14/م',
    landmark: 'شارع 14 رمضان قرب مطعم الساعة',
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    facadeOrientation: 'ركن (واجهتين شمالية وغربية)',
    facadeWidth: 20,
    depth: 20,
    features: [
      'سند طابو ملك صرف خالي من الموانع',
      'تصنيف تجاري / سكني استثماري',
      'واجهة عريضة 20 متر على شارع رئيسي عريض',
      'إفراز رسمي وموافقات بناء مصدقة'
    ],
    description: 'أرض تجارية نادرة في قلب حي المنصور التجاري، واجهة ممتازة على شارع رئيسي عريض، تصلح لإنشاء مجمع تجاري أو عيادات طبية أو مقر شركة كبرى.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'الحاج كمال البرزنجي',
      phone: '07714448899',
      nationalId: '19650041239',
      notes: 'الأوراق الرسمية كاملة والوكيل موجود في بغداد للتنازل الفوري.'
    },
    internalNotes: 'العمولة 1.5% من كل طرف.',
    status: 'reserved',
    reservationDetails: {
      clientName: 'شركة البشائر للاستثمار العقاري',
      clientPhone: '07901112233',
      depositAmount: 20000000,
      currency: 'IQD',
      date: '2026-08-25',
      expiryDate: '2026-09-05',
      notes: 'تم دفع العربون لحين استكمال مطابقة خارطة التسجيل العقاري.'
    },
    createdAt: '2026-08-01T14:15:00Z',
    updatedAt: '2026-08-25T16:00:00Z',
    history: [
      {
        id: 'h-3a',
        date: '2026-08-01 14:15',
        action: 'created',
        title: 'تسجيل القطعة في المنظومة',
        description: 'تسجيل أرض تجارية بالمنصور بمساحة 400م²',
        performedBy: 'أحمد التميمي'
      },
      {
        id: 'h-3b',
        date: '2026-08-25 16:00',
        action: 'reserved',
        title: 'حجز العقار وقبض عربون',
        description: 'تم تثبيت حجز العقار لصالح شركة البشائر بعربون بقيمة 20,000,000 د.ع لغاية 5 أيلول.',
        performedBy: 'الحاج مهدي الخفاجي'
      }
    ]
  },
  {
    id: 'AQ-1004',
    title: 'فيلا عصرية فخمة مع مسبح وحديقة واسعة',
    type: 'villa',
    dealType: 'sale',
    area: 600,
    price: 1500000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'اليرموك',
    mahalla: '612',
    zuqaq: '45',
    houseNo: '8',
    landmark: 'منطقة السفارات والمربع الهادئ',
    bedrooms: 6,
    bathrooms: 6,
    floors: 3,
    facadeOrientation: 'جنوبية',
    facadeWidth: 24,
    depth: 25,
    features: [
      'مسبح خارجي متطور مع تدفئة وتصفية',
      'حديقة استوائية مع شلال اصطناعي',
      'مصعد بانورامي داخلي',
      'غرفة سينما منزلية خاصة',
      'نظام سمارت هوم ذكي بالكامل',
      'غرفة سائق وغرفة خادمة مستقلة'
    ],
    description: 'تحفة معمارية باليرموك، تصميم أندلسي مودرن، زجاج دبل معزول ثلاث طبقات، أطقم صحيات ألمانية، مطابخ مستوردة، أرضيات خشب باركيه ألماني.',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'السيد فراس الجميلي',
      phone: '07728889900',
      notes: 'التسليم الفوري مع الأثاث الفاخر بالكامل.'
    },
    internalNotes: 'المعاينة بتحديد موعد مسبق قبل 24 ساعة.',
    status: 'available',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
    history: [
      {
        id: 'h-4',
        date: '2026-08-18 10:00',
        action: 'created',
        title: 'إدراج فيلا فاخرة',
        description: 'تم إدراج الفيلا مع تفاصيل المسبح والحديقة والـ QR code.',
        performedBy: 'علي الكرخي'
      }
    ]
  },
  {
    id: 'AQ-1005',
    title: 'محل تجاري طابقين على شارع الربيعي',
    type: 'commercial',
    dealType: 'rent',
    rentPeriod: 'yearly',
    area: 85,
    price: 25000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'زيونة',
    mahalla: '714',
    zuqaq: '12',
    houseNo: 'محل 3',
    landmark: 'شارع الربيعي العام مقابل مول زيونة',
    bedrooms: 0,
    bathrooms: 1,
    floors: 2,
    facadeOrientation: 'شمالية',
    facadeWidth: 5.5,
    depth: 15,
    features: [
      'واجهة زجاجية سيكوريت عريضة',
      'سنديانة وديكورات معارض ملابس جاهزة',
      'طابق ميزانين تخزين مجهز',
      'حركة تسوق كثيفة جداً',
      'مكيفات سبلت 3 طن عدد 2'
    ],
    description: 'محل تجاري جاهز للتشغيل الفوري في أنشط شوارع بغداد التجارية، مناسب لماركات الألبسة، العطور، الإلكترونيات أو البصريات.',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'الحاج برهان الزبيدي',
      phone: '07812223344',
      notes: 'عقد الإيجار سنوي الدفع كل 6 أشهر مقدماً.'
    },
    status: 'available',
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z',
    history: [
      {
        id: 'h-5',
        date: '2026-08-20 12:00',
        action: 'created',
        title: 'تسجيل محل تجاري للإيجار',
        description: 'إدراج محل شارع الربيعي في قاعدة بيانات الإيجار التجاري.',
        performedBy: 'أحمد التميمي'
      }
    ]
  },
  {
    id: 'AQ-0988',
    title: 'دار سكني 200م² بناء حديث - حي الجامعة',
    type: 'house',
    dealType: 'sale',
    area: 200,
    price: 350000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'حي الجامعة',
    mahalla: '629',
    zuqaq: '33',
    houseNo: '19',
    landmark: 'خلف شارع الربيع وقرب جامع ملا حويش',
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    facadeOrientation: 'شرقية',
    facadeWidth: 10,
    depth: 20,
    features: ['سند طابو ملك صرف', 'كراج سيارة', 'بناء 2022', 'تشطيب لوكس'],
    description: 'دار سكني طابقين بتصميم هندسي حديث تم بيعه بنجاح وتوثيق المكاتبة في المكتب.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'الأستاذ هيثم الشمري',
      phone: '07709998877',
      nationalId: '19821034902'
    },
    status: 'sold',
    saleDetails: {
      buyerName: 'المحامي رائد عبد الكريم',
      buyerPhone: '07805554433',
      salePrice: 340000000,
      currency: 'IQD',
      saleDate: '2026-08-22',
      commission: 6800000,
      commissionPaidBy: 'split',
      contractId: 'CT-2026-088',
      notes: 'تمت البيعة بتراضي الطرفين وتم استلام العربون والمكاتبة الرسمية وتحويل الملف للأرشيف.'
    },
    archiveReason: 'sold',
    archiveDate: '2026-08-22T17:00:00Z',
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-08-22T17:00:00Z',
    history: [
      {
        id: 'h-988a',
        date: '2026-07-15 10:00',
        action: 'created',
        title: 'تسجيل العقار',
        description: 'تسجيل دار حي الجامعة للبيع بسعر 350,000,000 د.ع.',
        performedBy: 'أحمد التميمي'
      },
      {
        id: 'h-988b',
        date: '2026-08-19 15:30',
        action: 'price_change',
        title: 'تخفيض السعر للتفاوض',
        description: 'موافقة المالك على تخفيض السعر إلى 340,000,000 د.ع لسرعة البيع.',
        performedBy: 'الحاج مهدي الخفاجي'
      },
      {
        id: 'h-988c',
        date: '2026-08-22 16:30',
        action: 'contract_created',
        title: 'تحرير مكاتبة بيع وشراء رسمية',
        description: 'تحرير مكاتبة رقم CT-2026-088 بين البائع هيثم والمشتري رائد.',
        performedBy: 'الحاج مهدي الخفاجي'
      },
      {
        id: 'h-988d',
        date: '2026-08-22 17:00',
        action: 'sold',
        title: 'تسجيل البيع ونقل للأرشيف',
        description: 'تم تسجيل البيع رسمياً بمبلغ 340,000,000 د.ع واستيفاء عمولة المكتب ونقل العقار للأرشيف.',
        performedBy: 'الحاج مهدي الخفاجي'
      }
    ]
  },
  {
    id: 'AQ-0975',
    title: 'عمارة تجارية 4 طوابق - شارع فلسطين',
    type: 'building',
    dealType: 'rent',
    rentPeriod: 'yearly',
    area: 500,
    price: 60000000,
    currency: 'IQD',
    province: 'بغداد',
    district: 'شارع فلسطين',
    mahalla: '505',
    zuqaq: '11',
    houseNo: '2',
    bedrooms: 0,
    bathrooms: 8,
    floors: 4,
    facadeOrientation: 'شمالية',
    facadeWidth: 15,
    depth: 33,
    features: ['موقع تجاري حيوي', 'مصعد حمولة وأفراد', 'كراج سفلي', 'تكييف كامل'],
    description: 'عمارة تجارية تم تأجيرها لشركة اتصالات لمدة 3 سنوات.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    owner: {
      name: 'السيد هاشم الموسوي',
      phone: '07703332211'
    },
    status: 'rented',
    saleDetails: {
      buyerName: 'شركة أفق للاتصالات وتكنولوجيا المعلومات',
      buyerPhone: '07800001122',
      salePrice: 60000000,
      currency: 'IQD',
      saleDate: '2026-08-05',
      commission: 1200000,
      commissionPaidBy: 'buyer',
      contractId: 'CT-2026-075',
      notes: 'عقد إيجار سنوي موثق.'
    },
    archiveReason: 'rented',
    archiveDate: '2026-08-05T14:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-05T14:00:00Z',
    history: [
      {
        id: 'h-975a',
        date: '2026-07-01 10:00',
        action: 'created',
        title: 'إدراج العمارة للإيجار',
        description: 'تسجيل عمارة تجارية بشارع فلسطين.',
        performedBy: 'علي الكرخي'
      },
      {
        id: 'h-975b',
        date: '2026-08-05 14:00',
        action: 'rented',
        title: 'تأجير العمارة وتحويلها للأرشيف',
        description: 'تم توقيع عقد الإيجار لمدة 3 سنوات مع شركة أفق.',
        performedBy: 'الحاج مهدي الخفاجي'
      }
    ]
  }
];

export const initialClientRequests: ClientRequest[] = [
  {
    id: 'REQ-501',
    clientName: 'الدكتور حيدر العبيدي',
    phone: '07701122334',
    dealType: 'sale',
    propertyType: 'house',
    minArea: 200,
    maxArea: 300,
    province: 'بغداد',
    preferredDistricts: ['الكرادة', 'الجادرية', 'القادسية'],
    minBudget: 400000000,
    maxBudget: 550000000,
    currency: 'IQD',
    notes: 'يبحث عن دار طابو ملك صرف جاهز للسكن، يفضل كراج سيارتين وبناء حديث.',
    status: 'active',
    createdAt: '2026-08-24T11:00:00Z'
  },
  {
    id: 'REQ-502',
    clientName: 'السيدة ندى الصالحي',
    phone: '07804455667',
    dealType: 'rent',
    propertyType: 'apartment',
    minArea: 150,
    maxArea: 200,
    province: 'بغداد',
    preferredDistricts: ['الجادرية', 'المنصور'],
    minBudget: 1200000,
    maxBudget: 2000000,
    currency: 'IQD',
    notes: 'شقة مفروشة نظيفة في عمارة ذات حراسة وكهرباء مستمرة لعائلة صغيرة.',
    status: 'active',
    createdAt: '2026-08-26T14:30:00Z'
  },
  {
    id: 'REQ-503',
    clientName: 'المهندس وسام الدليمي (مجموعة استثمارية)',
    phone: '07719988776',
    dealType: 'sale',
    propertyType: 'land',
    minArea: 300,
    maxArea: 600,
    province: 'بغداد',
    preferredDistricts: ['المنصور', 'اليرموك', 'حي الجامعة'],
    minBudget: 900000000,
    maxBudget: 1600000000,
    currency: 'IQD',
    notes: 'أرض بموقع تجاري أو شارع عام استثماري، الدفع كاش والتنازل فوري.',
    status: 'active',
    createdAt: '2026-08-28T09:00:00Z'
  }
];

export const initialContracts: Contract[] = [
  {
    id: 'CT-2026-088',
    propertyId: 'AQ-0988',
    contractType: 'sale_deed',
    date: '2026-08-22',
    propertyDetails: {
      code: 'AQ-0988',
      title: 'دار سكني 200م² بناء حديث',
      type: 'دار سكني طابقين',
      area: 200,
      province: 'بغداد',
      district: 'حي الجامعة',
      mahalla: '629',
      zuqaq: '33',
      houseNo: '19',
      deedType: 'طابو ملك صرف (تسجيل عقاري الكرخ)',
      specs: 'بناء طابوق جمهوري درجة أولى، 4 غرف نوم، كراج، تشطيبات ديلوكس.'
    },
    seller: {
      name: 'هيثم جاسم الشمري',
      phone: '07709998877',
      idNumber: '19821034902 - هوية أحوال بغداد',
      address: 'بغداد - حي الجامعة م 629 ز 33'
    },
    buyer: {
      name: 'رائد عبد الكريم الحمداني',
      phone: '07805554433',
      idNumber: '19864455120 - بطاقة وطنية موحدة',
      address: 'بغداد - المنصور شارع الأميرات'
    },
    financials: {
      totalAmount: 340000000,
      depositPaid: 30000000,
      remainingAmount: 310000000,
      currency: 'IQD',
      commissionAmount: 6800000,
      commissionPaidBy: 'split',
      paymentTerms: 'يُدفع المبلغ المتبقي (310,000,000 د.ع) في دائرة التسجيل العقاري عند إتمام التنازل الرسمي وتحويل السند.'
    },
    terms: [
      'يقر الطرف الأول (البائع) بخلو العقار المذكور من أي رهن، أو حجز تنفيذي، أو حقوق عينية للغير، ويتحمل كامل المسؤولية القانونية.',
      'يلتزم الطرف الثاني (المشتري) بتسديد المبلغ المتبقي عند استدعاء التسجيل العقاري لإتمام المعاملة.',
      'في حال نكول الطرف الأول عن البيع يُلزم بإرجاع العربون مضاعفاً، وفي حال نكول الطرف الثاني يسقط حقه بالمطالبة بالعربون.',
      'تُستوفى أجور الوساطة والدلالية العقارية لمكتب الرافدين المعتمد بنسبة 2% من القيمة الإجمالية وتُدفع مناصفة بين الطرفين ولا تُرد لأي سبب.',
      'تم تحرير هذه المكاتبة بحضور الشهود المذكورين والمكتب العقاري وجرى التوقيع والبصمة برضا الطرفين واختيارهما.'
    ],
    witnesses: [
      { name: 'جاسم محمد التميمي', phone: '07701230000', idNumber: 'بطاقة موحدة 19754433' },
      { name: 'عمر خالد السامرائي', phone: '07809988111', idNumber: 'بطاقة موحدة 19807766' }
    ],
    notes: 'تمت المكاتبة في مقر مكتب الرافدين للعقارات بحضور صاحب المكتب الحاج مهدي الخفاجي.',
    createdAt: '2026-08-22T16:30:00Z'
  }
];
