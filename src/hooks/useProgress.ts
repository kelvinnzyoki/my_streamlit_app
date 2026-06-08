'use client';

export function useProgress() {
  return {
    weekly: [44, 58, 62, 71, 68, 86, 93],
    stats: [
      { label: 'Sessions', value: '28', sub: '+8 this month' },
      { label: 'Calories', value: '8,420', sub: 'estimated burn' },
      { label: 'Streak', value: '12', sub: 'days active' },
      { label: 'Readiness', value: '87%', sub: 'good to train' }
    ]
  };
}
