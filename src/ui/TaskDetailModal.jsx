import { useMemo } from 'react'
import { displayDate } from '../lib/boardState.js'
import Card from './Card.jsx'
import { IconSearch } from './icons.jsx'

export default function TaskDetailModal({
  open,
  taskModalLoading,
  taskModalSaving,
  taskModalError,
  taskDetails,
  taskForm,
  setTaskForm,
  sharedEmployeeOptions,
  sharedEmployeeQuery,
  setSharedEmployeeQuery,
  sharedDropdownOpen,
  setSharedDropdownOpen,
  sharedFieldRef,
  onClose,
  onSave,
  toggleSharedEmployee,
}) {
  const filteredSharedOptions = useMemo(() => {
    return sharedEmployeeOptions.filter((opt) => {
      const q = sharedEmployeeQuery.trim().toLowerCase()
      const notSelected = !taskForm.shared_employees.includes(opt.value)
      if (!notSelected) return false
      if (!q) return true
      return `${opt.label} ${opt.value}`.toLowerCase().includes(q)
    })
  }, [sharedEmployeeOptions, sharedEmployeeQuery, taskForm.shared_employees])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <Card className="max-h-[calc(100svh-36px)] w-full max-w-[980px] overflow-auto p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-base font-bold">Task Details</div>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {taskModalLoading ? <div className="p-4 text-sm text-slate-500">Loading task details…</div> : null}
        {taskModalError ? (
          <div className="mb-3 whitespace-pre-wrap break-words rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm leading-snug text-red-700">
            {taskModalError}
          </div>
        ) : null}

        {!taskModalLoading && taskDetails ? (
          <div className="grid gap-3">
            <div className="border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900">Task Information</div>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Task</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.task || ''} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Project</span>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
                  value={taskDetails.project_name || taskDetails.project || ''}
                  disabled
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Parent Sprint Plan</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.parent || ''} disabled />
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Task Title</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.task_title || ''} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Project Name</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.project_name || ''} disabled />
              </label>
            </div>

            <div className="border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900">Assignment Details</div>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Employee ID</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.employee_id || ''} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Status</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.status || ''} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Story Point</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.story_point || ''} disabled />
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Employee Name</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.employee_name || ''} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Priority</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={taskDetails.priority || ''} disabled />
              </label>
            </div>

            <div>
              <div className="border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900">Shared Employees</div>
              <p className="mb-2 text-xs leading-relaxed text-slate-500">
                Search sprint members and tap a row to add. Remove someone from the chips below.
              </p>
              <div className="relative" ref={sharedFieldRef}>
                <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400">
                  <IconSearch className="h-4 w-4" />
                </span>
                <input
                  id="shared-employee-search"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner outline-none transition-[border,box-shadow,background-color] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Filter by name or ID…"
                  value={sharedEmployeeQuery}
                  aria-controls="shared-employee-listbox"
                  aria-autocomplete="list"
                  onFocus={() => setSharedDropdownOpen(true)}
                  onChange={(e) => {
                    setSharedEmployeeQuery(e.target.value)
                    setSharedDropdownOpen(true)
                  }}
                />
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  {sharedEmployeeOptions.length > 0 ? (
                    <span>
                      {filteredSharedOptions.length} of {sharedEmployeeOptions.length} shown
                      {sharedEmployeeQuery.trim() ? ` matching “${sharedEmployeeQuery.trim()}”` : ''}
                    </span>
                  ) : (
                    <span>No employees loaded for this sprint</span>
                  )}
                </div>
                {sharedDropdownOpen && filteredSharedOptions.length > 0 ? (
                  <div
                    id="shared-employee-listbox"
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[220px] overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-300/30 ring-1 ring-slate-200/80"
                  >
                    {filteredSharedOptions.slice(0, 12).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-900 hover:bg-blue-50"
                        onClick={() => {
                          toggleSharedEmployee(opt.value)
                          setSharedEmployeeQuery('')
                          setSharedDropdownOpen(true)
                        }}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{opt.value}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {sharedDropdownOpen && sharedEmployeeOptions.length > 0 && filteredSharedOptions.length === 0 && sharedEmployeeQuery.trim() ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    No employees match “{sharedEmployeeQuery.trim()}”. Try another spelling.
                  </div>
                ) : null}
              </div>
              <div className="mb-2 mt-3 flex flex-wrap gap-1.5">
                {taskForm.shared_employees.length ? (
                  taskForm.shared_employees.map((id) => {
                    const option = sharedEmployeeOptions.find((opt) => opt.value === id)
                    return (
                      <button
                        key={id}
                        type="button"
                        className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 transition-[background] hover:bg-blue-100"
                        onClick={() => toggleSharedEmployee(id)}
                      >
                        {option?.label || id}
                        <span className="ml-1 text-blue-500" aria-hidden>
                          ×
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <span className="px-0.5 text-xs text-slate-500">No shared employees selected</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900">Date Information</div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Estimated Start Date</span>
                <input
                  className="w-full rounded-lg border border-blue-200 bg-gradient-to-b from-white to-blue-50 px-2.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline focus:outline-2 focus:outline-blue-200"
                  type="date"
                  value={taskForm.estimated_start_date || ''}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, estimated_start_date: e.target.value }))}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Estimated End Date</span>
                <input
                  className="w-full rounded-lg border border-blue-200 bg-gradient-to-b from-white to-blue-50 px-2.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline focus:outline-2 focus:outline-blue-200"
                  type="date"
                  value={taskForm.estimated_end_date || ''}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, estimated_end_date: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Actual Start Date</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={displayDate(taskDetails.actual_start_date)} disabled />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Actual End Date</span>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={displayDate(taskDetails.actual_end_date)} disabled />
              </label>
            </div>

            <div>
              <div className="border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900">Additional Information</div>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Remarks</span>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
                  rows={4}
                  value={taskForm.remarks}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </label>
            </div>

            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onClose}
                disabled={taskModalSaving}
              >
                Close
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onSave}
                disabled={taskModalSaving}
              >
                {taskModalSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
