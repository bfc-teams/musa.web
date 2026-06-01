import React from 'react';

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur dark:border-strokedark dark:bg-boxdark/80">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
        {children}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-bodydark2">
            {title}
          </p>
          <h4 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
            {total}
          </h4>
        </div>

        <span
          className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium ${levelUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : ''
            } ${levelDown ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300' : ''} ${!rate ? 'invisible' : ''}`}
        >
          {rate}

          {levelUp && (
            <svg
              className="fill-meta-3"
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                fill=""
              />
            </svg>
          )}

          {levelDown && (
            <svg
              className="fill-meta-5"
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.64284 8.69236L9.09102 5.33986L10 6.22361L5 11.0849L-8.96553e-08 6.22361L0.908973 5.33986L4.35716 8.69236L4.35716 1.08487L5.64284 1.08487L5.64284 8.69236Z"
                fill=""
              />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
};

export default CardDataStats;
