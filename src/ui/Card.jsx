import { forwardRef } from 'react'

const Card = forwardRef(function Card({ className = '', style, onClick, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
})

export default Card
