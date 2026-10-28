import Glyph from '../components/Glyph';
import {
  TASKS,
  formatNumber,
  getTaskProgress,
  isTaskClaimed,
  isTaskComplete,
} from '../game/config';

export default function Tasks({ game, onClaimTask }) {
  const claimedCount = TASKS.filter((task) => isTaskClaimed(task, game)).length;
  const readyCount = TASKS.filter(
    (task) => !isTaskClaimed(task, game) && isTaskComplete(task, game),
  ).length;
  const earnedFromTasks = TASKS.filter((task) => isTaskClaimed(task, game)).reduce(
    (sum, task) => sum + task.reward,
    0,
  );
  const availableRewards = TASKS.filter((task) => !isTaskClaimed(task, game)).reduce(
    (sum, task) => sum + task.reward,
    0,
  );
  const completion = (claimedCount / TASKS.length) * 100;

  return (
    <div className="subpage">
      <header className="page-head">
        <div className="page-head-copy">
          <div className="page-kicker">
            <span className="page-kicker-line" />
            Протоколы / 03
          </div>
          <h1>
            Контракты<span className="title-dot">.</span>
          </h1>
          <p>Короткие задачи для оператора ядра. Выполняй условия и забирай кредиты без штрафов.</p>
        </div>
        <div className="page-balance page-balance--completion">
          <span>Закрыто</span>
          <strong>
            {claimedCount}
            <small> / {TASKS.length}</small>
          </strong>
          <div className="progress-track progress-track--small">
            <span className="progress-fill progress-fill--lime" style={{ width: `${completion}%` }} />
          </div>
          <small>{readyCount > 0 ? `${readyCount} готово к получению` : 'Продолжай синхронизацию'}</small>
        </div>
      </header>

      <div className="subpage-layout">
        <div className="task-grid">
          {TASKS.map((task, index) => {
            const claimed = isTaskClaimed(task, game);
            const complete = isTaskComplete(task, game);
            const progress = getTaskProgress(task, game);
            const percent = Math.min(100, (progress / task.goal) * 100);

            return (
              <article
                key={task.id}
                className={`task-card task-card--${task.accent} ${
                  claimed ? 'is-claimed' : complete ? 'is-ready' : ''
                }`}
                style={{ '--delay': `${index * 65}ms` }}
              >
                <div className="task-top">
                  <div className="task-icon">
                    <Glyph name={task.icon} size={24} />
                  </div>
                  <span className={`task-status ${claimed ? 'is-claimed' : complete ? 'is-ready' : ''}`}>
                    {claimed ? 'Получено' : complete ? 'Готово' : 'В процессе'}
                  </span>
                </div>

                <div className="task-copy">
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                </div>

                <div className="task-progress">
                  <div className="task-progress-head">
                    <span>Прогресс</span>
                    <span>
                      {formatNumber(progress)} / {formatNumber(task.goal)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <span
                      className={`progress-fill progress-fill--${task.accent}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="task-footer">
                  <div className="task-reward">
                    <Glyph name="coin" size={17} />
                    <strong>+{formatNumber(task.reward)}</strong>
                    <span>кр.</span>
                  </div>
                  <button
                    type="button"
                    className={`task-button ${claimed ? 'is-claimed' : complete ? 'is-ready' : ''}`}
                    onClick={() => onClaimTask(task.id)}
                    disabled={claimed}
                  >
                    {claimed ? (
                      <>
                        Получено
                        <Glyph name="check" size={15} />
                      </>
                    ) : complete ? (
                      <>
                        Забрать
                        <Glyph name="arrow" size={15} />
                      </>
                    ) : (
                      'Выполнить'
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="subpage-rail">
          <section className="panel summary-panel">
            <div className="panel-topline">
              <span>Сводка контрактов</span>
              <Glyph name="chart" size={15} />
            </div>
            <div className="summary-hero">
              <span>Заработано</span>
              <strong>{formatNumber(earnedFromTasks)}</strong>
              <small>кредитов за закрытые задачи</small>
            </div>
            <div className="summary-list">
              <div>
                <span>Выполнено</span>
                <strong>
                  {claimedCount} из {TASKS.length}
                </strong>
              </div>
              <div>
                <span>Доступно наград</span>
                <strong className="accent-lime">{formatNumber(availableRewards)}</strong>
              </div>
              <div>
                <span>Готово к получению</span>
                <strong>{readyCount}</strong>
              </div>
            </div>
          </section>

          <section className="panel how-panel">
            <div className="panel-topline">
              <span>Как это работает</span>
              <Glyph name="network" size={15} />
            </div>
            <ol className="how-list">
              <li>
                <span>01</span>
                <p>Выполни условие контракта в игре.</p>
              </li>
              <li>
                <span>02</span>
                <p>Вернись сюда и забери награду.</p>
              </li>
              <li>
                <span>03</span>
                <p>Вложи кредиты в модули реактора.</p>
              </li>
            </ol>
          </section>

          <div className="rail-note rail-note--task">
            <span className="rail-note-line" />
            <p>
              Контракты не сгорают. Можно закрыть все задания сразу, когда наберётся достаточно
              прогресса.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
