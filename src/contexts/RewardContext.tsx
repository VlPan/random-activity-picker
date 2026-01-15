import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Reward } from '../models/reward';
import {
  fetchRewardsFromStorage,
  addRewardToStorage,
  updateRewardInStorage,
  deleteRewardFromStorage,
} from '../services/rewardService';

interface RewardContextType {
  rewards: Map<string, Reward>;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  addReward: (reward: Reward) => void;
  updateReward: (reward: Reward) => void;
  deleteReward: (rewardId: string) => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const [rewards, setRewards] = useState<Map<string, Reward>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rewardsData = await fetchRewardsFromStorage();
      setRewards(rewardsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rewards';
      setError(errorMessage);
      console.error('Error loading rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addReward = (reward: Reward) => {
    try {
      const updated = addRewardToStorage(reward);
      setRewards(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reward';
      setError(errorMessage);
      console.error('Error adding reward:', err);
    }
  };

  const updateReward = (reward: Reward) => {
    try {
      const updated = updateRewardInStorage(reward);
      setRewards(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reward';
      setError(errorMessage);
      console.error('Error updating reward:', err);
    }
  };

  const deleteReward = (rewardId: string) => {
    try {
      const updated = deleteRewardFromStorage(rewardId);
      setRewards(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reward';
      setError(errorMessage);
      console.error('Error deleting reward:', err);
    }
  };

  const value: RewardContextType = {
    rewards,
    loading,
    error,
    loadData,
    addReward,
    updateReward,
    deleteReward,
  };

  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
};

export const useRewardContext = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useRewardContext must be used within a RewardProvider');
  }
  return context;
};
