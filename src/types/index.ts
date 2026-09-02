export type DealType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'building' | 'villa' | 'farm';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'withdrawn';
export type Currency = 'IQD';

export interface PropertyOwner {
  name: string;
  phone: string;
  nationalId?: string;
  notes?: string;
}

export interface ReservationDetails {
  clientName: string;
  clientPhone: string;
  depositAmount: number;
  currency: Currency;
  date: string;
  expiryDate: string;
  notes?: string;
}

export interface SaleDetails {
  buyerName: string;
  buyerPhone: string;
  salePrice: number;
  currency: Currency;
  saleDate: string;
  commission: number;
  commissionPaidBy: 'buyer' | 'seller' | 'split';
  contractId?: string;
  notes?: string;
}

export interface PropertyHistoryEntry {
  id: string;
  date: string;
  action: 'created' | 'updated' | 'price_change' | 'reserved' | 'reservation_cancelled' | 'contract_created' | 'sold' | 'rented' | 'archived' | 'restored' | 'note_added';
  title: string;
  description: string;
  performedBy?: string;
}

export interface Property {
  id: string; // e.g. AQ-1021
  title: string;
  type: PropertyType;
  dealType: DealType;
  area: number; // in square meters (م²)
  price: number;
  currency: Currency;
  rentPeriod?: 'monthly' | 'yearly';
  
  // Location Hierarchy
  province: string;
  district: string;
  mahalla?: string; // المحلة
  zuqaq?: string;   // الزقاق
  houseNo?: string; // رقم الدار
  landmark?: string; // علامة مميزة
  
  // Specifications
  bedrooms: number;
  bathrooms: number;
  floors: number;
  facadeOrientation: string; // الواجهة (شمالية، جنوبية، شرقية، غربية، ركن...)
  facadeWidth?: number;      // عرض الواجهة بالمتر
  depth?: number;            // النزال بالمتر
  features: string[];        // مميزات العقار (سند طابو ملك صرف، كراج، مسبح، بناء حديث...)
  description: string;
  images: string[];
  videoUrl?: string;

  // Private Data (Office only)
  owner: PropertyOwner;
  internalNotes?: string;

  // Status & Lifecycle
  status: PropertyStatus;
  reservationDetails?: ReservationDetails;
  saleDetails?: SaleDetails;
  archiveReason?: 'sold' | 'rented' | 'withdrawn' | 'expired' | 'other';
  archiveDate?: string;

  createdAt: string;
  updatedAt: string;
  history: PropertyHistoryEntry[];
}

export interface ClientRequest {
  id: string;
  clientName: string;
  phone: string;
  dealType: DealType;
  propertyType: PropertyType | 'all';
  minArea?: number;
  maxArea?: number;
  province: string;
  preferredDistricts: string[];
  minBudget?: number;
  maxBudget?: number;
  currency: Currency;
  notes?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export interface ContractParty {
  name: string;
  phone: string;
  idNumber: string;
  address: string;
  mahalla?: string;
  zuqaq?: string;
  houseNo?: string;
}

export interface Contract {
  id: string; // e.g. CT-2026-004
  propertyId: string;
  contractType: 'sale_deed' | 'rent_agreement'; // مكاتبة بيع وشراء / عقد إيجار
  date: string;
  propertyDetails: {
    code: string;
    title: string;
    type: string;
    area: number;
    province: string;
    district: string;
    mahalla?: string;
    zuqaq?: string;
    houseNo?: string;
    deedType?: string; // طابو ملك صرف، طابو زراعي، إفراز حديث
    specs: string;
    registrationNo?: string; // الرقم والتسلسل
  };
  seller: ContractParty;
  buyer: ContractParty;
  financials: {
    totalAmount: number;
    depositPaid: number;
    remainingAmount: number;
    currency: Currency;
    commissionAmount: number;
    commissionPaidBy: 'buyer' | 'seller' | 'split';
    paymentTerms?: string;
    rentStartDate?: string;
    rentEndDate?: string;
    rentUsage?: string;
    sellerPenalty?: number; // تضمينات نكول البائع
    buyerPenalty?: number;  // تضمينات نكول المشتري
  };
  terms: string[];
  witnesses: { name: string; phone: string; idNumber?: string }[];
  notes?: string;
  createdAt: string;
}

export interface OfficeSettings {
  officeName: string;
  officeTagline: string;
  licenseNumber: string;
  managerName: string;
  phone1: string;
  phone2: string;
  email?: string;
  address: string;
  defaultCommissionPercentage: number;
  defaultCurrency: Currency;
  autoArchiveOnSale?: boolean;
  appPasscode?: string;
}
