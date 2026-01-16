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

export interface HistoryItem {
  id: string;
  date: string;
  amount: number;
  type: 'points' | 'balance';
  reason: string;
}

interface UserContextType {
  balance: number; // ZL
  points: number;  // Points
  luckyNumber: number;
  rewardSettings: RewardSettings;
  history: HistoryItem[];
  updateBalance: (amount: number, reason?: string) => void;
  updatePoints: (amount: number, reason?: string) => void;
  exchangePoints: (pointsToExchange: number) => void;
  setLuckyNumber: (num: number) => void;
  updateRewardSettings: (settings: RewardSettings) => void;
  clearHistory: () => void;
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
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const storedBalance = localStorage.getItem('userBalance');
    const storedPoints = localStorage.getItem('userPoints');
    const storedLuckyNumber = localStorage.getItem('luckyNumber');
    const storedSettings = localStorage.getItem('rewardSettings');
    const storedHistory = localStorage.getItem('userHistory');

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
    if (storedHistory) {
        try {
            setHistory(JSON.parse(storedHistory));
        } catch (e) {
            console.error('Failed to parse history', e);
        }
    }
  }, []);

  const addHistoryItem = (amount: number, type: 'points' | 'balance', reason: string) => {
    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        amount,
        type,
        reason
    };
    
    setHistory(prev => {
        const newHistory = [newItem, ...prev];
        localStorage.setItem('userHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const updateBalance = (amount: number, reason: string = 'Manual Adjustment') => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      localStorage.setItem('userBalance', newBalance.toString());
      return newBalance;
    });
    addHistoryItem(amount, 'balance', reason);
  };

  const updatePoints = (amount: number, reason: string = 'Manual Adjustment') => {
    setPoints((prev) => {
      const newPoints = prev + amount;
      localStorage.setItem('userPoints', newPoints.toString());
      return newPoints;
    });
    addHistoryItem(amount, 'points', reason);
  };

  const exchangePoints = (pointsToExchange: number) => {
    if (pointsToExchange <= 0) return;
    if (points < pointsToExchange) return;

    const rate = rewardSettings.conversionRate || 100;
    const zlAmount = pointsToExchange / rate;

    // Use internal update logic to avoid double history entries if we called the public methods
    // But actually, we want history entries for both.
    // "Exchanged 100pts" (points -100) and "Exchanged for 1ZL" (balance +1).
    
    updatePoints(-pointsToExchange, 'Currency Exchange');
    updateBalance(zlAmount, 'Currency Exchange');
  };

  const setLuckyNumber = (num: number) => {
    setLuckyNumberState(num);
    localStorage.setItem('luckyNumber', num.toString());
  };

  const updateRewardSettings = (settings: RewardSettings) => {
    setRewardSettings(settings);
    localStorage.setItem('rewardSettings', JSON.stringify(settings));
  };

  const clearHistory = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    setHistory(prev => {
        const newHistory = prev.filter(item => new Date(item.date) > sevenDaysAgo);
        localStorage.setItem('userHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const value = {
    balance,
    points,
    luckyNumber,
    rewardSettings,
    history,
    updateBalance,
    updatePoints,
    exchangePoints,
    setLuckyNumber,
    updateRewardSettings,
    clearHistory
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
