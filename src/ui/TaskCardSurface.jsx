import Card from './Card.jsx'

function formatDateRange(task) {
  const start = task?.estimated_start_date ? String(task.estimated_start_date) : ''
  const end = task?.estimated_end_date ? String(task.estimated_end_date) : ''
  if (start && end) return `${start} - ${end}`
  return start || end || ''
}

/**
 * @param {'default' | 'dragging-placeholder' | 'overlay'} variant
 */
export default function TaskCardSurface({ task, column, onOpenTask, variant = 'default', dragHandleProps, dragAriaGrabbed }) {
  const dateDisplay = formatDateRange(task)
  const sharedCount = Array.isArray(task.shared_employees) ? task.shared_employees.length : 0
  const leftBorder = task._priorityColor || '#6b778c'

  const surfaceClass =
    variant === 'overlay'
      ? 'mb-0 cursor-grabbing shadow-2xl ring-2 ring-blue-500/35 transition-[transform,box-shadow] duration-200 ease-out will-change-transform [transform:translateZ(0)]'
      : variant === 'dragging-placeholder'
        ? 'mb-2.5 cursor-grabbing border-dashed opacity-[0.42] shadow-inner ring-2 ring-slate-300/80'
        : 'mb-2.5'

  const dragHandleClass =
    variant === 'overlay' ? 'cursor-grabbing' : variant === 'dragging-placeholder' ? 'cursor-grabbing' : 'cursor-grab'

  const cardMain = (
    <>
      <div className="mb-1.5 text-[13px] font-bold text-slate-900">{task._title}</div>
      {task.project_name || task.project ? (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">{task.project_name || task.project}</div>
      ) : null}
      {task.employee_name ? (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-xs leading-none" aria-hidden="true">
            👤
          </span>
          {task.employee_name}
        </div>
      ) : null}
      {sharedCount > 0 ? (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-blue-600">
          Shared with {sharedCount} {sharedCount === 1 ? 'employee' : 'employees'}
        </div>
      ) : null}
      {dateDisplay ? (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-xs leading-none" aria-hidden="true">
            📅
          </span>
          {dateDisplay}
        </div>
      ) : null}
    </>
  )

  return (
    <Card
      className={`${surfaceClass} select-none p-2.5`}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: leftBorder,
        ...(variant === 'overlay'
          ? {
              transform: 'scale(1.02) rotate(1deg)',
            }
          : {}),
      }}
    >
      <div className="mb-1.5 flex justify-end">
        {variant !== 'overlay' ? (
          <button
            className="relative z-10 cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenTask?.(task.name)
            }}
            aria-label="Edit task"
            title="Edit task"
          >
            Edit
          </button>
        ) : (
          <span className="pointer-events-none inline-block min-h-[28px] min-w-[44px]" aria-hidden />
        )}
      </div>
      {variant === 'overlay' ? (
        <div className={dragHandleClass}>{cardMain}</div>
      ) : (
        <div
          className={dragHandleClass}
          {...(dragHandleProps || {})}
          role="button"
          tabIndex={0}
          aria-label={`Drag to move task: ${task._title || task.name || 'task'}`}
          aria-grabbed={dragAriaGrabbed === true ? true : undefined}
          style={{ touchAction: 'none' }}
        >
          {cardMain}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        {task.priority ? (
          <span className="rounded-full px-2 py-0.5 text-[11px] text-white" style={{ background: task._priorityColor || '#6b778c' }}>
            {task.priority}
          </span>
        ) : (
          <span className="rounded-full bg-slate-500 px-2 py-0.5 text-[11px] text-white">{column}</span>
        )}
      </div>
    </Card>
  )
}
