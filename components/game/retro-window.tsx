import type { ReactNode } from "react"

interface RetroWindowProps {
  title: string
  children: ReactNode
  className?: string
  icon?: ReactNode
  badge?: ReactNode
}

export function RetroWindow({ title, children, className = "", icon, badge }: RetroWindowProps) {
  return (
    <div className={`retro-window ${className}`}>
      {/* Title bar with window controls */}
      <div className="retro-title-bar">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary-foreground">{icon}</span>}
          <span className="text-primary-foreground font-bold text-lg tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && <span>{badge}</span>}
          <div className="retro-window-controls">
            <div className="retro-window-btn">-</div>
            <div className="retro-window-btn">O</div>
            <div className="retro-window-btn">X</div>
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="p-3">{children}</div>
    </div>
  )
}
