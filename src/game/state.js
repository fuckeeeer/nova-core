import {
  DRONE_DURATION,
  DRONE_RATE,
  ENERGY_COST_PER_CLICK,
  ENERGY_REGEN_PER_SECOND,
  GAME_VERSION,
  STORAGE_KEY,
  TASKS,
  UPGRADES,
  formatCompact,
  getDailyKey,
  getDailyReward,
  getLevelInfo,
  getUpgradeCost,
  isDailyAvailable,
  isTaskClaimed,
  isTaskComplete,
} from './config';

const MAX_LOG_ENTRIES = 8;
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;

function makeLog(text, tone = 'system') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    tone,
    at: Date.now(),
  };
}

export function createDefaultState() {
  return {
    version: GAME_VERSION,
    coins: 750,
    clickPower: 1,
    energy: 1000,
    maxEnergy: 1000,
    autoClicks: 0,
    droneTimeLeft: 0,
    droneLaunches: 0,
    totalClicks: 0,
    totalEarned: 0,
    upgradesBought: 0,
    claimedTasks: [],
    lastDailyClaim: null,
    log: [
      makeLog('Ядро инициализировано. Добро пожаловать, оператор.', 'system'),
      makeLog('Стартовый грант: 750 кредитов зачислен.', 'reward'),
    ],
  };
}

function numberOr(value, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function sanitizeState(raw, fallback) {
  const claimedTasks = Array.isArray(raw.claimedTasks)
    ? raw.claimedTasks.filter((id) => TASKS.some((task) => task.id === id))
    : [];

  return {
    ...fallback,
    version: GAME_VERSION,
    coins: Math.floor(numberOr(raw.coins, fallback.coins)),
    clickPower: Math.floor(numberOr(raw.clickPower, fallback.clickPower, { min: 1 })),
    maxEnergy: Math.floor(numberOr(raw.maxEnergy, fallback.maxEnergy, { min: 1000 })),
    energy: Math.floor(
      numberOr(raw.energy, fallback.energy, {
        max: Math.floor(numberOr(raw.maxEnergy, fallback.maxEnergy, { min: 1000 })),
      }),
    ),
    autoClicks: Math.floor(numberOr(raw.autoClicks, fallback.autoClicks)),
    droneTimeLeft: Math.floor(numberOr(raw.droneTimeLeft, fallback.droneTimeLeft)),
    droneLaunches: Math.floor(numberOr(raw.droneLaunches, fallback.droneLaunches)),
    totalClicks: Math.floor(numberOr(raw.totalClicks, fallback.totalClicks)),
    totalEarned: Math.floor(numberOr(raw.totalEarned, fallback.totalEarned)),
    upgradesBought: Math.floor(numberOr(raw.upgradesBought, fallback.upgradesBought)),
    claimedTasks,
    lastDailyClaim:
      typeof raw.lastDailyClaim === 'string' ? raw.lastDailyClaim : null,
    log:
      Array.isArray(raw.log) && raw.log.length > 0
        ? raw.log
            .filter((entry) => entry && typeof entry.text === 'string')
            .slice(0, MAX_LOG_ENTRIES)
        : fallback.log,
  };
}

function migrateLegacy(fallback) {
  const rawCoins = localStorage.getItem('coins');
  if (rawCoins === null) return fallback;

  const legacyCoins = Number(rawCoins);
  if (!Number.isFinite(legacyCoins)) return fallback;

  return {
    ...fallback,
    coins: Math.max(0, Math.floor(legacyCoins)),
    clickPower: Math.max(1, Math.floor(Number(localStorage.getItem('clickPower')) || 1)),
    maxEnergy: Math.max(1000, Math.floor(Number(localStorage.getItem('maxEnergy')) || 1000)),
    energy: Math.max(0, Math.floor(Number(localStorage.getItem('energy')) || 1000)),
    droneTimeLeft: Math.max(
      0,
      Math.floor(Number(localStorage.getItem('miningTimeLeft')) || 0),
    ),
    log: [makeLog('Сохранение предыдущей версии перенесено в NOVA CORE.', 'system')],
  };
}

export function loadGame() {
  const fallback = createDefaultState();

  try {
    const rawSave = localStorage.getItem(STORAGE_KEY);

    if (!rawSave) {
      return migrateLegacy(fallback);
    }

    const parsed = JSON.parse(rawSave);
    const state = sanitizeState(parsed, fallback);
    const lastSeen = Number(parsed.lastSeen) || Date.now();
    const awaySeconds = Math.min(
      OFFLINE_LIMIT_SECONDS,
      Math.max(0, (Date.now() - lastSeen) / 1000),
    );

    if (awaySeconds < 10) return state;

    const droneSeconds = Math.min(state.droneTimeLeft, awaySeconds);
    const offlineIncome = Math.floor(
      awaySeconds * state.autoClicks + droneSeconds * state.clickPower * DRONE_RATE,
    );

    state.energy = Math.min(
      state.maxEnergy,
      state.energy + Math.floor(awaySeconds * ENERGY_REGEN_PER_SECOND),
    );
    state.droneTimeLeft = Math.max(0, Math.floor(state.droneTimeLeft - awaySeconds));

    if (offlineIncome > 0) {
      state.coins += offlineIncome;
      state.totalEarned += offlineIncome;
      state.log = [
        makeLog(`Автономный доход: +${formatCompact(offlineIncome)} кредитов.`, 'reward'),
        ...state.log,
      ].slice(0, MAX_LOG_ENTRIES);
    }

    return state;
  } catch {
    return fallback;
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastSeen: Date.now(),
      }),
    );
  } catch {
    // Storage can be unavailable in private mode. The game keeps working in memory.
  }
}

