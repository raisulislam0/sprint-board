export function priorityColor(priority) {
  if (!priority) return '#6b778c'
  const colors = { High: '#de350b', Medium: '#ffab00', Low: '#36b37e', Urgent: '#bf2600' }
  return colors[priority] || '#6b778c'
}

export function taskTitle(task) {
  return task?.task_title || task?.task || 'No Task'
}

function sharedEmployeeSignature(sharedEmployees) {
  if (!Array.isArray(sharedEmployees)) return ''
  return sharedEmployees
    .map((emp) => {
      if (typeof emp === 'string') return emp
      if (!emp) return ''
      return `${emp.employee_id || emp.name || ''}:${emp.employee_name || ''}`
    })
    .sort()
    .join('|')
}

function areTasksEqual(a, b) {
  if (a === b) return true
  if (!a || !b) return false

  return (
    a.name === b.name &&
    a.task === b.task &&
    a.task_title === b.task_title &&
    a.project === b.project &&
    a.project_name === b.project_name &&
    a.employee_name === b.employee_name &&
    a.employee_id === b.employee_id &&
    a.priority === b.priority &&
    a.status === b.status &&
    a.estimated_start_date === b.estimated_start_date &&
    a.estimated_end_date === b.estimated_end_date &&
    a.actual_start_date === b.actual_start_date &&
    a.actual_end_date === b.actual_end_date &&
    a.story_point === b.story_point &&
    a.remarks === b.remarks &&
    sharedEmployeeSignature(a.shared_employees) === sharedEmployeeSignature(b.shared_employees)
  )
}

export function mergeBoardState(prevColumns, prevDataByColumn, nextColumns, nextDataByColumn) {
  const finalColumns = Array.isArray(nextColumns) ? nextColumns : []
  const mergedData = {}
  let hasChange = prevColumns.length !== finalColumns.length

  if (!hasChange) {
    for (let i = 0; i < prevColumns.length; i += 1) {
      if (prevColumns[i] !== finalColumns[i]) {
        hasChange = true
        break
      }
    }
  }

  finalColumns.forEach((column) => {
    const prevTasks = prevDataByColumn[column] || []
    const nextTasks = nextDataByColumn[column] || []
    const prevByName = new Map(prevTasks.map((t) => [t.name, t]))
    const mergedTasks = []
    let columnChanged = prevTasks.length !== nextTasks.length

    for (let i = 0; i < nextTasks.length; i += 1) {
      const incoming = nextTasks[i]
      const old = prevByName.get(incoming.name)
      if (old && areTasksEqual(old, incoming)) {
        mergedTasks.push(old)
      } else {
        mergedTasks.push(incoming)
        columnChanged = true
      }
    }

    if (!columnChanged) {
      mergedData[column] = prevTasks
    } else {
      mergedData[column] = mergedTasks
      hasChange = true
    }
  })

  return {
    hasChange,
    columns: hasChange ? finalColumns : prevColumns,
    dataByColumn: hasChange ? mergedData : prevDataByColumn,
  }
}

export function displayDate(dateValue) {
  if (!dateValue) return ''
  return String(dateValue)
}

export function extractSharedEmployeeIds(sharedEmployees) {
  if (!Array.isArray(sharedEmployees)) return []
  return sharedEmployees
    .map((emp) => {
      if (!emp) return null
      if (typeof emp === 'string') return emp
      return emp.employee_id || emp.name || null
    })
    .filter(Boolean)
}
