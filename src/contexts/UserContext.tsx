import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface RewardSettings {
  minTimeBlock: number;
  minPoints: number;
  maxTimeBlock: number;
  maxPoints: number;
  progressiveInterval: number;
}

interface UserContextType {
  balance: number;
  luckyNumber: number;
  rewardSettings: RewardSettings;
  updateBalance: (amount: number) => void;
  setLuckyNumber: (num: number) => void;
  updateRewardSettings: (settings: RewardSettings) => void;
}

const defaultRewardSettings: RewardSettings = {
  minTimeBlock: 30,
  minPoints: 1,
  maxTimeBlock: 10,
  maxPoints: 1,
  progressiveInterval: 30
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [luckyNumber, setLuckyNumberState] = useState<number>(2);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings>(defaultRewardSettings);

  useEffect(() => {
    const storedBalance = localStorage.getItem('userBalance');
    const storedLuckyNumber = localStorage.getItem('luckyNumber');
    const storedSettings = localStorage.getItem('rewardSettings');

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }
    if (storedLuckyNumber) {
      setLuckyNumberState(Number(storedLuckyNumber));
    }
    if (storedSettings) {
      try {
        setRewardSettings({ ...defaultRewardSettings, ...JSON.parse(storedSettings) });
      } catch (e) {
        console.error('Failed to parse reward settings', e);
      }
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

  const updateRewardSettings = (settings: RewardSettings) => {
    setRewardSettings(settings);
    localStorage.setItem('rewardSettings', JSON.stringify(settings));
  };

  const value = {
    balance,
    luckyNumber,
    rewardSettings,
    updateBalance,
    setLuckyNumber,
    updateRewardSettings,
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
