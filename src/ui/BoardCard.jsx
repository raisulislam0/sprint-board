import { useDraggable } from '@dnd-kit/core'
import { memo } from 'react'
import TaskCardSurface from './TaskCardSurface.jsx'

function BoardCard({ task, column, onOpenTask }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.name,
    data: {
      column,
      task,
    },
  })

  const dragHandleProps = { ...listeners, ...attributes }

  return (
    <div ref={setNodeRef}>
      <TaskCardSurface
        task={task}
        column={column}
        onOpenTask={onOpenTask}
        variant={isDragging ? 'dragging-placeholder' : 'default'}
        dragHandleProps={dragHandleProps}
        dragAriaGrabbed={isDragging}
      />
    </div>
  )
}

export default memo(BoardCard)
