import { FILTER_DEBOUNCE_MS } from '../lib/useDebouncedValue.js'
import Card from './Card.jsx'
import { IconSearch } from './icons.jsx'

function SearchField({ label, hint, value, onChange, disabled, placeholder, id }) {
  const inputId = id || `search-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label className="grid gap-1.5" htmlFor={inputId}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {hint ? <span className="-mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</span> : null}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch className="h-4 w-4" />
        </span>
        <input
          id={inputId}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner outline-none transition-[border,box-shadow,background-color] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </label>
  )
}

export default function BoardFilters({
  sprintPlan,
  onSprintPlanChange,
  employeeId,
  currentUserEmployeeId,
  isSystemManager,
  onEmployeeChange,
  project,
  onProjectChange,
  filtersPending,
  loading,
  onClear,
}) {
  return (
    <Card className="mb-3 overflow-hidden border-slate-200/90 p-0 shadow-md shadow-slate-200/40">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600/10 text-blue-700" aria-hidden>
                <IconSearch className="h-4 w-4" />
              </span>
              Find tasks on the board
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
              Matches sprint plan, employee (when allowed), and project name. Results refresh automatically after you pause typing for{' '}
              <span className="font-medium text-slate-600">{FILTER_DEBOUNCE_MS}ms</span>.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            {filtersPending ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                Waiting for pause…
              </span>
            ) : null}
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-[background,box-shadow] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClear}
              disabled={loading}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 md:gap-5 md:p-5">
        <SearchField
          id="filter-sprint"
          label="Sprint plan"
          hint="Name of the sprint, or leave empty to use the open sprint when available."
          placeholder="Search by sprint plan…"
          value={sprintPlan}
          onChange={onSprintPlanChange}
        />
        <SearchField
          id="filter-employee"
          label="Employee"
          hint={isSystemManager ? 'Optional. Filters by employee record ID.' : 'Locked to your employee for this board.'}
          placeholder={isSystemManager ? 'Employee ID…' : currentUserEmployeeId || '—'}
          value={isSystemManager ? employeeId : currentUserEmployeeId}
          onChange={onEmployeeChange}
          disabled={!isSystemManager}
        />
        <SearchField
          id="filter-project"
          label="Project"
          hint="Optional. Matches project linked to tasks."
          placeholder="Search by project…"
          value={project}
          onChange={onProjectChange}
        />
      </div>
    </Card>
  )
}
