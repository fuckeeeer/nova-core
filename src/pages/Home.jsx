import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { BrandMark } from '../components/Brand';
import Glyph from '../components/Glyph';
import {
  ENERGY_REGEN_PER_SECOND,
  TASKS,
  UPGRADES,
  formatClock,
  formatNumber,
  formatTime,
  getDailyReward,
  getPassiveIncome,
  getTaskProgress,
  getUpgradeCost,
  isDailyAvailable,
  isTaskClaimed,
  isTaskComplete,
} from '../game/config';

const RING_RADIUS = 188;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Home({
  game,
  level,
  onNavigate,
  onCoreClick,
  onStartDrone,
  onClaimDaily,
  onClaimTask,
}) {
  const [combo, setCombo] = useState(0);
  const [floats, setFloats] = useState([]);
  const [burstId, setBurstId] = useState(0);
  const [denied, setDenied] = useState(false);
  const comboTimer = useRef(null);
  const deniedTimer = useRef(null);
  const floatTimers = useRef([]);

  useEffect(
    () => () => {
      window.clearTimeout(comboTimer.current);
      window.clearTimeout(deniedTimer.current);
      floatTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const energyRatio = Math.min(1, Math.max(0, game.energy / game.maxEnergy));
  const dailyAvailable = isDailyAvailable(game.lastDailyClaim);
  const dailyReward = getDailyReward(level.level);
  const income = getPassiveIncome(game);
  const comboMultiplier = 1 + Math.floor(Math.min(combo, 20) / 5) * 0.25;
  const comboProgress = combo === 0 ? 0 : (((combo - 1) % 5) + 1) / 5;
  const previewTasks = TASKS.filter((task) => !isTaskClaimed(task, game)).slice(0, 2);
  const droneActive = game.droneTimeLeft > 0;
  const nextUpgrade = [...UPGRADES]
    .map((upgrade) => ({ ...upgrade, cost: getUpgradeCost(upgrade.id, game) }))
    .sort((a, b) => a.cost - b.cost)[0];
  const goalProgress = Math.min(1, game.coins / nextUpgrade.cost);

  const handleCoreClick = (event) => {
    if (game.energy < 1) {
      setDenied(true);
      window.clearTimeout(deniedTimer.current);
      deniedTimer.current = window.setTimeout(() => setDenied(false), 450);
      return;
    }

    const nextCombo = Math.min(20, combo + 1);
    const nextMultiplier = 1 + Math.floor(nextCombo / 5) * 0.25;
    const gain = Math.max(1, Math.round(game.clickPower * nextMultiplier));
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    setCombo(nextCombo);
    window.clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => setCombo(0), 1500);
    setBurstId((value) => value + 1);

    const float = {
      id: `${Date.now()}-${Math.random()}`,
      x: x + (Math.random() * 34 - 17),
      y: y - 18,
      gain,
      boosted: nextMultiplier > 1,
    };

    setFloats((current) => [...current.slice(-8), float]);
    const timer = window.setTimeout(() => {
      setFloats((current) => current.filter((item) => item.id !== float.id));
      floatTimers.current = floatTimers.current.filter((item) => item !== timer);
    }, 950);
    floatTimers.current.push(timer);

    onCoreClick(gain);
  };

  return (
    <div className="home-layout">
      <aside className="rail rail--left">
        <section className="panel operator-panel">
          <div className="panel-topline">
            <span>Оператор</span>
            <span className="online-label">
              <span className="status-dot" />
              online
            </span>
          </div>

          <div className="operator-main">
            <div className="operator-avatar">
              <BrandMark size={54} />
              <span className="operator-level">LVL {String(level.level).padStart(2, '0')}</span>
            </div>
            <div className="operator-copy">
              <h2>N-07</h2>
              <p>{level.title}</p>
            </div>
          </div>

          <div className="xp-block">
            <div className="xp-head">
              <span>Опыт ядра</span>
              <span>
                {formatNumber(level.current)} / {formatNumber(level.needed)}
              </span>
            </div>
            <div className="progress-track">
              <span className="progress-fill progress-fill--lime" style={{ width: `${level.progress * 100}%` }} />
            </div>
            <p className="xp-hint">До нового уровня: {formatNumber(level.toNext)} XP</p>
          </div>
        </section>

        <section className="panel energy-panel">
          <div className="panel-topline">
            <span>Энергоячейка</span>
            <Glyph name="energy" size={15} />
          </div>
          <div className="energy-value">
            <strong>{formatNumber(game.energy)}</strong>
            <span>/ {formatNumber(game.maxEnergy)}</span>
          </div>
          <div className="progress-track progress-track--energy">
            <span
              className={`progress-fill ${energyRatio < 0.2 ? 'progress-fill--danger' : 'progress-fill--cyan'}`}
              style={{ width: `${energyRatio * 100}%` }}
            />
          </div>
          <div className="metric-foot">
            <span>Поток</span>
            <span className="accent-cyan">+{ENERGY_REGEN_PER_SECOND}/сек</span>
          </div>
        </section>

        <section className="panel telemetry-panel">
          <div className="panel-topline">
            <span>Телеметрия</span>
            <Glyph name="activity" size={15} />
          </div>
          <div className="telemetry-list">
            <div>
              <span className="telemetry-label">
                <Glyph name="pulse" size={15} />
                За клик
              </span>
              <strong>+{formatNumber(game.clickPower)}</strong>
            </div>
            <div>
              <span className="telemetry-label">
                <Glyph name="bot" size={15} />
                Пассив
              </span>
              <strong>+{formatNumber(income)}/с</strong>
            </div>
            <div>
              <span className="telemetry-label">
                <Glyph name="target" size={15} />
                Кликов
              </span>
              <strong>{formatNumber(game.totalClicks)}</strong>
            </div>
          </div>
        </section>

        <section className="panel status-panel">
          <div className="panel-topline">
            <span>Канал связи</span>
            <span className="online-label">
              <span className="status-dot" />
              stable
            </span>
          </div>
          <div className="status-list">
            <div>
              <span>Сохранение</span>
              <strong>локальное</strong>
            </div>
            <div>
              <span>Протокол</span>
              <strong>v2.0</strong>
            </div>
            <div>
              <span>Соединение</span>
              <strong className="accent-cyan">защищено</strong>
            </div>
          </div>
        </section>

        <div className="rail-note">
          <span className="rail-note-line" />
          <p>Удерживай ритм: каждые пять кликов подряд усиливают импульс.</p>
        </div>
      </aside>

      <section className="panel reactor-stage">
        <div className="stage-head">
          <div className="stage-title">
            <span className="live-dot" />
            <span>Квантовый реактор</span>
            <span className="stage-divider">/</span>
            <span className="stage-sector">Сектор 07</span>
          </div>
          <div className="stage-status">
            <span>LIVE</span>
            <span className="stage-status-line" />
          </div>
        </div>

        <div className="balance-block">
          <p className="eyebrow">Квантовые кредиты</p>
          <div className="balance-value">{formatNumber(game.coins)}</div>
          <div className="income-row">
            <span className="income-pulse" />
            <span>+{formatNumber(income)} / сек</span>
            <span className="income-divider" />
            <span className="muted-text">{formatNumber(game.totalEarned)} всего</span>
          </div>
        </div>

        <div className="reactor-zone">
          <div className={`reactor ${energyRatio < 0.2 ? 'is-low-energy' : ''}`}>
            <span className="reactor-glow" />
            <span className="orbit orbit--one">
              <span className="orbit-node" />
            </span>
            <span className="orbit orbit--two" />
            <span className="orbit orbit--three">
              <span className="orbit-node orbit-node--cyan" />
            </span>

            <svg className="energy-ring" viewBox="0 0 400 400" aria-hidden="true">
              <defs>
                <linearGradient id="energy-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e8ff9a" />
                  <stop offset="0.5" stopColor="#c6ff4a" />
                  <stop offset="1" stopColor="#51e4c0" />
                </linearGradient>
              </defs>
              <circle className="energy-ring-track" cx="200" cy="200" r={RING_RADIUS} />
              <circle
                className="energy-ring-value"
                cx="200"
                cy="200"
                r={RING_RADIUS}
                strokeDasharray={`${RING_CIRCUMFERENCE * energyRatio} ${RING_CIRCUMFERENCE}`}
              />
            </svg>

            <span key={burstId} className={`core-burst ${burstId === 0 ? 'is-hidden' : ''}`} />

            <Motion.button
              type="button"
              className={`core-button ${denied ? 'is-denied' : ''}`}
              onClick={handleCoreClick}
              whileTap={{ scale: 0.955 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              aria-label="Синхронизировать ядро и получить кредиты"
              aria-disabled={game.energy < 1}
            >
              <span className="core-button-inner" />
              <span className="core-button-sheen" />
              <BrandMark size={94} className="core-logo" />
              <span className="core-button-label">SYNC</span>
            </Motion.button>

            <span className="core-stat core-stat--left">
              <span>E</span>
              {Math.round(energyRatio * 100)}%
            </span>
            <span className="core-stat core-stat--right">
              {formatNumber(game.energy)} / {formatNumber(game.maxEnergy)}
            </span>
          </div>

          <p className="core-caption">
            {denied ? <span className="accent-danger">Нет энергии — подожди восстановления</span> : 'Нажми на ядро, чтобы синхронизировать поток'}
          </p>
        </div>

        <div className="combo-strip">
          <div className="combo-main">
            <span className="combo-label">Цепочка импульса</span>
            <strong className={combo >= 5 ? 'combo-hot' : ''}>
              {combo >= 5 ? `×${comboMultiplier.toFixed(2).replace('.', ',')}` : `${combo} / 5`}
            </strong>
          </div>
          <div className="combo-track">
            <span style={{ width: `${comboProgress * 100}%` }} />
          </div>
          <span className="combo-hint">
            {combo >= 20 ? 'максимальный заряд' : 'до усиления'}
          </span>
        </div>

        <div className="action-row">
          <button
            type="button"
            className={`drone-action ${droneActive ? 'is-running' : ''}`}
            onClick={onStartDrone}
          >
            <span className="drone-icon">
              <Glyph name={droneActive ? 'orbit' : 'bot'} size={24} />
              {droneActive && <span className="drone-ping" />}
            </span>
            <span className="drone-copy">
              <span className="drone-label">{droneActive ? 'Дрон на орбите' : 'Орбитальный дрон'}</span>
              <span className="drone-description">
                {droneActive
                  ? `+${formatNumber(game.clickPower * 2)}/сек в течение сессии`
                  : 'Автосбор кредитов на 15 минут'}
              </span>
            </span>
            <span className="drone-time">
              {droneActive ? formatTime(game.droneTimeLeft) : 'Запуск'}
            </span>
          </button>

          <div className="energy-compact">
            <div className="energy-compact-head">
              <span>
                <Glyph name="energy" size={14} />
                Энергия
              </span>
              <strong>{Math.round(energyRatio * 100)}%</strong>
            </div>
            <div className="progress-track progress-track--energy">
              <span
                className={`progress-fill ${energyRatio < 0.2 ? 'progress-fill--danger' : 'progress-fill--cyan'}`}
                style={{ width: `${energyRatio * 100}%` }}
              />
            </div>
            <span className="energy-compact-foot">+{ENERGY_REGEN_PER_SECOND} ед. / сек</span>
          </div>
        </div>
      </section>

      <aside className="rail rail--right">
        <section className="panel daily-panel">
          <div className="daily-orb">
            <Glyph name="gift" size={23} />
          </div>
          <div className="daily-copy">
            <div className="panel-topline">
              <span>Бонус дня</span>
              <span className="daily-date">24H</span>
            </div>
            <div className="daily-reward">
              +{formatNumber(dailyReward)}
              <span>кр.</span>
            </div>
            <p>{dailyAvailable ? 'Награда ждёт оператора' : 'Получено сегодня. Ждём завтра.'}</p>
          </div>
          <button
            type="button"
            className={`btn btn--lime daily-button ${!dailyAvailable ? 'is-done' : ''}`}
            onClick={onClaimDaily}
            disabled={!dailyAvailable}
          >
            {dailyAvailable ? 'Забрать' : 'Получено'}
            {dailyAvailable && <Glyph name="arrow" size={15} />}
          </button>
        </section>

        <section className="panel contracts-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Протоколы</p>
              <h2>Контракты</h2>
            </div>
            <button type="button" className="text-link" onClick={() => onNavigate('contracts')}>
              Все
              <Glyph name="chevron" size={13} />
            </button>
          </div>

          <div className="contract-list">
            {previewTasks.length === 0 ? (
              <div className="empty-state">
                <Glyph name="check" size={23} />
                <p>Все доступные контракты закрыты.</p>
              </div>
            ) : (
              previewTasks.map((task) => {
                const progress = getTaskProgress(task, game);
                const percent = (progress / task.goal) * 100;
                const complete = isTaskComplete(task, game);
                return (
                  <div className="contract-row" key={task.id}>
                    <div className={`contract-icon contract-icon--${task.accent}`}>
                      <Glyph name={task.icon} size={16} />
                    </div>
                    <div className="contract-body">
                      <div className="contract-heading">
                        <span>{task.title}</span>
                        <span className="contract-reward">+{formatNumber(task.reward)}</span>
                      </div>
                      <div className="progress-track progress-track--small">
                        <span
                          className={`progress-fill progress-fill--${task.accent}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="contract-meta">
                        <span>
                          {formatNumber(progress)} / {formatNumber(task.goal)}
                        </span>
                        {complete ? (
                          <button
                            type="button"
                            className="mini-claim"
                            onClick={() => onClaimTask(task.id)}
                          >
                            Забрать
                          </button>
                        ) : (
                          <span>{Math.floor(percent)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel log-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Система</p>
              <h2>Журнал</h2>
            </div>
            <span className="log-live">
              <span className="status-dot" />
              live
            </span>
          </div>

          <div className="log-list">
            {game.log.slice(0, 4).map((entry) => (
              <div className="log-entry" key={entry.id}>
                <span className={`log-marker log-marker--${entry.tone}`} />
                <div>
                  <p>{entry.text}</p>
                  <span>{formatClock(new Date(entry.at))}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rank-mini">
          <div className="panel-topline">
            <span>Ранг оператора</span>
            <span className="rank-mini-level">LVL {String(level.level).padStart(2, '0')}</span>
          </div>
          <div className="rank-mini-head">
            <h2>{level.title}</h2>
            <strong>{Math.round(level.progress * 100)}%</strong>
          </div>
          <div className="progress-track">
            <span className="progress-fill progress-fill--lime" style={{ width: `${level.progress * 100}%` }} />
          </div>
          <p className="rank-mini-hint">До следующего ранга: {formatNumber(level.toNext)} XP</p>
        </section>

        <section className={`panel goal-panel ${game.coins >= nextUpgrade.cost ? 'is-ready' : ''}`}>
          <div className="panel-topline">
            <span>Следующий шаг</span>
            <Glyph name="target" size={14} />
          </div>
          <div className="goal-head">
            <h2>{nextUpgrade.name}</h2>
            <span>{nextUpgrade.effect(game)}</span>
          </div>
          <p>{nextUpgrade.description}</p>
          <div className="progress-track progress-track--small">
            <span className="progress-fill progress-fill--lime" style={{ width: `${goalProgress * 100}%` }} />
          </div>
          <div className="goal-footer">
            <span>
              {formatNumber(Math.min(game.coins, nextUpgrade.cost))} / {formatNumber(nextUpgrade.cost)}
            </span>
            <button type="button" className="text-link" onClick={() => onNavigate('upgrades')}>
              {game.coins >= nextUpgrade.cost ? 'Улучшить' : 'В магазин'}
              <Glyph name="chevron" size={12} />
            </button>
          </div>
        </section>
      </aside>

      <AnimatePresence>
        {floats.map((float) => (
          <Motion.span
            key={float.id}
            className={`click-float ${float.boosted ? 'is-boosted' : ''}`}
            style={{ left: float.x, top: float.y }}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -86, scale: 1 }}
            exit={{ opacity: 0, y: -120, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            +{formatNumber(float.gain)}
          </Motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
