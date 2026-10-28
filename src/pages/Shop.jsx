import Glyph from '../components/Glyph';
import {
  DRONE_RATE,
  UPGRADES,
  formatNumber,
  getPassiveIncome,
  getUpgradeCost,
} from '../game/config';

export default function Shop({ game, level, onBuyUpgrade }) {
  const income = getPassiveIncome(game);
  const droneIncome = game.droneTimeLeft > 0 ? game.clickPower * DRONE_RATE : 0;
  const costs = UPGRADES.map((upgrade) => ({
    ...upgrade,
    cost: getUpgradeCost(upgrade.id, game),
    currentLevel: upgrade.level(game),
  }));
  const nextUpgrade = [...costs].sort((a, b) => a.cost - b.cost)[0];

  return (
    <div className="subpage">
      <header className="page-head">
        <div className="page-head-copy">
          <div className="page-kicker">
            <span className="page-kicker-line" />
            Модернизация / 02
          </div>
          <h1>
            Апгрейды<span className="title-dot">.</span>
          </h1>
          <p>Собери ядро, которое работает даже без тебя. Каждый модуль усиливает следующий.</p>
        </div>
        <div className="page-balance">
          <span>Доступно</span>
          <strong>{formatNumber(game.coins)}</strong>
          <small>квантовых кредитов</small>
        </div>
      </header>

      <div className="subpage-layout">
        <div className="upgrade-stack">
          {costs.map((upgrade) => {
            const affordable = game.coins >= upgrade.cost;
            return (
              <article
                key={upgrade.id}
                className={`upgrade-card upgrade-card--${upgrade.accent}`}
              >
                <span className="upgrade-index">{upgrade.index}</span>

                <div className="upgrade-icon">
                  <Glyph name={upgrade.icon} size={28} strokeWidth={1.5} />
                  <span className="upgrade-icon-ring" />
                </div>

                <div className="upgrade-info">
                  <div className="upgrade-tagline">{upgrade.tagline}</div>
                  <h2>{upgrade.name}</h2>
                  <p>{upgrade.description}</p>
                  <div className="upgrade-facts">
                    <span>
                      Уровень <b>{upgrade.currentLevel}</b>
                    </span>
                    <span>
                      Эффект <b>{upgrade.effect(game)}</b>
                    </span>
                  </div>
                </div>

                <div className="upgrade-buy">
                  <span className="upgrade-price-label">Стоимость</span>
                  <button
                    type="button"
                    className={`buy-button ${affordable ? '' : 'is-locked'}`}
                    onClick={() => onBuyUpgrade(upgrade.id)}
                    aria-disabled={!affordable}
                    aria-label={`Купить ${upgrade.name} за ${formatNumber(upgrade.cost)} кредитов`}
                  >
                    <Glyph name="coin" size={16} />
                    <span>{formatNumber(upgrade.cost)}</span>
                    <Glyph name="plus" size={14} />
                  </button>
                  <span className={`affordability ${affordable ? 'is-ready' : ''}`}>
                    <span className="status-dot" />
                    {affordable ? 'Доступно' : 'Не хватает кредитов'}
                  </span>
                </div>
              </article>
            );
          })}

          <div className="upgrade-note">
            <Glyph name="shield" size={18} />
            <p>
              Все улучшения сохраняются автоматически. Прогресс не сбрасывается при закрытии
              вкладки.
            </p>
          </div>
        </div>

        <aside className="subpage-rail">
          <section className="panel output-panel">
            <div className="panel-topline">
              <span>Производительность</span>
              <span className="online-label">
                <span className="status-dot" />
                stable
              </span>
            </div>
            <div className="output-hero">
              <span className="output-prefix">+</span>
              <strong>{formatNumber(income)}</strong>
              <span className="output-unit">кр. / сек</span>
            </div>
            <div className="output-breakdown">
              <div>
                <span>
                  <Glyph name="bot" size={15} />
                  Дроны
                </span>
                <strong>+{formatNumber(game.autoClicks)}/с</strong>
              </div>
              <div>
                <span>
                  <Glyph name="orbit" size={15} />
                  Орбита
                </span>
                <strong>+{formatNumber(droneIncome)}/с</strong>
              </div>
              <div>
                <span>
                  <Glyph name="pulse" size={15} />
                  Импульс
                </span>
                <strong>+{formatNumber(game.clickPower)}/клик</strong>
              </div>
            </div>
          </section>

          <section className="panel rank-panel">
            <div className="panel-topline">
              <span>Ранг оператора</span>
              <span className="rank-number">LVL {String(level.level).padStart(2, '0')}</span>
            </div>
            <h2 className="rank-title">{level.title}</h2>
            <div className="progress-track">
              <span className="progress-fill progress-fill--lime" style={{ width: `${level.progress * 100}%` }} />
            </div>
            <div className="rank-meta">
              <span>{formatNumber(level.current)} XP</span>
              <span>{formatNumber(level.needed)} XP</span>
            </div>
            <p className="rank-hint">
              Ещё {formatNumber(level.toNext)} XP до следующего ранга. Опыт начисляется за все
              заработанные кредиты.
            </p>
          </section>

          <section className="recommendation">
            <span className="recommendation-label">Рекомендация системы</span>
            <div className="recommendation-main">
              <div className={`recommendation-icon recommendation-icon--${nextUpgrade.accent}`}>
                <Glyph name={nextUpgrade.icon} size={22} />
              </div>
              <div>
                <h3>{nextUpgrade.name}</h3>
                <p>Самый доступный следующий шаг для роста потока.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn--ghost recommendation-button"
              onClick={() => onBuyUpgrade(nextUpgrade.id)}
            >
              Улучшить за {formatNumber(nextUpgrade.cost)}
              <Glyph name="arrow" size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
