import { useEffect, useReducer, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Brand } from './components/Brand';
import Glyph from './components/Glyph';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Tasks from './pages/Tasks';
import {
  TASKS,
  UPGRADES,
  formatNumber,
  getDailyReward,
  getLevelInfo,
  getUpgradeCost,
  isDailyAvailable,
  isTaskClaimed,
  isTaskComplete,
} from './game/config';
import { gameReducer, loadGame, saveGame } from './game/state';

const TABS = [
  { id: 'reactor', label: 'Реактор', index: '01', icon: 'spark' },
  { id: 'upgrades', label: 'Апгрейды', index: '02', icon: 'layers' },
  { id: 'contracts', label: 'Контракты', index: '03', icon: 'target' },
];

function getTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  return TABS.some((tab) => tab.id === hash) ? hash : 'reactor';
}

const PARTICLES = [
  { left: '7%', top: '22%', delay: '-2s', duration: '11s', size: '2px' },
  { left: '15%', top: '72%', delay: '-7s', duration: '16s', size: '1px' },
  { left: '26%', top: '37%', delay: '-4s', duration: '13s', size: '1.5px' },
  { left: '68%', top: '18%', delay: '-9s', duration: '19s', size: '1px' },
  { left: '81%', top: '61%', delay: '-3s', duration: '14s', size: '2px' },
  { left: '91%', top: '31%', delay: '-6s', duration: '17s', size: '1px' },
  { left: '54%', top: '83%', delay: '-11s', duration: '21s', size: '1.5px' },
  { left: '42%', top: '11%', delay: '-5s', duration: '15s', size: '1px' },
];

function SiteBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-orb ambient-orb--lime" />
      <span className="ambient-orb ambient-orb--cyan" />
      <span className="ambient-grid" />
      <span className="ambient-horizon" />
      <span className="ambient-noise" />
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [game, dispatch] = useReducer(gameReducer, undefined, loadGame);
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [toast, setToast] = useState(null);
  const level = getLevelInfo(game.totalEarned);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveGame(game), 180);
    return () => window.clearTimeout(timeout);
  }, [game]);

  useEffect(() => {
    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();
      const seconds = Math.min(300, Math.max(0, (now - lastTick) / 1000));
      lastTick = now;
      if (seconds > 0) dispatch({ type: 'TICK', seconds });
    };

    const interval = window.setInterval(tick, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick();
      else lastTick = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const handleHistory = () => setActiveTab(getTabFromHash());
    window.addEventListener('popstate', handleHistory);
    window.addEventListener('hashchange', handleHistory);
    return () => {
      window.removeEventListener('popstate', handleHistory);
      window.removeEventListener('hashchange', handleHistory);
    };
  }, []);

  const notify = (message, tone = 'info') => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      message,
      tone,
    });
  };

  const navigate = (tab) => {
    if (tab !== activeTab) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buyUpgrade = (id) => {
    const upgrade = UPGRADES.find((item) => item.id === id);
    const cost = getUpgradeCost(id, game);

    if (!upgrade) return;
    if (game.coins < cost) {
      notify(`Не хватает ${formatNumber(cost - game.coins)} кредитов`, 'error');
      return;
    }

    dispatch({ type: 'BUY_UPGRADE', id });
    notify(`${upgrade.name} обновлён`, 'success');
  };

  const claimTask = (id) => {
    const task = TASKS.find((item) => item.id === id);
    if (!task || isTaskClaimed(task, game)) return;
    if (!isTaskComplete(task, game)) {
      notify('Условие контракта ещё не выполнено', 'error');
      return;
    }

    dispatch({ type: 'CLAIM_TASK', id });
    notify(`Контракт закрыт: +${formatNumber(task.reward)}`, 'success');
  };

  const claimDaily = () => {
    if (!isDailyAvailable(game.lastDailyClaim)) {
      notify('Бонус уже получен. Возвращайся завтра.', 'info');
      return;
    }

    dispatch({ type: 'CLAIM_DAILY' });
    notify(`Бонус дня: +${formatNumber(getDailyReward(level.level))}`, 'success');
  };

  const startDrone = () => {
    if (game.droneTimeLeft > 0) {
      notify('Дрон уже на орбите', 'info');
      return;
    }

    dispatch({ type: 'START_DRONE' });
    notify('Дрон запущен на 15 минут', 'success');
  };

  const pageProps = {
    game,
    level,
    onNavigate: navigate,
    onCoreClick: (gain) => dispatch({ type: 'CLICK', gain }),
    onBuyUpgrade: buyUpgrade,
    onClaimTask: claimTask,
    onClaimDaily: claimDaily,
    onStartDrone: startDrone,
  };

  return (
    <div className="app">
      <SiteBackground />

      <header className="topbar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate('reactor')}
          aria-label="NOVA CORE — на главную"
        >
          <Brand />
        </button>

        <nav className="main-nav" aria-label="Основная навигация">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => navigate(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="nav-tab-index">{tab.index}</span>
              <Glyph name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <Motion.span
                  className="nav-active-glow"
                  layoutId="nav-active-glow"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <div className="network-pill">
            <span className="status-dot" />
            <span>Сеть в норме</span>
          </div>
          <button
            type="button"
            className="balance-pill"
            onClick={() => navigate('reactor')}
            aria-label={`Баланс: ${formatNumber(game.coins)} кредитов`}
          >
            <Glyph name="coin" size={16} />
            <span className="balance-pill-value">{formatNumber(game.coins)}</span>
            <span className="balance-pill-unit">кр.</span>
          </button>
          <div className="operator-chip" title={`${level.title}, уровень ${level.level}`}>
            <span className="operator-chip-dot" />
            <span>N-{String(level.level).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={activeTab}
            className="page-transition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'reactor' && <Home {...pageProps} />}
            {activeTab === 'upgrades' && <Shop {...pageProps} />}
            {activeTab === 'contracts' && <Tasks {...pageProps} />}
          </Motion.div>
        </AnimatePresence>
      </main>

      <nav className="mobile-nav" aria-label="Мобильная навигация">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`mobile-nav-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => navigate(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <Glyph name={tab.icon} size={20} />
            <span>{tab.label}</span>
            {activeTab === tab.id && <span className="mobile-nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="toast-layer" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <Motion.div
              key={toast.id}
              className={`toast toast--${toast.tone}`}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Glyph
                name={toast.tone === 'error' ? 'alert' : toast.tone === 'info' ? 'activity' : 'check'}
                size={17}
              />
              <span>{toast.message}</span>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
