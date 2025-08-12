"use client"

import confetti from 'canvas-confetti'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from '@/components/ui/sonner'
import { Plus, Calendar, Tag, TrendingUp, Archive, Clock, GripVertical, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'in_progress', title: 'In Progress', color: 'border-yellow-500/30 bg-yellow-500/5' },
  { id: 'done', title: 'Done', color: 'border-green-500/30 bg-green-500/5' },
  { id: 'archived', title: 'Archived', color: 'border-gray-500/30 bg-gray-500/5' },
]

const priorityColors = {
  high: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  low: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
}

const getPriorityColor = (score) => {
  if (score >= 0.7) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

const getPriorityLabel = (score) => {
  if (score >= 0.7) return 'High'
  if (score >= 0.4) return 'Medium'
  return 'Low'
}

function fireConfetti() {
  try {
    const count = 120
    const defaults = { origin: { y: 0.6 } }
    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }
    fire(0.25, { spread: 26, startVelocity: 45 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  } catch {}
}

// Sortable Task Card Component
function SortableTaskCard({ task, columnId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${columnId}:${task.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <div className="p-4 rounded-lg border border-border bg-card backdrop-blur-sm hover:bg-foreground/5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-blue-500/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Drag"
              className="p-1 rounded hover:bg-foreground/5 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-foreground/60" />
            </button>
            <h3 className="font-medium text-foreground group-hover:text-foreground">
              {task.title}
            </h3>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full border ${priorityColors[getPriorityColor(task.priority_score)]}`}>
            {getPriorityLabel(task.priority_score)}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {task.category_detail && (
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              <Tag className="w-3 h-3" />
              {task.category_detail.name}
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-foreground/60">
            <TrendingUp className="w-3 h-3" />
            {(task.priority_score ?? 0).toFixed(2)}
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`/tasks/${task.id}`} 
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:opacity-80 transition"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Drop Zone Component using useDroppable
function DropZone({ columnId, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-2 rounded-lg transition-colors ${
        isOver ? 'bg-foreground/10 border-2 border-dashed border-blue-400/50' : ''
      }`}
    >
      {children}
    </div>
  )
}

export default function TasksPage() {
  const [tasksByCol, setTasksByCol] = useState({ todo: [], in_progress: [], done: [], archived: [] })
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [categories, setCategories] = useState([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [minPriority, setMinPriority] = useState(0)
  const [search, setSearch] = useState('')
  const [openNL, setOpenNL] = useState(false)
  const [nlText, setNlText] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const params = new URLSearchParams()
        params.set('ordering', '-priority_score')
        params.set('page_size', '100')
        if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory)
        if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus)
        if (search.trim()) params.set('search', search.trim())
        const [tasksRes, catsRes] = await Promise.all([
          fetch(`/api/tasks?${params.toString()}`),
          fetch('/api/categories'),
        ])
        const data = await tasksRes.json()
        const catData = await catsRes.json()
        const items = (Array.isArray(data) ? data : (data.results || []))
          .filter((t) => (t.priority_score ?? 0) >= Number(minPriority || 0))
        setCategories(Array.isArray(catData) ? catData : (catData.results || []))
        const grouped = { todo: [], in_progress: [], done: [], archived: [] }
        for (const t of items) {
          const key = ['todo', 'in_progress', 'done', 'archived'].includes(t.status) ? t.status : 'todo'
          if (grouped[key]) grouped[key].push(t)
        }
        setTasksByCol(grouped)
      } catch (e) {
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    })()
  }, [filterCategory, filterStatus, minPriority, search])

  const handleDragStart = (event) => {
    const { active } = event
    const [columnId, taskId] = String(active.id).split(':')
    const task = tasksByCol[columnId]?.find(t => t.id === taskId)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    
    if (!over) return
    
    const [fromCol, taskId] = String(active.id).split(':')
    const overId = String(over.id)
    const toCol = overId.includes(':') ? overId.split(':')[0] : overId
    
    if (!fromCol || !taskId || !toCol || fromCol === toCol) return

    setTasksByCol((prev) => {
      const fromList = [...(prev[fromCol] || [])]
      const toList = [...(prev[toCol] || [])]
      const idx = fromList.findIndex((t) => t.id === taskId)
      if (idx === -1) return prev
      const task = { ...fromList.splice(idx, 1)[0] }
      toList.push(task)
      return { ...prev, [fromCol]: fromList, [toCol]: toList }
    })

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: toCol })
      })
      if (!res.ok) throw new Error()
      if (toCol === 'done') {
        fireConfetti()
      }
      toast.success(`Task moved to ${columns.find(col => col.id === toCol)?.title}`)
    } catch {
      setTasksByCol((prev) => {
        const toList = [...(prev[toCol] || [])]
        const fromList = [...(prev[fromCol] || [])]
        const idx = toList.findIndex((t) => t.id === taskId)
        if (idx === -1) return prev
        const task = { ...toList.splice(idx, 1)[0] }
        fromList.push(task)
        return { ...prev, [toCol]: toList, [fromCol]: fromList }
      })
      toast.error('Failed to update task status')
    }
  }

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground/70">Loading tasks...</div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-neutral-500 bg-clip-text text-transparent">Task Board</h1>
        <div className="flex gap-2">
          <button onClick={() => setOpenNL(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 backdrop-blur-sm">
            <Plus className="w-4 h-4" />
            Create from Text
          </button>
          <Link href="/tasks/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm">
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/60" />
            <Input placeholder="Search title/description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/70 min-w-16">Min priority</span>
            <input type="range" min={0} max={1} step={0.05} value={minPriority} onChange={(e) => setMinPriority(e.target.value)} className="w-full" />
            <span className="text-sm text-foreground/70 w-10 text-right">{Number(minPriority).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Dialog open={openNL} onOpenChange={setOpenNL}>
        <DialogContent className="backdrop-blur bg-card/90 border border-border">
          <DialogHeader>
            <DialogTitle>Create tasks from text</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <textarea value={nlText} onChange={(e) => setNlText(e.target.value)} rows={6} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground" placeholder="Paste notes, email, or free text..." />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/tasks/nl-create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: nlText }) })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data?.detail || 'Failed')
                    toast.success(`Created ${data.count || 0} tasks`)
                    setOpenNL(false)
                    setNlText('')
                  } catch (e) {
                    toast.error(e.message || 'Failed')
                  }
                }}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300 hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm"
              >
                Generate & Create
              </button>
              <button onClick={() => setOpenNL(false)} className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm">Close</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DndContext 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
          {columns.map((col) => (
            <div key={col.id} className={`rounded-xl border ${col.color} backdrop-blur-sm p-4 min-h-[600px]`}>
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-lg text-foreground">{col.title}</div>
                <div className="text-sm text-foreground/70 bg-foreground/10 px-2 py-1 rounded-full">
                  {tasksByCol[col.id]?.length || 0}
                </div>
              </div>
              
              <DropZone columnId={col.id}>
                <SortableContext 
                  items={(tasksByCol[col.id] || []).map(task => `${col.id}:${task.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(tasksByCol[col.id] || []).map((task) => (
                      <SortableTaskCard key={task.id} task={task} columnId={col.id} />
                    ))}
                  </div>
                </SortableContext>
              </DropZone>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-4 rounded-lg border border-border bg-card backdrop-blur-sm shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-foreground">
                  {activeTask.title}
                </h3>
                <div className={`text-xs px-2 py-1 rounded-full border ${priorityColors[getPriorityColor(activeTask.priority_score)]}`}>
                  {getPriorityLabel(activeTask.priority_score)}
                </div>
              </div>
              
              {activeTask.description && (
                <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                  {activeTask.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

