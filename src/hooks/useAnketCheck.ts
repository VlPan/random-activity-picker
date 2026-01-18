import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserContext } from '../contexts/UserContext';

export const useAnketCheck = () => {
  const { 
    lastAnketDate, 
    setLastAnketDate, 
    updateBalanceWithDate,
    updateRandomPicksWithDate,
    rewardSettings 
  } = useUserContext();
  
  const [showAnket, setShowAnket] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialDaysCount, setInitialDaysCount] = useState(0);

  // Calculate missing days
  const missingDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Yesterday is the most recent day we can fill anket for
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let startDate: Date;
    
    if (lastAnketDate) {
      // Parse YYYY-MM-DD manually to ensure local time (avoid UTC offset issues)
      const [y, m, d] = lastAnketDate.split('-').map(Number);
      startDate = new Date(y, m - 1, d);
      // Start from the day after lastAnketDate
      startDate.setDate(startDate.getDate() + 1);
    } else {
      // First time use - only ask for yesterday
      startDate = new Date(yesterday);
    }

    // Collect all missing days from startDate to yesterday (inclusive)
    const currentDate = new Date(startDate);
    while (currentDate <= yesterday) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [lastAnketDate]);

  // Show anket dialog if there are missing days (only once on init)
  useEffect(() => {
    if (!isInitialized && missingDays.length > 0) {
      setInitialDaysCount(missingDays.length);
      setShowAnket(true);
      setIsInitialized(true);
    } else if (!isInitialized && missingDays.length === 0) {
      setIsInitialized(true);
    }
  }, [missingDays, isInitialized]);

  const getDateISOString = (date: Date): string => {
    // Create ISO string at noon to avoid timezone issues
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  const getDateKey = (date: Date): string => {
    // Return date-only string for lastAnketDate (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateDiscountedCost = useCallback((cost: number): number => {
    const discount = rewardSettings.basicNecessityDiscount || 0;
    return cost * (1 - discount / 100);
  }, [rewardSettings.basicNecessityDiscount]);

  const handleSubmit = useCallback((basicSpending: number, nonEssentialSpending: number, parameterValues: Record<string, number>) => {
    const currentDay = missingDays[currentDayIndex];
    if (!currentDay) return;

    const dateIso = getDateISOString(currentDay);
    const dateKey = getDateKey(currentDay);

    // Process Parameters (Add Random Picks)
    Object.entries(parameterValues).forEach(([paramId, value]) => {
        const paramDef = rewardSettings.dailyReportParameters?.find(p => p.id === paramId);
        if (paramDef && value > 0) {
            updateRandomPicksWithDate(value, `Daily Report: ${paramDef.name}`, dateIso, 'Daily Report');
        }
    });

    // Process Basic Spending (with discount)
    if (basicSpending > 0) {
      const discountedAmount = calculateDiscountedCost(basicSpending);
      updateBalanceWithDate(-discountedAmount, 'Bill Payment: Daily Report - Basics', dateIso, 'Daily Report', true);
    }

    // Process Non-Essential Spending (no discount)
    if (nonEssentialSpending > 0) {
      updateBalanceWithDate(-nonEssentialSpending, 'Bill Payment: Daily Report - Non-Essential', dateIso, 'Daily Report', false);
    }

    // Update lastAnketDate to current day
    setLastAnketDate(dateKey);

    // Check if there are more days to process.
    // Since missingDays is derived from lastAnketDate, the list will shrink by 1 on the next render.
    // We keep currentDayIndex at 0 to point to the next day in the shifted list.
    if (missingDays.length > 1) {
      // List will shift, next day becomes index 0. Do not increment index.
    } else {
      setShowAnket(false);
      setCurrentDayIndex(0);
    }
  }, [missingDays, currentDayIndex, calculateDiscountedCost, updateBalanceWithDate, updateRandomPicksWithDate, setLastAnketDate, rewardSettings.dailyReportParameters]);

  const handleSkipAll = useCallback(() => {
    // Skip all remaining days by setting lastAnketDate to yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    setLastAnketDate(getDateKey(yesterday));
    setShowAnket(false);
    setCurrentDayIndex(0);
  }, [setLastAnketDate]);

  return {
    showAnket,
    missingDays,
    currentDayIndex,
    handleSubmit,
    handleSkipAll,
    currentDayNumber: initialDaysCount > 0 ? (initialDaysCount - missingDays.length + 1) : 1,
    totalDays: initialDaysCount > 0 ? initialDaysCount : missingDays.length,
  };
};
