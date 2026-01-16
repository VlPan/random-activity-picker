import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Bill } from '../models/bill';

interface BillContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (id: string) => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider = ({ children }: { children: ReactNode }) => {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const storedBills = localStorage.getItem('bills');
    if (storedBills) {
      try {
        setBills(JSON.parse(storedBills));
      } catch (e) {
        console.error('Failed to parse bills', e);
      }
    }
  }, []);

  const saveBills = (newBills: Bill[]) => {
    setBills(newBills);
    localStorage.setItem('bills', JSON.stringify(newBills));
  };

  const addBill = (bill: Bill) => {
    saveBills([...bills, bill]);
  };

  const updateBill = (updatedBill: Bill) => {
    saveBills(bills.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
  };

  const deleteBill = (id: string) => {
    saveBills(bills.filter((b) => b.id !== id));
  };

  const value = {
    bills,
    addBill,
    updateBill,
    deleteBill,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};

export const useBillContext = () => {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBillContext must be used within a BillProvider');
  }
  return context;
};
