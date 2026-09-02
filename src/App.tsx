import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  TabType 
} from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PropertyList } from './components/PropertyList';
import { PropertyDossierModal } from './components/PropertyDossierModal';
import { AddEditPropertyModal } from './components/AddEditPropertyModal';
import { ClientRequestsView } from './components/ClientRequestsView';
import { ContractBuilderModal } from './components/ContractBuilderModal';
import { ContractsView } from './components/ContractsView';
import { SaleRecordModal } from './components/SaleRecordModal';
import { ReservationModal } from './components/ReservationModal';
import { ArchiveView } from './components/ArchiveView';
import { PublicShowcaseModal } from './components/PublicShowcaseModal';
import { ReportsView } from './components/ReportsView';
import { SettingsModal } from './components/SettingsModal';
import { PublicPropertyView } from './components/PublicPropertyView';
import { PublicContractView } from './components/PublicContractView';

import { 
  Property, 
  ClientRequest, 
  Contract, 
  OfficeSettings, 
  SaleDetails, 
  ReservationDetails 
} from './types';
import {
  loadProperties,
  saveProperties,
  loadArchivedProperties,
  saveArchivedProperties,
  loadClientRequests,
  saveClientRequests,
  loadContracts,
  saveContracts,
  loadOfficeSettings,
  saveOfficeSettings,
  generateNextPropertyId,
  generateNextClientId,
  resetToInitialData,
} from './utils/storage';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Public Client View (scanned QR / direct link)
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicProperty, setPublicProperty] = useState<Property | null>(null);

  // Public Client Contract View
  const [publicContract, setPublicContract] = useState<Contract | null>(null);
  const [isPublicContractView, setIsPublicContractView] = useState(false);
  const [contractToView, setContractToView] = useState<Contract | null>(null);

  // Core Data States
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [archivedProperties, setArchivedProperties] = useState<Property[]>(loadArchivedProperties);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>(loadClientRequests);
  const [contracts, setContracts] = useState<Contract[]>(loadContracts);
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>(loadOfficeSettings);

  // Selected Entity Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddEditPropertyOpen, setIsAddEditPropertyOpen] = useState(false);

  // Contract Builder Modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTargetProperty, setContractTargetProperty] = useState<Property | null>(null);
  const [contractPrefillBuyer, setContractPrefillBuyer] = useState<{ name?: string; phone?: string }>({});

  // Sale Record & Reservation Modals
  const [saleTargetProperty, setSaleTargetProperty] = useState<Property | null>(null);
  const [reservationTargetProperty, setReservationTargetProperty] = useState<Property | null>(null);

  // Public QR Showcase Modal
  const [showcaseTargetProperty, setShowcaseTargetProperty] = useState<Property | null>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    saveProperties(properties);
  }, [properties]);

  useEffect(() => {
    saveArchivedProperties(archivedProperties);
  }, [archivedProperties]);

  useEffect(() => {
    saveClientRequests(clientRequests);
  }, [clientRequests]);

  useEffect(() => {
    saveContracts(contracts);
  }, [contracts]);

  useEffect(() => {
    saveOfficeSettings(officeSettings);
  }, [officeSettings]);

  // Deep linking and hash-change observer for QR code scanning
  useEffect(() => {
    const handleHashChange = () => {
      const params = new URLSearchParams(window.location.search);
      let propCode = params.get('property');
      let contractCode = '';
      
      const hash = window.location.hash;
      if (hash.startsWith('#public-property=')) {
        propCode = hash.replace('#public-property=', '');
      } else if (hash.startsWith('#public-contract=')) {
        contractCode = hash.replace('#public-contract=', '');
      } else if (hash.startsWith('#')) {
        const potentialCode = hash.replace('#', '');
        if (potentialCode.startsWith('AQ-')) {
          propCode = potentialCode;
        } else if (potentialCode.startsWith('CT-')) {
          contractCode = potentialCode;
        }
      }
      
      if (propCode) {
        const all = [...properties, ...archivedProperties];
        const match = all.find((p) => p.id.toUpperCase() === propCode!.toUpperCase());
        if (match) {
          if (hash.startsWith('#public-property=')) {
            setPublicProperty(match);
            setIsPublicView(true);
          } else {
            setShowcaseTargetProperty(match);
          }
        }
      }

      if (contractCode) {
        const match = contracts.find((c) => c.id.toUpperCase() === contractCode.toUpperCase());
        if (match) {
          setPublicContract(match);
          setIsPublicContractView(true);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [properties, archivedProperties, contracts]);

  // --- Handlers: Property Management ---

  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setIsAddEditPropertyOpen(true);
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setIsAddEditPropertyOpen(true);
  };

  const handleSaveProperty = (propertyData: Partial<Property>) => {
    if (editingProperty) {
      // Update existing
      const updated = properties.map((p) =>
        p.id === editingProperty.id
          ? ({
              ...p,
              ...propertyData,
              updatedAt: new Date().toISOString(),
              history: [
                {
                  id: `h-${Date.now()}`,
                  date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  action: 'updated' as const,
                  title: 'تعديل بيانات العقار',
                  description: 'تم تحديث مواصفات وسعر ومعلومات العقار.',
                  performedBy: officeSettings.managerName,
                },
                ...p.history,
              ],
            } as Property)
          : p
      );
      setProperties(updated);
      if (selectedProperty && selectedProperty.id === editingProperty.id) {
        const refreshed = updated.find((p) => p.id === editingProperty.id);
        if (refreshed) setSelectedProperty(refreshed);
      }
    } else {
      // Create new
      const newProp: Property = {
        id: propertyData.id || generateNextPropertyId([...properties, ...archivedProperties]),
        title: propertyData.title || '',
        type: propertyData.type || 'house',
        dealType: propertyData.dealType || 'sale',
        rentPeriod: propertyData.rentPeriod,
        area: propertyData.area || 0,
        price: propertyData.price || 0,
        currency: propertyData.currency || 'IQD',
        status: 'available',
        province: propertyData.province || 'بغداد',
        district: propertyData.district || 'الكرادة',
        mahalla: propertyData.mahalla,
        zuqaq: propertyData.zuqaq,
        houseNo: propertyData.houseNo,
        landmark: propertyData.landmark,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        floors: propertyData.floors || 1,
        facadeOrientation: propertyData.facadeOrientation || 'شمالية',
        facadeWidth: propertyData.facadeWidth,
        depth: propertyData.depth,
        features: propertyData.features || [],
        description: propertyData.description || '',
        images: propertyData.images || [],
        videoUrl: propertyData.videoUrl,
        owner: propertyData.owner || { name: '', phone: '' },
        internalNotes: propertyData.internalNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            action: 'created',
            title: 'تسجيل العقار في المنظومة',
            description: 'تم إنشاء الملف الإلكتروني وتوليد كود العقار والـ QR بنجاح.',
            performedBy: officeSettings.managerName,
          },
        ],
      };
      setProperties([newProp, ...properties]);
    }
    setIsAddEditPropertyOpen(false);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
  };

  const handleAddHistoryNote = (propertyId: string, noteTitle: string, noteText: string) => {
    const updated = properties.map((p) => {
      if (p.id === propertyId) {
        return {
          ...p,
          history: [
            {
              id: `h-${Date.now()}`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              action: 'note_added' as const,
              title: noteTitle,
              description: noteText,
              performedBy: officeSettings.managerName,
            },
            ...p.history,
          ],
        };
      }
      return p;
    });
    setProperties(updated);
    if (selectedProperty?.id === propertyId) {
      const refreshed = updated.find((p) => p.id === propertyId);
      if (refreshed) setSelectedProperty(refreshed);
    }
  };

  // --- Handlers: Reservation & Sale / Archive ---

  const handleOpenReservation = (prop: Property) => {
    setReservationTargetProperty(prop);
  };

  const handleConfirmReservation = (propertyId: string, details: ReservationDetails) => {
    const updated = properties.map((p) => {
      if (p.id === propertyId) {
        return {
          ...p,
          status: 'reserved' as const,
          reservationDetails: details,
          updatedAt: new Date().toISOString(),
          history: [
            {
              id: `h-${Date.now()}`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              action: 'reserved' as const,
              title: 'تثبيت حجز وقبض عربون',
              description: `تم حجز العقار لصالح العميل ${details.clientName} بعربون قدره ${details.depositAmount} ${details.currency}.`,
              performedBy: officeSettings.managerName,
            },
            ...p.history,
          ],
        };
      }
      return p;
    });
    setProperties(updated);
    if (selectedProperty?.id === propertyId) {
      const active = updated.find((p) => p.id === propertyId);
      if (active) setSelectedProperty(active);
    }
  };

  const handleCancelReservation = (prop: Property) => {
    const updated = properties.map((p) => {
      if (p.id === prop.id) {
        const copy = { 
          ...p, 
          status: 'available' as const,
          history: [
            {
              id: `h-${Date.now()}`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              action: 'reservation_cancelled' as const,
              title: 'إلغاء الحجز وإعادة التوفير',
              description: 'تم إلغاء حجز العقار وإعادته إلى قائمة العقارات المتاحة.',
              performedBy: officeSettings.managerName,
            },
            ...p.history,
          ]
        };
        delete copy.reservationDetails;
        return copy;
      }
      return p;
    });
    setProperties(updated);
    if (selectedProperty?.id === prop.id) {
      const active = updated.find((p) => p.id === prop.id);
      if (active) setSelectedProperty(active);
    }
  };

  const handleOpenSaleModal = (prop: Property) => {
    if (prop.dealType === 'sale') {
      handleOpenNewContract(prop);
    } else {
      setSaleTargetProperty(prop);
    }
  };

  const handleConfirmSale = (propertyId: string, saleDetails: SaleDetails) => {
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return;

    const completedStatus = prop.dealType === 'sale' ? 'sold' : 'rented';
    const archivedProp: Property = {
      ...prop,
      status: completedStatus,
      saleDetails,
      archiveReason: completedStatus,
      archiveDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: completedStatus,
          title: completedStatus === 'sold' ? 'تسجيل البيع ونقل للأرشيف' : 'تسجيل الإيجار ونقل للأرشيف',
          description: `تم إتمام الصفقة بمبلغ ${saleDetails.salePrice} ${saleDetails.currency} للمشتري/المستأجر ${saleDetails.buyerName}.`,
          performedBy: officeSettings.managerName,
        },
        ...prop.history,
      ],
    };

    // Remove from active properties & add to archive
    setProperties(properties.filter((p) => p.id !== propertyId));
    setArchivedProperties([archivedProp, ...archivedProperties]);

    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }
  };

  const handleRestoreArchivedProperty = (propertyId: string) => {
    const archived = archivedProperties.find((p) => p.id === propertyId);
    if (!archived) return;

    const restoredProp: Property = {
      ...archived,
      status: 'available',
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'restored' as const,
          title: 'استرجاع العقار من الأرشيف',
          description: 'تمت إعادة العقار لقائمة المعروضات المتاحة النشطة.',
          performedBy: officeSettings.managerName,
        },
        ...archived.history,
      ],
    };
    delete restoredProp.saleDetails;
    delete restoredProp.reservationDetails;
    delete restoredProp.archiveReason;
    delete restoredProp.archiveDate;

    setArchivedProperties(archivedProperties.filter((p) => p.id !== propertyId));
    setProperties([restoredProp, ...properties]);
  };

  // --- Handlers: Contracts ---

  const handleOpenNewContract = (
    prop?: Property | null,
    buyerName?: string,
    buyerPhone?: string
  ) => {
    setContractTargetProperty(prop || (properties.length > 0 ? properties[0] : null));
    setContractPrefillBuyer({ name: buyerName, phone: buyerPhone });
    setIsContractModalOpen(true);
  };

  const handleSaveContract = (newContract: Contract) => {
    setContracts([newContract, ...contracts]);

    // Auto-complete deal (sale or rent) and archive property if it exists!
    const propertyId = newContract.propertyId;
    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      const completedStatus = newContract.contractType === 'sale_deed' ? 'sold' : 'rented';
      const saleDetails = {
        buyerName: newContract.buyer.name,
        buyerPhone: newContract.buyer.phone,
        salePrice: newContract.financials.totalAmount,
        currency: newContract.financials.currency,
        saleDate: newContract.date,
        commission: newContract.financials.commissionAmount || 0,
        commissionPaidBy: newContract.financials.commissionPaidBy,
        contractId: newContract.id,
        notes: newContract.contractType === 'sale_deed'
          ? 'تم توليد وحفظ مكاتبة البيع الرسمية بنجاح ونقل العقار تلقائياً للأرشيف كعقار مباع.'
          : 'تم توليد وحفظ عقد الإيجار الرسمي بنجاح ونقل العقار تلقائياً للأرشيف كعقار مؤجر.'
      };
      
      const archivedProp: Property = {
        ...prop,
        status: completedStatus,
        saleDetails,
        archiveReason: completedStatus,
        archiveDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            action: completedStatus,
            title: completedStatus === 'sold' ? 'تسجيل البيع ونقل للأرشيف (مكاتبة)' : 'تسجيل الإيجار ونقل للأرشيف (عقد)',
            description: `تم توليد وحفظ المكاتبة رقم ${newContract.id} بمبلغ ${saleDetails.salePrice} ${saleDetails.currency} للطرف الثاني ${saleDetails.buyerName}.`,
            performedBy: officeSettings.managerName,
          },
          ...prop.history,
        ],
      };

      setProperties(prev => prev.filter((p) => p.id !== propertyId));
      setArchivedProperties(prev => [archivedProp, ...prev]);

      if (selectedProperty?.id === propertyId) {
        setSelectedProperty(null);
      }
    }
  };

  // --- Handlers: Clients ---

  const handleAddClient = (req: Partial<ClientRequest>) => {
    const newClient: ClientRequest = {
      id: generateNextClientId(clientRequests),
      clientName: req.clientName || '',
      phone: req.phone || '',
      dealType: req.dealType || 'sale',
      propertyType: req.propertyType || 'all',
      minArea: req.minArea,
      maxArea: req.maxArea,
      province: req.province || 'بغداد',
      preferredDistricts: req.preferredDistricts || ['الكرادة'],
      minBudget: req.minBudget,
      maxBudget: req.maxBudget,
      currency: req.currency || 'IQD',
      status: 'active',
      notes: req.notes,
      createdAt: new Date().toISOString(),
    };
    setClientRequests([newClient, ...clientRequests]);
  };

  const handleUpdateClient = (updated: ClientRequest) => {
    setClientRequests(clientRequests.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteClient = (id: string) => {
    setClientRequests(clientRequests.filter((c) => c.id !== id));
  };

  // --- Handlers: Backup & System Reset ---

  const handleResetData = () => {
    const initial = resetToInitialData();
    setProperties(initial.properties);
    setArchivedProperties(initial.archivedProperties);
    setContracts(initial.contracts);
    setClientRequests(initial.clientRequests);
    setOfficeSettings(initial.officeSettings);
  };

  const handleImportData = (data: {
    properties: Property[];
    archivedProperties: Property[];
    contracts: Contract[];
    clientRequests: ClientRequest[];
    officeSettings: OfficeSettings;
  }) => {
    setProperties(data.properties);
    setArchivedProperties(data.archivedProperties);
    setContracts(data.contracts);
    setClientRequests(data.clientRequests);
    setOfficeSettings(data.officeSettings);
  };

  if (isPublicContractView && publicContract) {
    return (
      <PublicContractView
        contract={publicContract}
        officeSettings={officeSettings}
        onBackToDashboard={() => {
          setIsPublicContractView(false);
          setPublicContract(null);
          window.location.hash = '';
        }}
      />
    );
  }

  if (isPublicView && publicProperty) {
    return (
      <PublicPropertyView
        property={publicProperty}
        officeSettings={officeSettings}
        onBackToDashboard={() => {
          setIsPublicView(false);
          setPublicProperty(null);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddProperty={handleOpenAddProperty}
        onOpenSettings={() => setIsSettingsOpen(true)}
        officeName={officeSettings.officeName}
        availableCount={properties.filter((p) => p.status === 'available').length}
        clientCount={clientRequests.filter((c) => c.status === 'active').length}
        contractCount={contracts.length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            properties={[...properties, ...archivedProperties]}
            clientRequests={clientRequests}
            contracts={contracts}
            officeSettings={officeSettings}
            onSelectProperty={setSelectedProperty}
            onAddNewProperty={handleOpenAddProperty}
            onAddNewClient={() => {
              setActiveTab('clients');
            }}
            onNewContract={(prop) => handleOpenNewContract(prop)}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {activeTab === 'properties' && (
          <PropertyList
            properties={properties}
            onSelectProperty={setSelectedProperty}
            onAddNewProperty={handleOpenAddProperty}
            onShowQR={(prop) => setShowcaseTargetProperty(prop)}
            onCreateContract={(prop) => handleOpenNewContract(prop)}
            onRecordSale={(prop) => handleOpenSaleModal(prop)}
            onReserveProperty={(prop) => handleOpenReservation(prop)}
            onDeleteProperty={handleDeleteProperty}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'clients' && (
          <ClientRequestsView
            clientRequests={clientRequests}
            properties={properties}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onSelectProperty={setSelectedProperty}
            onCreateContract={(prop, bName, bPhone) => handleOpenNewContract(prop, bName, bPhone)}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            properties={[...properties, ...archivedProperties]}
            officeSettings={officeSettings}
            onNewContract={() => {
              setContractToView(null);
              setContractTargetProperty(null);
              setIsContractModalOpen(true);
            }}
            onViewContract={(c) => {
              setContractToView(c);
              setContractTargetProperty(null);
              setIsContractModalOpen(true);
            }}
            onSelectProperty={setSelectedProperty}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            archivedProperties={archivedProperties}
            contracts={contracts}
            onSelectProperty={setSelectedProperty}
            onRestoreProperty={handleRestoreArchivedProperty}
            onViewContract={(c) => {
              setContractToView(c);
              setContractTargetProperty(null);
              setIsContractModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            properties={properties}
            archivedProperties={archivedProperties}
            contracts={contracts}
            clientRequests={clientRequests}
            officeSettings={officeSettings}
          />
        )}

      </main>

      {/* --- MODALS --- */}

      {/* 1. Property Dossier Modal (الملف الإلكتروني المتكامل) */}
      <PropertyDossierModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onEdit={(prop) => handleEditProperty(prop)}
        onCreateContract={(prop) => handleOpenNewContract(prop)}
        onReserve={(prop) => handleOpenReservation(prop)}
        onCancelReserve={(prop) => handleCancelReservation(prop)}
        onRecordSale={(prop) => handleOpenSaleModal(prop)}
        onAddHistoryNote={handleAddHistoryNote}
        onShowPublicQR={(prop) => setShowcaseTargetProperty(prop)}
      />

      {/* 2. Add / Edit Property Modal */}
      <AddEditPropertyModal
        isOpen={isAddEditPropertyOpen}
        onClose={() => setIsAddEditPropertyOpen(false)}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
        existingProperties={[...properties, ...archivedProperties]}
      />

      {/* 3. Contract Builder Modal (المكاتبة والعقد الرسمي) */}
      <div key={isContractModalOpen ? `contract-modal-${contractToView?.id || contractTargetProperty?.id || 'new'}` : 'closed'}>
        <ContractBuilderModal
          isOpen={isContractModalOpen}
          onClose={() => {
            setIsContractModalOpen(false);
            setContractToView(null);
          }}
          onSaveContract={handleSaveContract}
          property={contractTargetProperty}
          existingContracts={contracts}
          officeSettings={officeSettings}
          prefillBuyerName={contractPrefillBuyer.name}
          prefillBuyerPhone={contractPrefillBuyer.phone}
          clientList={clientRequests}
          initialContract={contractToView}
        />
      </div>

      {/* 4. Sale Record & Close Deal Modal (تسجيل البيع ونقل للأرشيف) */}
      <SaleRecordModal
        property={saleTargetProperty}
        isOpen={!!saleTargetProperty}
        onClose={() => setSaleTargetProperty(null)}
        onConfirmSale={handleConfirmSale}
        availableContracts={contracts}
      />

      {/* 5. Reservation Modal (تثبيت حجز وعربون) */}
      <ReservationModal
        property={reservationTargetProperty}
        isOpen={!!reservationTargetProperty}
        onClose={() => setReservationTargetProperty(null)}
        onConfirmReservation={handleConfirmReservation}
      />

      {/* 6. Public QR Showcase & Client View Simulator */}
      <PublicShowcaseModal
        property={showcaseTargetProperty}
        isOpen={!!showcaseTargetProperty}
        onClose={() => setShowcaseTargetProperty(null)}
        officeSettings={officeSettings}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        officeSettings={officeSettings}
        onUpdateSettings={setOfficeSettings}
        onResetData={handleResetData}
        properties={properties}
        archivedProperties={archivedProperties}
        contracts={contracts}
        clientRequests={clientRequests}
        onImportData={handleImportData}
      />

    </div>
  );
}

export default App;
