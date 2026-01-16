import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ShopItem } from '../models/shopItem';

interface ShopContextType {
  items: ShopItem[];
  addItem: (item: ShopItem) => void;
  updateItem: (item: ShopItem) => void;
  deleteItem: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('shopItems');
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (e) {
        console.error('Failed to parse shop items', e);
      }
    }
  }, []);

  const saveItems = (newItems: ShopItem[]) => {
    setItems(newItems);
    localStorage.setItem('shopItems', JSON.stringify(newItems));
  };

  const addItem = (item: ShopItem) => {
    saveItems([...items, item]);
  };

  const updateItem = (updatedItem: ShopItem) => {
    saveItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
  };

  const value = {
    items,
    addItem,
    updateItem,
    deleteItem,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShopContext = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShopContext must be used within a ShopProvider');
  }
  return context;
};
