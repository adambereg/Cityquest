export const USER_STATUS = {
  NOVICE: {
    name: 'novice',
    label: 'Новичок',
    minPoints: 0,
    color: 'gray'
  },
  EXPLORER: {
    name: 'explorer',
    label: 'Исследователь',
    minPoints: 100,
    color: 'blue'
  },
  MASTER: {
    name: 'master',
    label: 'Мастер',
    minPoints: 500,
    color: 'yellow'
  },
  LEGEND: {
    name: 'legend',
    label: 'Легенда',
    minPoints: 1000,
    color: 'purple'
  }
} as const;

export const getStatusByPoints = (points: number) => {
  if (points >= USER_STATUS.LEGEND.minPoints) return USER_STATUS.LEGEND;
  if (points >= USER_STATUS.MASTER.minPoints) return USER_STATUS.MASTER;
  if (points >= USER_STATUS.EXPLORER.minPoints) return USER_STATUS.EXPLORER;
  return USER_STATUS.NOVICE;
}; 