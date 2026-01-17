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

export type SpendingCategory = 'Manual' | 'Bill' | 'Anket' | 'Shop' | 'Project' | 'Other';

export interface HistoryItem {
  id: string;
  date: string;
  amount: number;
  type: 'points' | 'balance' | 'randomPicks';
  reason: string;
  category?: SpendingCategory;
  isEssential?: boolean;
  count?: number;
  duration?: number; // In seconds
}

interface UserContextType {
  balance: number; // ZL
  points: number;  // Points
  randomPicks: number; // Random Picks (RP)
  luckyNumber: number;
  luckBuffer: number;
  rewardSettings: RewardSettings;
  history: HistoryItem[];
  lastAnketDate: string | null; // ISO date string (date only, e.g., "2026-01-15")
  updateBalance: (amount: number, reason?: string, category?: SpendingCategory, isEssential?: boolean) => void;
  updateBalanceWithDate: (amount: number, reason: string, customDate: string, category?: SpendingCategory, isEssential?: boolean) => void;
  updatePoints: (amount: number, reason?: string, count?: number, duration?: number, category?: SpendingCategory) => void;
  updateRandomPicks: (amount: number, reason?: string) => void;
  exchangePoints: (pointsToExchange: number) => void;
  setLuckyNumber: (num: number) => void;
  processRewardPick: (value: number, minVal: number) => void;
  updateRewardSettings: (settings: RewardSettings) => void;
  setLastAnketDate: (date: string) => void;
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
  const [randomPicks, setRandomPicks] = useState<number>(0);
  const [luckyNumber, setLuckyNumberState] = useState<number>(2);
  const [luckBuffer, setLuckBuffer] = useState<number>(0);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings>(defaultRewardSettings);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastAnketDate, setLastAnketDateState] = useState<string | null>(null);

  useEffect(() => {
    const storedBalance = localStorage.getItem('userBalance');
    const storedPoints = localStorage.getItem('userPoints');
    const storedRandomPicks = localStorage.getItem('userRandomPicks');
    const storedLuckyNumber = localStorage.getItem('luckyNumber');
    const storedLuckBuffer = localStorage.getItem('userLuckBuffer');
    const storedSettings = localStorage.getItem('rewardSettings');
    const storedHistory = localStorage.getItem('userHistory');
    const storedLastAnketDate = localStorage.getItem('lastAnketDate');

    if (storedBalance) {
      setBalance(Number(storedBalance));
    }
    if (storedPoints) {
      setPoints(Number(storedPoints));
    }
    if (storedRandomPicks) {
      setRandomPicks(Number(storedRandomPicks));
    }
    if (storedLuckyNumber) {
      setLuckyNumberState(Number(storedLuckyNumber));
    }
    if (storedLuckBuffer) {
      setLuckBuffer(Number(storedLuckBuffer));
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
    if (storedLastAnketDate) {
      setLastAnketDateState(storedLastAnketDate);
    }
  }, []);

  const addHistoryItem = (amount: number, type: 'points' | 'balance' | 'randomPicks', reason: string, count?: number, duration?: number, category?: SpendingCategory, isEssential?: boolean) => {
    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        amount,
        type,
        reason,
        count,
        duration,
        category,
        isEssential
    };
    
    setHistory(prev => {
        const newHistory = [newItem, ...prev];
        localStorage.setItem('userHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const addHistoryItemWithDate = (amount: number, type: 'points' | 'balance' | 'randomPicks', reason: string, customDate: string, category?: SpendingCategory, isEssential?: boolean) => {
    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: customDate,
        amount,
        type,
        reason,
        category,
        isEssential
    };
    
    setHistory(prev => {
        const newHistory = [newItem, ...prev];
        localStorage.setItem('userHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const updateBalance = (amount: number, reason: string = 'Manual Adjustment', category: SpendingCategory = 'Manual', isEssential?: boolean) => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      localStorage.setItem('userBalance', newBalance.toString());
      return newBalance;
    });
    addHistoryItem(amount, 'balance', reason, undefined, undefined, category, isEssential);
  };

  const updateBalanceWithDate = (amount: number, reason: string, customDate: string, category: SpendingCategory = 'Manual', isEssential?: boolean) => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      localStorage.setItem('userBalance', newBalance.toString());
      return newBalance;
    });
    addHistoryItemWithDate(amount, 'balance', reason, customDate, category, isEssential);
  };

  const updatePoints = (amount: number, reason: string = 'Manual Adjustment', count?: number, duration?: number, category?: SpendingCategory) => {
    setPoints((prev) => {
      const newPoints = prev + amount;
      localStorage.setItem('userPoints', newPoints.toString());
      return newPoints;
    });
    addHistoryItem(amount, 'points', reason, count, duration, category);
  };

  const updateRandomPicks = (amount: number, reason: string = 'Manual Adjustment') => {
    setRandomPicks((prev) => {
      const newPicks = Math.max(0, prev + amount); // Ensure non-negative
      localStorage.setItem('userRandomPicks', newPicks.toString());
      return newPicks;
    });
    addHistoryItem(amount, 'randomPicks', reason);
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
    updateBalance(zlAmount, 'Currency Exchange', 'Other');
  };

  const setLuckyNumber = (num: number) => {
    setLuckyNumberState(num);
    localStorage.setItem('luckyNumber', num.toString());
  };

  const processRewardPick = (value: number, minVal: number) => {
    setLuckBuffer(prev => {
      let newBuffer = prev;
      
      // 1. Calculate Buffer Change
      if (value === minVal) {
        // Small reward: slowly build up luck (+1)
        newBuffer += 1;
      } else {
        // Big reward: spend luck proportional to value
        // Example: 10zl reward (where min is 1zl) = -10 buffer
        const cost = (value / minVal);
        newBuffer -= cost;
      }

      // 2. Check Thresholds (Sensitivity = 10)
      const THRESHOLD = 5;
      const STEP = 0.1;
      let luckChange = 0;

      // Increase Luck if buffer is full
      while (newBuffer >= THRESHOLD) {
        luckChange += STEP;
        newBuffer -= THRESHOLD;
      }

      // Decrease Luck if buffer is in debt
      while (newBuffer <= -THRESHOLD) {
        luckChange -= STEP;
        newBuffer += THRESHOLD;
      }

      // 3. Apply Luck Change if needed
      if (luckChange !== 0) {
        setLuckyNumberState(currentLuck => {
          const nextLuck = Math.max(1, currentLuck + luckChange); // Don't go below 1
          localStorage.setItem('luckyNumber', nextLuck.toString());
          return nextLuck;
        });
      }

      localStorage.setItem('userLuckBuffer', newBuffer.toString());
      return newBuffer;
    });
  };

  const updateRewardSettings = (settings: RewardSettings) => {
    setRewardSettings(settings);
    localStorage.setItem('rewardSettings', JSON.stringify(settings));
  };

  const setLastAnketDate = (date: string) => {
    setLastAnketDateState(date);
    localStorage.setItem('lastAnketDate', date);
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
    randomPicks,
    luckyNumber,
    luckBuffer,
    rewardSettings,
    history,
    lastAnketDate,
    updateBalance,
    updateBalanceWithDate,
    updatePoints,
    updateRandomPicks,
    exchangePoints,
    setLuckyNumber,
    processRewardPick,
    updateRewardSettings,
    setLastAnketDate,
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
