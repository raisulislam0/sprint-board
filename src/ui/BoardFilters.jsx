import { FILTER_DEBOUNCE_MS } from '../lib/useDebouncedValue.js'
import Card from './Card.jsx'
import { IconSearch } from './icons.jsx'

function SearchField({ label, hint, value, onChange, disabled, placeholder, id }) {
  const inputId = id || `search-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label className="grid min-w-0 gap-0.5" htmlFor={inputId}>
      <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500" title={hint || ''}>
        {label}
      </span>
      <div className="relative min-w-0">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch className="h-3.5 w-3.5" />
        </span>
        <input
          id={inputId}
          className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-2 text-xs text-slate-900 shadow-inner outline-none transition-[border,box-shadow,background-color] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={placeholder}
          value={value}
          title={hint}
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
    <Card className="mb-2 overflow-hidden border-slate-200/90 p-2.5 shadow-sm shadow-slate-200/35 sm:p-3">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2">
          <SearchField
            id="filter-sprint"
            label="Sprint plan"
            hint="Name of the sprint, or leave empty to use the open sprint when available."
            placeholder="Sprint plan…"
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
            placeholder="Project…"
            value={project}
            onChange={onProjectChange}
          />
        </div>

        <div className="flex min-h-[1.625rem] min-w-[7rem] shrink-0 flex-wrap items-center justify-end gap-2 sm:min-w-[7.75rem]">
          <span
            className={
              filtersPending
                ? 'inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200/80'
                : 'pointer-events-none inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium opacity-0'
            }
            {...(filtersPending ? {} : { 'aria-hidden': true })}
          >
            <span className="relative flex h-1.5 w-1.5">
              {filtersPending ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                </>
              ) : (
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-transparent" />
              )}
            </span>
            Pause {FILTER_DEBOUNCE_MS}ms
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-[background,box-shadow] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>
    </Card>
  )
}
