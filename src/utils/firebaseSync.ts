import React, { useEffect, useRef, useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property, ClientRequest, Contract, OfficeSettings, SubscriptionInfo } from '../types';

// Generic helper to sync local array changes to a Firestore collection
async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  localItems: T[]
) {
  try {
    const batch = writeBatch(db);
    localItems.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();

    // Delete items from Firestore that are not in the local list
    const querySnapshot = await getDocs(collection(db, collectionName));
    const localIds = new Set(localItems.map(item => item.id));
    
    const deleteBatch = writeBatch(db);
    let hasDeletions = false;
    querySnapshot.docs.forEach((d) => {
      if (!localIds.has(d.id)) {
        deleteBatch.delete(d.ref);
        hasDeletions = true;
      }
    });
    if (hasDeletions) {
      await deleteBatch.commit();
    }
  } catch (error) {
    console.error(`Error syncing collection ${collectionName} to Firestore:`, error);
  }
}

// Single seeding helper to upload initial data to empty Firestore
async function seedCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
    console.log(`Seeded ${collectionName} with ${items.length} records.`);
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

export function useFirebaseSync(
  properties: Property[],
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>,
  archivedProperties: Property[],
  setArchivedProperties: React.Dispatch<React.SetStateAction<Property[]>>,
  clientRequests: ClientRequest[],
  setClientRequests: React.Dispatch<React.SetStateAction<ClientRequest[]>>,
  contracts: Contract[],
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>,
  officeSettings: OfficeSettings,
  setOfficeSettings: React.Dispatch<React.SetStateAction<OfficeSettings>>,
  subscription: SubscriptionInfo | null,
  setSubscription: React.Dispatch<React.SetStateAction<SubscriptionInfo | null>>
) {
  // Store stringified versions to detect changes originating from Firestore vs. local state
  const lastPropertiesRef = useRef<string>('');
  const lastArchivedPropertiesRef = useRef<string>('');
  const lastClientRequestsRef = useRef<string>('');
  const lastContractsRef = useRef<string>('');
  const lastOfficeSettingsRef = useRef<string>('');
  const lastSubscriptionRef = useRef<string>('');

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Properties
    const unsubProperties = onSnapshot(collection(db, 'properties'), async (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty but we have local properties, seed them
        if (properties.length > 0) {
          await seedCollection('properties', properties);
        }
      } else {
        const items = snapshot.docs.map(d => d.data() as Property);
        // Sort or maintain original order if needed (or just sort by ID/date)
        const itemsStr = JSON.stringify(items);
        if (itemsStr !== JSON.stringify(properties)) {
          lastPropertiesRef.current = itemsStr;
          setProperties(items);
        }
      }
    });

    // 2. Subscribe to Archived Properties
    const unsubArchivedProperties = onSnapshot(collection(db, 'archivedProperties'), async (snapshot) => {
      if (snapshot.empty) {
        if (archivedProperties.length > 0) {
          await seedCollection('archivedProperties', archivedProperties);
        }
      } else {
        const items = snapshot.docs.map(d => d.data() as Property);
        const itemsStr = JSON.stringify(items);
        if (itemsStr !== JSON.stringify(archivedProperties)) {
          lastArchivedPropertiesRef.current = itemsStr;
          setArchivedProperties(items);
        }
      }
    });

    // 3. Subscribe to Client Requests
    const unsubClientRequests = onSnapshot(collection(db, 'clientRequests'), async (snapshot) => {
      if (snapshot.empty) {
        if (clientRequests.length > 0) {
          await seedCollection('clientRequests', clientRequests);
        }
      } else {
        const items = snapshot.docs.map(d => d.data() as ClientRequest);
        const itemsStr = JSON.stringify(items);
        if (itemsStr !== JSON.stringify(clientRequests)) {
          lastClientRequestsRef.current = itemsStr;
          setClientRequests(items);
        }
      }
    });

    // 4. Subscribe to Contracts
    const unsubContracts = onSnapshot(collection(db, 'contracts'), async (snapshot) => {
      if (snapshot.empty) {
        if (contracts.length > 0) {
          await seedCollection('contracts', contracts);
        }
      } else {
        const items = snapshot.docs.map(d => d.data() as Contract);
        const itemsStr = JSON.stringify(items);
        if (itemsStr !== JSON.stringify(contracts)) {
          lastContractsRef.current = itemsStr;
          setContracts(items);
        }
      }
    });

    // 5. Subscribe to Office Settings
    const unsubOfficeSettings = onSnapshot(doc(db, 'officeSettings', 'default'), async (snapshot) => {
      if (!snapshot.exists()) {
        // Seed default settings
        await setDoc(doc(db, 'officeSettings', 'default'), officeSettings);
      } else {
        const data = snapshot.data() as OfficeSettings;
        const dataStr = JSON.stringify(data);
        if (dataStr !== JSON.stringify(officeSettings)) {
          lastOfficeSettingsRef.current = dataStr;
          setOfficeSettings(data);
        }
      }
    });

    // 6. Subscribe to Subscription Info
    const unsubSubscription = onSnapshot(doc(db, 'subscription', 'info'), async (snapshot) => {
      if (!snapshot.exists()) {
        // Create 30-day trial automatically if it doesn't exist yet
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 30);
        const yyyy = trialExpiry.getFullYear();
        const mm = String(trialExpiry.getMonth() + 1).padStart(2, '0');
        const dd = String(trialExpiry.getDate()).padStart(2, '0');
        const defaultSub: SubscriptionInfo = {
          status: 'active',
          expiryDate: `${yyyy}-${mm}-${dd}`,
          developerPhone: '07712345678', // Default developer phone
          developerName: 'مطور النظام',
        };
        await setDoc(doc(db, 'subscription', 'info'), defaultSub);
      } else {
        const data = snapshot.data() as SubscriptionInfo;
        const dataStr = JSON.stringify(data);
        if (dataStr !== JSON.stringify(subscription)) {
          lastSubscriptionRef.current = dataStr;
          setSubscription(data);
        }
      }
    });

    setIsInitialized(true);

    return () => {
      unsubProperties();
      unsubArchivedProperties();
      unsubClientRequests();
      unsubContracts();
      unsubOfficeSettings();
      unsubSubscription();
    };
  }, []);

  // Sync LOCAL changes to FIRESTORE (only when the local state updates and doesn't match last Firestore copy)
  useEffect(() => {
    if (!isInitialized) return;
    const currentStr = JSON.stringify(properties);
    if (currentStr !== lastPropertiesRef.current) {
      syncCollectionToFirestore('properties', properties);
      lastPropertiesRef.current = currentStr;
    }
  }, [properties, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const currentStr = JSON.stringify(archivedProperties);
    if (currentStr !== lastArchivedPropertiesRef.current) {
      syncCollectionToFirestore('archivedProperties', archivedProperties);
      lastArchivedPropertiesRef.current = currentStr;
    }
  }, [archivedProperties, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const currentStr = JSON.stringify(clientRequests);
    if (currentStr !== lastClientRequestsRef.current) {
      syncCollectionToFirestore('clientRequests', clientRequests);
      lastClientRequestsRef.current = currentStr;
    }
  }, [clientRequests, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const currentStr = JSON.stringify(contracts);
    if (currentStr !== lastContractsRef.current) {
      syncCollectionToFirestore('contracts', contracts);
      lastContractsRef.current = currentStr;
    }
  }, [contracts, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const currentStr = JSON.stringify(officeSettings);
    if (currentStr !== lastOfficeSettingsRef.current) {
      setDoc(doc(db, 'officeSettings', 'default'), officeSettings, { merge: true })
        .catch(err => console.error("Error updating settings doc:", err));
      lastOfficeSettingsRef.current = currentStr;
    }
  }, [officeSettings, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !subscription) return;
    const currentStr = JSON.stringify(subscription);
    if (currentStr !== lastSubscriptionRef.current) {
      setDoc(doc(db, 'subscription', 'info'), subscription, { merge: true })
        .catch(err => console.error("Error updating subscription doc:", err));
      lastSubscriptionRef.current = currentStr;
    }
  }, [subscription, isInitialized]);
}
