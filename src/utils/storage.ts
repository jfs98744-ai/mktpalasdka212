import { Property, ClientRequest, Contract, OfficeSettings } from '../types';
import { initialProperties, initialClientRequests, initialContracts, defaultOfficeSettings } from '../data/initialData';

const STORAGE_KEYS = {
  PROPERTIES: 'aqar_plus_properties_v2',
  ARCHIVED_PROPERTIES: 'aqar_plus_archived_v2',
  CLIENT_REQUESTS: 'aqar_plus_clients_v2',
  CONTRACTS: 'aqar_plus_contracts_v2',
  OFFICE_SETTINGS: 'aqar_plus_settings_v2',
};

// Initial split between active and archived
const defaultActiveProperties = initialProperties.filter(
  (p) => p.status !== 'sold' && p.status !== 'rented' && p.status !== 'withdrawn'
);
const defaultArchivedProperties = initialProperties.filter(
  (p) => p.status === 'sold' || p.status === 'rented' || p.status === 'withdrawn'
);

export function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!raw) {
      saveProperties(defaultActiveProperties);
      return defaultActiveProperties;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading properties from storage', e);
    return defaultActiveProperties;
  }
}

export function saveProperties(properties: Property[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  } catch (e) {
    console.error('Error saving properties', e);
  }
}

export function loadArchivedProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVED_PROPERTIES);
    if (!raw) {
      saveArchivedProperties(defaultArchivedProperties);
      return defaultArchivedProperties;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading archived properties from storage', e);
    return defaultArchivedProperties;
  }
}

export function saveArchivedProperties(properties: Property[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_PROPERTIES, JSON.stringify(properties));
  } catch (e) {
    console.error('Error saving archived properties', e);
  }
}

export function loadClientRequests(): ClientRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_REQUESTS);
    if (!raw) {
      saveClientRequests(initialClientRequests);
      return initialClientRequests;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading client requests', e);
    return initialClientRequests;
  }
}

export function saveClientRequests(requests: ClientRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENT_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving client requests', e);
  }
}

export function loadContracts(): Contract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    if (!raw) {
      saveContracts(initialContracts);
      return initialContracts;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading contracts', e);
    return initialContracts;
  }
}

export function saveContracts(contracts: Contract[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  } catch (e) {
    console.error('Error saving contracts', e);
  }
}

export function loadOfficeSettings(): OfficeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFICE_SETTINGS);
    if (!raw) {
      saveOfficeSettings(defaultOfficeSettings);
      return defaultOfficeSettings;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading office settings', e);
    return defaultOfficeSettings;
  }
}

export function saveOfficeSettings(settings: OfficeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFICE_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving office settings', e);
  }
}

export function generateNextPropertyId(existingProperties: Property[]): string {
  const ids = existingProperties
    .map(p => {
      const match = p.id.match(/AQ-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxId = ids.length > 0 ? Math.max(...ids) : 1000;
  const nextNum = Math.max(maxId + 1, 1001);
  return `AQ-${nextNum.toString().padStart(4, '0')}`;
}

export function generateNextContractId(existingContracts: Contract[]): string {
  const year = new Date().getFullYear();
  const count = existingContracts.length + 1;
  return `CT-${year}-${count.toString().padStart(3, '0')}`;
}

export function generateNextClientId(existingClients: ClientRequest[]): string {
  const ids = existingClients
    .map(c => {
      const match = c.id.match(/REQ-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxId = ids.length > 0 ? Math.max(...ids) : 500;
  const nextNum = Math.max(maxId + 1, 501);
  return `REQ-${nextNum}`;
}

export function resetToInitialData(currentSettings?: OfficeSettings): {
  properties: Property[];
  archivedProperties: Property[];
  contracts: Contract[];
  clientRequests: ClientRequest[];
  officeSettings: OfficeSettings;
} {
  localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.ARCHIVED_PROPERTIES);
  localStorage.removeItem(STORAGE_KEYS.CLIENT_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.CONTRACTS);
  
  const settings = currentSettings || defaultOfficeSettings;
  if (!currentSettings) {
    localStorage.removeItem(STORAGE_KEYS.OFFICE_SETTINGS);
    saveOfficeSettings(defaultOfficeSettings);
  } else {
    saveOfficeSettings(currentSettings);
  }

  saveProperties([]);
  saveArchivedProperties([]);
  saveClientRequests([]);
  saveContracts([]);

  return {
    properties: [],
    archivedProperties: [],
    contracts: [],
    clientRequests: [],
    officeSettings: settings,
  };
}

export function formatPrice(amount: number, currency: 'IQD' = 'IQD'): string {
  return `${amount.toLocaleString('ar-IQ')} د.ع`;
}

export function formatArea(area: number): string {
  return `${area} م²`;
}

export function getPropertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    house: 'دار سكني',
    apartment: 'شقة سكنية',
    land: 'قطعة أرض',
    commercial: 'محل / تجاري',
    building: 'عمارة / مجمع',
    villa: 'فيلا فاخرة',
    farm: 'بستان / مزرعة',
    all: 'جميع الأصناف',
  };
  return map[type] || type;
}

export function getStatusLabel(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'available':
      return { label: 'متوفر', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-500' };
    case 'reserved':
      return { label: 'محجوز (عربون)', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', border: 'border-amber-500' };
    case 'sold':
      return { label: 'تم البيع (أرشيف)', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', border: 'border-blue-500' };
    case 'rented':
      return { label: 'تم التأجير (أرشيف)', bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', border: 'border-purple-500' };
    case 'withdrawn':
      return { label: 'مسحوب من المالك', bg: 'bg-slate-100 text-slate-700 border-slate-300', text: 'text-slate-700', border: 'border-slate-400' };
    default:
      return { label: status, bg: 'bg-gray-50 text-gray-700 border-gray-200', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

export function createBackupJson(
  properties: Property[],
  archivedProperties: Property[],
  clients: ClientRequest[],
  contracts: Contract[],
  settings: OfficeSettings
): string {
  return JSON.stringify({
    version: '2.0',
    exportDate: new Date().toISOString(),
    properties,
    archivedProperties,
    clientRequests: clients,
    contracts,
    officeSettings: settings,
  }, null, 2);
}
