import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useRewardContext } from '../contexts/RewardContext';

export type RewardGenerationStep = 'input' | 'generating' | 'finished';

export const getRewardStyle = (val: number) => {
  if (val >= 1000) return { fontSize: '2.5rem', color: '#9c27b0', fontWeight: 'bold' }; // purple
  if (val >= 100) return { fontSize: '2rem', color: '#1976d2', fontWeight: 'bold' }; // blue
  if (val >= 10) return { fontSize: '1.5rem', color: '#2e7d32', fontWeight: 'bold' }; // green
  return { fontSize: '1rem', color: 'inherit' };
};

export const useRewardGeneration = () => {
  const { luckyNumber, processRewardPick } = useUserContext();
  const { rewards: rewardsMap } = useRewardContext();
  
  const [step, setStep] = useState<RewardGenerationStep>('input');
  const [rewards, setRewards] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetCount, setTargetCount] = useState(0);

  const reset = useCallback(() => {
    setStep('input');
    setRewards([]);
    setCurrentIndex(0);
    setTargetCount(0);
  }, []);

  const generateRewardValue = useCallback(() => {
    // Get unique sorted reward values
    const uniqueValues = Array.from(new Set(Array.from(rewardsMap.values()).map(r => r.value))).sort((a, b) => a - b);
    
    // Default to 1 if no rewards exist
    if (uniqueValues.length === 0) return 1;

    const minVal = uniqueValues[0];
    const L = luckyNumber;
    
    // Calculate weights
    // Weight for minVal is 1
    // Weight for other value v is (minVal / v) * L
    const weights = uniqueValues.map(v => {
      if (v === minVal) return 1;
      return (minVal / v) * L;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rand = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    for (let i = 0; i < uniqueValues.length; i++) {
      cumulativeWeight += weights[i];
      if (rand < cumulativeWeight) {
        return uniqueValues[i];
      }
    }
    
    return uniqueValues[uniqueValues.length - 1];
  }, [rewardsMap, luckyNumber]);

  const startGeneration = useCallback((count: number) => {
    const safeCount = Math.max(1, count); // Ensure at least 1
    setTargetCount(safeCount);
    setRewards([]);
    setCurrentIndex(0);
    setStep('generating');
  }, []);

  useEffect(() => {
    if (step === 'generating' && currentIndex < targetCount) {
      // Speed up animation if there are many rewards
      const delay = targetCount > 10 ? 100 : 500;
      
      const timer = setTimeout(() => {
        const newValue = generateRewardValue();
        
        // Calculate min value for logic
        const uniqueValues = Array.from(new Set(Array.from(rewardsMap.values()).map(r => r.value))).sort((a, b) => a - b);
        const minVal = uniqueValues[0] || 1;
        
        processRewardPick(newValue, minVal);

        setRewards(prev => [...prev, newValue]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (step === 'generating' && currentIndex >= targetCount) {
      setStep('finished');
    }
  }, [step, currentIndex, targetCount, generateRewardValue, rewardsMap, processRewardPick]);

  return {
    step,
    rewards,
    startGeneration,
    reset
  };
};
