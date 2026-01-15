import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserContextType {
  balance: number;
  luckyNumber: number;
  updateBalance: (amount: number) => void;
  setLuckyNumber: (num: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [luckyNumber, setLuckyNumberState] = useState<number>(2);

  useEffect(() => {
    const storedBalance = localStorage.getItem('userBalance');
    const storedLuckyNumber = localStorage.getItem('luckyNumber');

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }
    if (storedLuckyNumber) {
      setLuckyNumberState(Number(storedLuckyNumber));
    }
  }, []);

  const updateBalance = (amount: number) => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      localStorage.setItem('userBalance', newBalance.toString());
      return newBalance;
    });
  };

  const setLuckyNumber = (num: number) => {
    setLuckyNumberState(num);
    localStorage.setItem('luckyNumber', num.toString());
  };

  const value = {
    balance,
    luckyNumber,
    updateBalance,
    setLuckyNumber,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
