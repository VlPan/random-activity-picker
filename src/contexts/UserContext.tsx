import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface RewardSettings {
  minTimeBlock: number;
  minPoints: number;
  maxTimeBlock: number;
  maxPoints: number;
  progressiveInterval: number;
  conversionRate: number; // Points per 1 ZL
  basicNecessityDiscount: number; // Percentage discount (0-100)
}

interface UserContextType {
  balance: number; // ZL
  points: number;  // Points
  luckyNumber: number;
  rewardSettings: RewardSettings;
  updateBalance: (amount: number) => void;
  updatePoints: (amount: number) => void;
  exchangePoints: (pointsToExchange: number) => void;
  setLuckyNumber: (num: number) => void;
  updateRewardSettings: (settings: RewardSettings) => void;
}

const defaultRewardSettings: RewardSettings = {
  minTimeBlock: 30,
  minPoints: 1,
  maxTimeBlock: 10,
  maxPoints: 1,
  progressiveInterval: 30,
  conversionRate: 100,
  basicNecessityDiscount: 0
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [luckyNumber, setLuckyNumberState] = useState<number>(2);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings>(defaultRewardSettings);

  useEffect(() => {
    const storedBalance = localStorage.getItem('userBalance');
    const storedPoints = localStorage.getItem('userPoints');
    const storedLuckyNumber = localStorage.getItem('luckyNumber');
    const storedSettings = localStorage.getItem('rewardSettings');

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }
    if (storedPoints) {
      setPoints(Number(storedPoints));
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

  const updatePoints = (amount: number) => {
    setPoints((prev) => {
      const newPoints = prev + amount;
      localStorage.setItem('userPoints', newPoints.toString());
      return newPoints;
    });
  };

  const exchangePoints = (pointsToExchange: number) => {
    if (pointsToExchange <= 0) return;
    if (points < pointsToExchange) return;

    const rate = rewardSettings.conversionRate || 100;
    const zlAmount = pointsToExchange / rate;

    setPoints((prev) => {
      const newPoints = prev - pointsToExchange;
      localStorage.setItem('userPoints', newPoints.toString());
      return newPoints;
    });

    setBalance((prev) => {
      const newBalance = prev + zlAmount;
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
    points,
    luckyNumber,
    rewardSettings,
    updateBalance,
    updatePoints,
    exchangePoints,
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
