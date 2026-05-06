import { useDroppable } from '@dnd-kit/core'
import { memo } from 'react'
import BoardCard from './BoardCard.jsx'
import Card from './Card.jsx'

function BoardColumn({ column, tasks, onOpenTask }) {
  const { isOver, setNodeRef } = useDroppable({ id: column })

  return (
    <Card className="min-w-[300px] border-slate-200 bg-slate-100 p-3 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-sm font-bold text-slate-900">{column}</div>
        <div className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-900">{tasks?.length || 0}</div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[120px] max-h-[calc(100svh-260px)] overflow-auto rounded-lg pr-1 transition-[background-color,outline,box-shadow] duration-200 ease-out ${
          isOver
            ? 'bg-blue-50/95 shadow-[inset_0_0_0_2px_rgba(37,99,235,0.45)] outline outline-2 outline-offset-0 outline-blue-500 ring-2 ring-blue-400/30'
            : ''
        }`}
      >
        {tasks && tasks.length ? (
          tasks.map((t) => <BoardCard key={t.name} task={t} column={column} onOpenTask={onOpenTask} />)
        ) : (
          <div className="px-2.5 py-3.5 text-center text-xs text-slate-500">No tasks</div>
        )}
      </div>
    </Card>
  )
}

export default memo(BoardColumn)