function addLog(state, text, tone) {
  return [makeLog(text, tone), ...state.log].slice(0, MAX_LOG_ENTRIES);
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const seconds = Math.min(300, Math.max(0, Number(action.seconds) || 0));
      if (seconds <= 0) return state;

      const droneSeconds = Math.min(state.droneTimeLeft, seconds);
      const droneIncome = droneSeconds * state.clickPower * DRONE_RATE;
      const passiveIncome = seconds * state.autoClicks;
      const income = Math.floor(droneIncome + passiveIncome);

      return {
        ...state,
        coins: state.coins + income,
        totalEarned: state.totalEarned + income,
        energy: Math.min(
          state.maxEnergy,
          state.energy + Math.floor(seconds * ENERGY_REGEN_PER_SECOND),
        ),
        droneTimeLeft: Math.max(0, Math.floor(state.droneTimeLeft - seconds)),
      };
    }

    case 'CLICK': {
      if (state.energy < ENERGY_COST_PER_CLICK) return state;
      const gain = Math.max(1, Math.floor(Number(action.gain) || state.clickPower));
      const nextEarned = state.totalEarned + gain;
      const levelBefore = getLevelInfo(state.totalEarned).level;
      const levelAfter = getLevelInfo(nextEarned).level;
      const nextState = {
        ...state,
        coins: state.coins + gain,
        totalEarned: nextEarned,
        totalClicks: state.totalClicks + 1,
        energy: Math.max(0, state.energy - ENERGY_COST_PER_CLICK),
      };

      if (levelAfter > levelBefore) {
        nextState.log = addLog(
          state,
          `Новый уровень: ${levelAfter}. Доступ к новым контрактам открыт.`,
          'system',
        );
      }

      return nextState;
    }

    case 'BUY_UPGRADE': {
      const cost = getUpgradeCost(action.id, state);
      if (!Number.isFinite(cost) || state.coins < cost) return state;

      const upgrade = UPGRADES.find((item) => item.id === action.id);
      if (!upgrade) return state;

      const nextState = {
        ...state,
        coins: state.coins - cost,
        upgradesBought: state.upgradesBought + 1,
      };

      if (action.id === 'pulse') nextState.clickPower += 1;
      if (action.id === 'battery') {
        nextState.maxEnergy += 500;
        nextState.energy += 500;
      }
      if (action.id === 'drone') nextState.autoClicks += 1;

      nextState.log = addLog(
        state,
        `${upgrade.name} обновлён до уровня ${
          upgrade.id === 'drone' ? nextState.autoClicks + 1 : upgrade.level(nextState)
        }.`,
        'upgrade',
      );

      return nextState;
    }

    case 'START_DRONE': {
      if (state.droneTimeLeft > 0) return state;

      return {
        ...state,
        droneTimeLeft: DRONE_DURATION,
        droneLaunches: state.droneLaunches + 1,
        log: addLog(
          state,
          `Орбитальный дрон запущен. +${state.clickPower * DRONE_RATE}/сек на 15 минут.`,
          'drone',
        ),
      };
    }

    case 'CLAIM_TASK': {
      const task = TASKS.find((item) => item.id === action.id);
      if (!task || isTaskClaimed(task, state) || !isTaskComplete(task, state)) {
        return state;
      }

      return {
        ...state,
        coins: state.coins + task.reward,
        totalEarned: state.totalEarned + task.reward,
        claimedTasks: [...state.claimedTasks, task.id],
        log: addLog(state, `Контракт «${task.title}» выполнен. +${task.reward}.`, 'reward'),
      };
    }

    case 'CLAIM_DAILY': {
      if (!isDailyAvailable(state.lastDailyClaim)) return state;
      const reward = getDailyReward(getLevelInfo(state.totalEarned).level);

      return {
        ...state,
        coins: state.coins + reward,
        totalEarned: state.totalEarned + reward,
        lastDailyClaim: getDailyKey(),
        log: addLog(state, `Ежедневный бонус получен: +${reward} кредитов.`, 'reward'),
      };
    }

    case 'RESET':
      return createDefaultState();

    default:
      return state;
  }
}
