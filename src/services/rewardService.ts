import type { Reward } from '../models/reward';

const REWARDS_KEY = 'randomizer_rewards';

const mockRewards: Reward[] = [
  { id: 'rew-001', value: 1, currency: 'zl' },
  { id: 'rew-002', value: 100, currency: 'zl' },
  { id: 'rew-003', value: 1000, currency: 'zl' },
];

const arrayToRewardMap = (rewards: Reward[]): Map<string, Reward> => {
  return new Map(rewards.map(r => [r.id, r]));
};

const rewardMapToArray = (map: Map<string, Reward>): Reward[] => {
  return Array.from(map.values());
};

export const fetchRewardsFromStorage = (): Promise<Map<string, Reward>> => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    setTimeout(() => {
      const saved = localStorage.getItem(REWARDS_KEY);
      const data = saved ? JSON.parse(saved) : mockRewards;

      if (!saved) localStorage.setItem(REWARDS_KEY, JSON.stringify(data));

      resolve(arrayToRewardMap(data));
    }, delay);
  });
};

export const saveRewardsToStorage = (rewardsMap: Map<string, Reward>): void => {
  const rewards = rewardMapToArray(rewardsMap);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
};

export const addRewardToStorage = (reward: Reward): Map<string, Reward> => {
  const saved = localStorage.getItem(REWARDS_KEY);
  const rewardsArray = saved ? JSON.parse(saved) : [];
  const rewardsMap = arrayToRewardMap(rewardsArray);

  rewardsMap.set(reward.id, reward);

  const updated = rewardMapToArray(rewardsMap);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
  return rewardsMap;
};

export const updateRewardInStorage = (reward: Reward): Map<string, Reward> => {
  const saved = localStorage.getItem(REWARDS_KEY);
  const rewardsArray = saved ? JSON.parse(saved) : [];
  const rewardsMap = arrayToRewardMap(rewardsArray);

  if (rewardsMap.has(reward.id)) {
    rewardsMap.set(reward.id, reward);
  }

  const updated = rewardMapToArray(rewardsMap);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
  return rewardsMap;
};

export const deleteRewardFromStorage = (rewardId: string): Map<string, Reward> => {
  const saved = localStorage.getItem(REWARDS_KEY);
  const rewardsArray = saved ? JSON.parse(saved) : [];
  const rewardsMap = arrayToRewardMap(rewardsArray);

  rewardsMap.delete(rewardId);

  const updated = rewardMapToArray(rewardsMap);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
  return rewardsMap;
};
