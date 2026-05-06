export default function SprintBoardHeader({ loading, onRefresh, onLogout }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-lg font-bold">Sprint Board</div>
      <div className="flex gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
