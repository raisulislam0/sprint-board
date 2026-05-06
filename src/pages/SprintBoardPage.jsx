import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { extractSharedEmployeeIds, mergeBoardState, priorityColor, taskTitle } from '../lib/boardState.js'
import { FILTER_DEBOUNCE_MS, useDebouncedValue } from '../lib/useDebouncedValue.js'
import { frappeCall, getLoggedUser, logout } from '../lib/frappe.js'
import BoardColumn from '../ui/BoardColumn.jsx'
import BoardFilters from '../ui/BoardFilters.jsx'
import Card from '../ui/Card.jsx'
import SprintBoardHeader from '../ui/SprintBoardHeader.jsx'
import TaskCardSurface from '../ui/TaskCardSurface.jsx'
import TaskDetailModal from '../ui/TaskDetailModal.jsx'

const boardDropAnimation = {
  ...defaultDropAnimation,
  duration: 320,
  easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)',
}

export default function SprintBoardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState('')

  const [sprintPlan, setSprintPlan] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [project, setProject] = useState('')

  const debouncedSprint = useDebouncedValue(sprintPlan, FILTER_DEBOUNCE_MS)
  const debouncedEmployee = useDebouncedValue(employeeId, FILTER_DEBOUNCE_MS)
  const debouncedProject = useDebouncedValue(project, FILTER_DEBOUNCE_MS)

  const [isSystemManager, setIsSystemManager] = useState(false)
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState('')

  const [columns, setColumns] = useState([])
  const [dataByColumn, setDataByColumn] = useState({})
  const [dragOverlay, setDragOverlay] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalLoading, setTaskModalLoading] = useState(false)
  const [taskModalSaving, setTaskModalSaving] = useState(false)
  const [taskModalError, setTaskModalError] = useState('')
  const [taskDetails, setTaskDetails] = useState(null)
  const [sharedEmployeeOptions, setSharedEmployeeOptions] = useState([])
  const [sharedEmployeeQuery, setSharedEmployeeQuery] = useState('')
  const [sharedDropdownOpen, setSharedDropdownOpen] = useState(false)
  const sharedFieldRef = useRef(null)
  const [taskForm, setTaskForm] = useState({
    estimated_start_date: '',
    estimated_end_date: '',
    remarks: '',
    shared_employees: [],
  })
  const syncInFlightRef = useRef(false)
  const pauseSyncUntilRef = useRef(0)
  const filterRef = useRef({
    sprintPlan: '',
    employeeId: '',
    project: '',
    isSystemManager: false,
    currentUserEmployeeId: '',
  })

  useEffect(() => {
    filterRef.current = {
      sprintPlan,
      employeeId,
      project,
      isSystemManager,
      currentUserEmployeeId,
    }
  }, [sprintPlan, employeeId, project, isSystemManager, currentUserEmployeeId])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const orderedColumns = useMemo(() => columns, [columns])

  const filtersPending =
    debouncedSprint !== sprintPlan || debouncedProject !== project || (isSystemManager && debouncedEmployee !== employeeId)

  const loadBoard = useCallback(async ({ nextSprintPlan, nextEmployeeId, nextProject, silent = false } = {}) => {
    if (syncInFlightRef.current) return
    syncInFlightRef.current = true

    const f = filterRef.current
    const sp = nextSprintPlan !== undefined ? nextSprintPlan : f.sprintPlan
    const proj = nextProject !== undefined ? nextProject : f.project
    let emp
    if (nextEmployeeId !== undefined) {
      emp = nextEmployeeId
    } else {
      emp = f.isSystemManager ? f.employeeId : f.currentUserEmployeeId
    }

    if (!silent) {
      setError('')
      setLoading(true)
    }

    try {
      const payload = await frappeCall({
        method: 'fusion_infotech.fusion_infotech.api.sprint_board.get_sprint_board_data',
        args: {
          sprint_plan: sp || null,
          employee_id: emp || null,
          project: proj || null,
        },
      })

      const cols = payload?.columns || []
      const data = payload?.data || {}
      setColumns((prevColumns) => {
        let nextCols = prevColumns
        setDataByColumn((prevData) => {
          const merged = mergeBoardState(prevColumns, prevData, cols, data)
          nextCols = merged.columns
          return merged.dataByColumn
        })
        return nextCols
      })
    } catch (e) {
      if (!silent) {
        setError(e?.message || 'Failed to load board data')
      }
    } finally {
      if (!silent) setLoading(false)
      syncInFlightRef.current = false
    }
  }, [])

  const loadCurrentUserEmployeeId = useCallback(async () => {
    if (user === 'Administrator' || isSystemManager) return
    try {
      const val = await frappeCall({
        method: 'frappe.client.get_value',
        args: { doctype: 'Employee', filters: { user_id: user }, fieldname: 'name' },
      })
      if (val?.name) setCurrentUserEmployeeId(val.name)
    } catch {
      // ignore
    }
  }, [user, isSystemManager])

  const loadOpenSprintPlan = useCallback(async () => {
    try {
      const open = await frappeCall({
        method: 'fusion_infotech.fusion_infotech.api.sprint_board.get_open_sprint_plan',
        args: {},
      })
      if (open) setSprintPlan(open)
    } catch {
      // ignore (board can still load without sprint_plan)
    }
  }, [])

  async function bootstrap() {
    setLoading(true)
    setError('')
    try {
      const u = await getLoggedUser()
      setUser(u || '')

      try {
        const isMgr = await frappeCall({
          method: 'fusion_infotech.fusion_infotech.api.sprint_board.is_system_manager',
          args: {},
        })
        setIsSystemManager(Boolean(isMgr))
      } catch {
        setIsSystemManager(false)
      }
    } catch (e) {
      setError(e?.message || 'Failed to initialize')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {
    if (!user) return
    loadCurrentUserEmployeeId()
  }, [user, loadCurrentUserEmployeeId])

  useEffect(() => {
    if (!user) return
    if (!sprintPlan) loadOpenSprintPlan()
  }, [user, sprintPlan, loadOpenSprintPlan])

  useEffect(() => {
    if (!user) return
    loadBoard({
      nextSprintPlan: debouncedSprint,
      nextEmployeeId: isSystemManager ? debouncedEmployee : currentUserEmployeeId,
      nextProject: debouncedProject,
    })
  }, [user, debouncedSprint, debouncedEmployee, debouncedProject, isSystemManager, currentUserEmployeeId, loadBoard])

  useEffect(() => {
    if (!user) return undefined

    const intervalId = window.setInterval(() => {
      const now = Date.now()
      if (now < pauseSyncUntilRef.current) return

      loadBoard({
        nextSprintPlan: debouncedSprint,
        nextEmployeeId: isSystemManager ? debouncedEmployee : currentUserEmployeeId,
        nextProject: debouncedProject,
        silent: true,
      })
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [user, debouncedSprint, debouncedEmployee, debouncedProject, isSystemManager, currentUserEmployeeId, loadBoard])

  useEffect(() => {
    function onDocumentMouseDown(event) {
      if (!sharedDropdownOpen) return
      if (!sharedFieldRef.current) return
      if (!sharedFieldRef.current.contains(event.target)) {
        setSharedDropdownOpen(false)
      }
    }

    function onDocumentKeyDown(event) {
      if (event.key === 'Escape') {
        setSharedDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentMouseDown)
    document.addEventListener('keydown', onDocumentKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown)
      document.removeEventListener('keydown', onDocumentKeyDown)
    }
  }, [sharedDropdownOpen])

  async function onLogout() {
    await logout().catch(() => null)
    window.location.href = '/login'
  }

  async function onTaskMove({ taskName, toStatus }) {
    try {
      if (!isSystemManager && currentUserEmployeeId) {
        const can = await frappeCall({
          method: 'fusion_infotech.fusion_infotech.api.sprint_board.can_update_task_status',
          args: { task_name: taskName, employee_id: currentUserEmployeeId },
        })
        if (can !== true) throw new Error('Permission denied')
      }

      await frappeCall({
        method: 'fusion_infotech.fusion_infotech.api.sprint_board.update_task_status_with_dates',
        args: {
          task_name: taskName,
          new_status: toStatus,
          employee_id: currentUserEmployeeId || null,
        },
      })
    } catch (e) {
      setError(e?.message || 'Failed to update task status')
      await loadBoard({
        nextSprintPlan: sprintPlan,
        nextEmployeeId: isSystemManager ? employeeId : currentUserEmployeeId,
        nextProject: project,
      })
    }
  }

  function patchTaskInBoard(taskName, patch) {
    setDataByColumn((prev) => {
      const next = { ...prev }
      let changed = false

      Object.keys(next).forEach((columnName) => {
        const tasks = next[columnName] || []
        let colChanged = false
        const updated = tasks.map((task) => {
          if (task.name !== taskName) return task
          colChanged = true
          changed = true
          return { ...task, ...patch }
        })
        if (colChanged) next[columnName] = updated
      })

      return changed ? next : prev
    })
  }

  async function openTaskModal(taskName) {
    setTaskModalOpen(true)
    setTaskModalLoading(true)
    setTaskModalError('')
    setTaskDetails(null)
    setSharedEmployeeOptions([])

    try {
      const detail = await frappeCall({
        method: 'fusion_infotech.fusion_infotech.api.sprint_board.get_task_details',
        args: { task_name: taskName },
      })

      setTaskDetails(detail)
      setTaskForm({
        estimated_start_date: detail?.estimated_start_date || '',
        estimated_end_date: detail?.estimated_end_date || '',
        remarks: detail?.remarks || '',
        shared_employees: extractSharedEmployeeIds(detail?.shared_employees),
      })

      if (detail?.parent) {
        const employees = await frappeCall({
          method: 'fusion_infotech.fusion_infotech.api.sprint_board.get_employees_in_sprint',
          args: {
            doctype: 'Employee',
            txt: '',
            searchfield: 'name',
            start: 0,
            page_len: 200,
            filters: { sprint_plan: detail.parent },
          },
        })

        const options = Array.isArray(employees)
          ? employees.map((emp) => {
              if (Array.isArray(emp)) {
                return { value: emp[0], label: emp[1] || emp[0] }
              }
              if (typeof emp === 'object' && emp) {
                return {
                  value: emp.name || emp.employee_id,
                  label: emp.employee_name || emp.name || emp.employee_id,
                }
              }
              return { value: emp, label: emp }
            })
          : []
        setSharedEmployeeOptions(options)
      }
    } catch (e) {
      setTaskModalError(e?.message || 'Failed to load task details')
    } finally {
      setTaskModalLoading(false)
    }
  }

  function closeTaskModal() {
    if (taskModalSaving) return
    setTaskModalOpen(false)
    setTaskModalError('')
    setTaskDetails(null)
    setSharedEmployeeQuery('')
    setSharedDropdownOpen(false)
  }

  function toggleSharedEmployee(empId) {
    setTaskForm((prev) => {
      const exists = prev.shared_employees.includes(empId)
      return {
        ...prev,
        shared_employees: exists ? prev.shared_employees.filter((id) => id !== empId) : [...prev.shared_employees, empId],
      }
    })
  }

  async function saveTaskModal() {
    if (!taskDetails?.name) return
    setTaskModalSaving(true)
    setTaskModalError('')

    try {
      await frappeCall({
        method: 'frappe.client.set_value',
        args: {
          doctype: 'Sprint Plan Details',
          name: taskDetails.name,
          fieldname: {
            estimated_start_date: taskForm.estimated_start_date || null,
            estimated_end_date: taskForm.estimated_end_date || null,
            remarks: taskForm.remarks || '',
          },
        },
      })

      await frappeCall({
        method: 'fusion_infotech.fusion_infotech.api.sprint_board.update_shared_employees',
        args: {
          task_detail_name: taskDetails.name,
          shared_employee_ids: taskForm.shared_employees || [],
        },
      })

      const selectedSharedEmployees = (taskForm.shared_employees || []).map((id) => {
        const found = sharedEmployeeOptions.find((opt) => opt.value === id)
        return {
          employee_id: id,
          employee_name: found?.label || id,
        }
      })

      patchTaskInBoard(taskDetails.name, {
        estimated_start_date: taskForm.estimated_start_date || null,
        estimated_end_date: taskForm.estimated_end_date || null,
        remarks: taskForm.remarks || '',
        shared_employees: selectedSharedEmployees,
      })

      pauseSyncUntilRef.current = Date.now() + 1200
      setTaskModalOpen(false)
    } catch (e) {
      setTaskModalError(e?.message || 'Failed to update task')
    } finally {
      setTaskModalSaving(false)
    }
  }

  function onDragEndTask(event) {
    const { active, over } = event
    if (!over) return
    const activeTaskName = String(active.id)
    const fromColumn = String(active.data.current?.column || '')
    const toColumn = String(over.id || '')
    if (!fromColumn || !toColumn || fromColumn === toColumn) return

    const fromTasks = dataByColumn[fromColumn] || []
    const toTasks = dataByColumn[toColumn] || []
    const moving = fromTasks.find((t) => t.name === activeTaskName)
    if (!moving) return

    const nextFrom = fromTasks.filter((t) => t.name !== activeTaskName)
    const nextTo = [{ ...moving, status: toColumn }, ...toTasks]

    pauseSyncUntilRef.current = Date.now() + 2500
    setDataByColumn((prev) => ({ ...prev, [fromColumn]: nextFrom, [toColumn]: nextTo }))
    onTaskMove({ taskName: activeTaskName, toStatus: toColumn })
  }

  function handleDragStart(event) {
    const payload = event.active.data.current
    if (payload?.task && payload?.column) {
      setDragOverlay({ task: payload.task, column: payload.column })
    }
  }

  function handleDragCancel() {
    setDragOverlay(null)
  }

  function handleDragEnd(event) {
    setDragOverlay(null)
    onDragEndTask(event)
  }

  const columnsForRender = orderedColumns.map((col) => {
    const tasks = dataByColumn[col] || []
    return {
      name: col,
      tasks: tasks.map((t) => ({
        ...t,
        _priorityColor: priorityColor(t.priority),
        _title: taskTitle(t),
      })),
    }
  })

  function handleClearFilters() {
    setSprintPlan('')
    setEmployeeId('')
    setProject('')
    loadBoard({ nextSprintPlan: null, nextEmployeeId: null, nextProject: null })
  }

  return (
    <div className="flex min-h-svh min-w-0 flex-col gap-2 p-4 md:gap-3 md:p-5">
      <SprintBoardHeader
        loading={loading}
        onRefresh={() =>
          loadBoard({
            nextSprintPlan: sprintPlan,
            nextEmployeeId: isSystemManager ? employeeId : currentUserEmployeeId,
            nextProject: project,
          })
        }
        onLogout={onLogout}
      />

      <BoardFilters
        sprintPlan={sprintPlan}
        onSprintPlanChange={setSprintPlan}
        employeeId={employeeId}
        currentUserEmployeeId={currentUserEmployeeId}
        isSystemManager={isSystemManager}
        onEmployeeChange={setEmployeeId}
        project={project}
        onProjectChange={setProject}
        filtersPending={filtersPending}
        loading={loading}
        onClear={handleClearFilters}
      />

      {error ? (
        <div className="mb-3 whitespace-pre-wrap break-words rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm leading-snug text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="min-h-0 flex-1 overflow-auto p-3 md:p-4">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading board…</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex min-w-fit items-start gap-3.5 pb-2">
              {columnsForRender.map((col) => (
                <BoardColumn key={col.name} column={col.name} tasks={col.tasks} onOpenTask={openTaskModal} />
              ))}
            </div>
            <DragOverlay dropAnimation={boardDropAnimation} zIndex={1000}>
              {dragOverlay ? <TaskCardSurface task={dragOverlay.task} column={dragOverlay.column} variant="overlay" /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </Card>

      <TaskDetailModal
        open={taskModalOpen}
        taskModalLoading={taskModalLoading}
        taskModalSaving={taskModalSaving}
        taskModalError={taskModalError}
        taskDetails={taskDetails}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        sharedEmployeeOptions={sharedEmployeeOptions}
        sharedEmployeeQuery={sharedEmployeeQuery}
        setSharedEmployeeQuery={setSharedEmployeeQuery}
        sharedDropdownOpen={sharedDropdownOpen}
        setSharedDropdownOpen={setSharedDropdownOpen}
        sharedFieldRef={sharedFieldRef}
        onClose={closeTaskModal}
        onSave={saveTaskModal}
        toggleSharedEmployee={toggleSharedEmployee}
      />
    </div>
  )
}
