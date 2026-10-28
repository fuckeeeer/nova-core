export const STORAGE_KEY = 'nova-core-save-v2';
export const GAME_VERSION = 2;

export const ENERGY_COST_PER_CLICK = 1;
export const ENERGY_REGEN_PER_SECOND = 5;
export const DRONE_DURATION = 15 * 60;
export const DRONE_RATE = 2;

export const RANKS = [
  'Стажёр',
  'Оператор',
  'Инженер',
  'Архитектор',
  'Хранитель',
  'Сингулярность',
];

export const UPGRADES = [
  {
    id: 'pulse',
    index: '01',
    name: 'Импульсный контур',
    tagline: 'Мощность ядра',
    description: 'Каждый клик приносит больше кредитов.',
    effect: (game) => `+${game.clickPower} за клик`,
    level: (game) => game.clickPower,
    accent: 'lime',
    icon: 'pulse',
  },
  {
    id: 'battery',
    index: '02',
    name: 'Квантовый аккумулятор',
    tagline: 'Запас энергии',
    description: 'Увеличивает ёмкость энергоячейки на 500.',
    effect: (game) => `${game.maxEnergy.toLocaleString('ru-RU')} ед. энергии`,
    level: (game) => Math.floor((game.maxEnergy - 1000) / 500) + 1,
    accent: 'cyan',
    icon: 'battery',
  },
  {
    id: 'drone',
    index: '03',
    name: 'Дрон-сборщик',
    tagline: 'Пассивный доход',
    description: 'Собирает кредиты, пока вы заняты другими делами.',
    effect: (game) => `+${game.autoClicks}/сек`,
    level: (game) => game.autoClicks + 1,
    accent: 'amber',
    icon: 'bot',
  },
];

export const TASKS = [
  {
    id: 'first-contact',
    title: 'Первый контакт',
    description: 'Синхронизируй ядро 25 раз.',
    reward: 1000,
    goal: 25,
    metric: 'totalClicks',
    icon: 'spark',
    accent: 'lime',
  },
  {
    id: 'system-boost',
    title: 'Разгон системы',
    description: 'Установи три любых улучшения.',
    reward: 5000,
    goal: 3,
    metric: 'upgradesBought',
    icon: 'layers',
    accent: 'cyan',
  },
  {
    id: 'autonomy',
    title: 'Автономный режим',
    description: 'Запусти орбитальный дрон хотя бы один раз.',
    reward: 3000,
    goal: 1,
    metric: 'droneLaunches',
    icon: 'orbit',
    accent: 'amber',
  },
  {
    id: 'quantum-leap',
    title: 'Квантовый скачок',
    description: 'Заработай 50 000 кредитов за всё время.',
    reward: 15000,
    goal: 50000,
    metric: 'totalEarned',
    icon: 'bolt',
    accent: 'violet',
  },
];

export function getUpgradeCost(id, game) {
  switch (id) {
    case 'pulse':
      return Math.round(120 * Math.pow(2.35, Math.max(0, game.clickPower - 1)));
    case 'battery':
      return Math.round(
        600 * Math.pow(2.1, Math.max(0, Math.floor((game.maxEnergy - 1000) / 500))),
      );
    case 'drone':
      return Math.round(1400 * Math.pow(3, Math.max(0, game.autoClicks)));
    default:
      return Infinity;
  }
}

export function getPassiveIncome(game) {
  const droneIncome = game.droneTimeLeft > 0 ? game.clickPower * DRONE_RATE : 0;
  return game.autoClicks + droneIncome;
}

export function getLevelInfo(totalEarned) {
  const safeEarned = Math.max(0, Number(totalEarned) || 0);
  const level = Math.floor(Math.sqrt(safeEarned / 750)) + 1;
  const floor = 750 * Math.pow(level - 1, 2);
  const ceiling = 750 * Math.pow(level, 2);
  const current = safeEarned - floor;
  const needed = ceiling - floor;
  return {
    level,
    title: RANKS[Math.min(level - 1, RANKS.length - 1)],
    current,
    needed,
    toNext: Math.max(0, ceiling - safeEarned),
    progress: needed > 0 ? Math.min(1, current / needed) : 0,
  };
}

export function getDailyReward(level) {
  return 2500 + Math.max(0, level - 1) * 500;
}

export function getDailyKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDailyAvailable(lastClaim, date = new Date()) {
  return lastClaim !== getDailyKey(date);
}

export function getTaskProgress(task, game) {
  return Math.min(task.goal, Math.max(0, Number(game[task.metric]) || 0));
}

export function isTaskComplete(task, game) {
  return getTaskProgress(task, game) >= task.goal;
}

export function isTaskClaimed(task, game) {
  return Array.isArray(game.claimedTasks) && game.claimedTasks.includes(task.id);
}

export function formatNumber(value) {
  return Math.floor(Number(value) || 0).toLocaleString('ru-RU');
}

export function formatCompact(value) {
  const number = Number(value) || 0;
  if (number < 1000) return formatNumber(number);
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatClock(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
