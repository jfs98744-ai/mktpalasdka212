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

export const initialProperties: Property[] = [];

export const initialClientRequests: ClientRequest[] = [];

export const initialContracts: Contract[] = [];

