import { motion } from "framer-motion";

const SERIES = [
  { key: "Task", label: "Tasks", color: "#ff914b" },
  { key: "Meeting", label: "Meetings", color: "#10B981" },
  { key: "Project", label: "Projects", color: "#e8772e" },
];

const DEFAULT_DATA = [
  { day: "Monday", Task: 2, Meeting: 1, Project: 0 },
  { day: "Tuesday", Task: 3, Meeting: 2, Project: 0 },
  { day: "Wednesday", Task: 4, Meeting: 3, Project: 1 },
  { day: "Thursday", Task: 6, Meeting: 7, Project: 0 },
  { day: "Friday", Task: 3, Meeting: 2, Project: 1 },
  { day: "Saturday", Task: 1, Meeting: 0, Project: 0 },
  { day: "Sunday", Task: 0, Meeting: 1, Project: 0 },
];

const shortDay = (day) => {
  if (!day) return "";
  if (day.length <= 3) return day;
  return day.slice(0, 3);
};

/**
 * Custom animated grouped bar chart (no images / no chart lib).
 * Expects data: [{ day, Task, Meeting, Project }, ...]
 */
const WeeklyBarChart = ({
  data = DEFAULT_DATA,
  height = 280,
  compact = false,
  animate = true,
}) => {
  const rows = data?.length ? data : DEFAULT_DATA;
  const maxValue = Math.max(
    1,
    ...rows.flatMap((d) => SERIES.map((s) => Number(d[s.key]) || 0)),
  );
  const ticks =
    maxValue <= 7
      ? Array.from({ length: maxValue + 1 }, (_, i) => i)
      : Array.from({ length: 8 }, (_, i) =>
          Math.round((maxValue / 7) * i),
        ).filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

  const chartMax = Math.max(maxValue, ticks[ticks.length - 1] || 1);

  return (
    <div
      className={`weekly-bar-chart ${compact ? "weekly-bar-chart--compact" : ""}`}
    >
      <div
        className="weekly-bar-chart__plot"
        style={{ height: compact ? Math.min(height, 180) : height }}
      >
        <div className="weekly-bar-chart__grid" aria-hidden>
          {[...ticks].reverse().map((tick) => (
            <div key={tick} className="weekly-bar-chart__grid-row">
              <span className="weekly-bar-chart__y-label">{tick}</span>
              <span className="weekly-bar-chart__grid-line" />
            </div>
          ))}
        </div>

        <div className="weekly-bar-chart__bars">
          {rows.map((row, dayIdx) => (
            <div key={row.day || dayIdx} className="weekly-bar-chart__day">
              <div className="weekly-bar-chart__group">
                {SERIES.map((series, sIdx) => {
                  const value = Number(row[series.key]) || 0;
                  const pct = Math.max((value / chartMax) * 100, value > 0 ? 4 : 0);
                  return (
                    <div
                      key={series.key}
                      className="weekly-bar-chart__bar-wrap"
                      title={`${series.label}: ${value}`}
                    >
                      <motion.div
                        className="weekly-bar-chart__bar"
                        initial={animate ? { scaleY: 0, opacity: 0 } : false}
                        whileInView={
                          animate
                            ? { scaleY: 1, opacity: value > 0 ? 1 : 0.15 }
                            : undefined
                        }
                        viewport={{ once: true, amount: 0.4 }}
                        animate={
                          animate
                            ? undefined
                            : { scaleY: 1, opacity: value > 0 ? 1 : 0.15 }
                        }
                        transition={{
                          delay: animate
                            ? 0.12 + dayIdx * 0.05 + sIdx * 0.025
                            : 0,
                          duration: 0.55,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          backgroundColor: series.color,
                          height: `${pct}%`,
                          transformOrigin: "bottom",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <span className="weekly-bar-chart__x-label">
                {compact ? shortDay(row.day) : row.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-bar-chart__legend">
        {SERIES.map((series, i) => (
          <motion.span
            key={series.key}
            className="weekly-bar-chart__chip"
            initial={animate ? { opacity: 0, y: 8 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            animate={animate ? undefined : { opacity: 1, y: 0 }}
            transition={{
              delay: animate ? 0.45 + i * 0.08 : 0,
              duration: 0.35,
            }}
          >
            <span
              className="weekly-bar-chart__chip-dot"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

export default WeeklyBarChart;
export { SERIES as WEEKLY_BAR_SERIES, DEFAULT_DATA as WEEKLY_BAR_DEFAULT_DATA };
