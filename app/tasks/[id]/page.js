'use client'

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';

function toLocalInputValue(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (m) {
    const [, yyyy, mm, dd, hh, mi] = m;
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return '';
  }
}

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toArrayCategories(cats) {
  if (Array.isArray(cats)) return cats;
  if (cats == null) return [];
  return String(cats)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id;
  const [task, setTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allContexts, setAllContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState(null);
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState(null); // Date object
  const [dueHour, setDueHour] = useState('09');
  const [dueMinute, setDueMinute] = useState('00');
  const [contextIds, setContextIds] = useState([]);

  const categoryIndex = useMemo(() => {
    const idx = new Map();
    for (const c of categories) idx.set(normalizeName(c.name), c.id);
    return idx;
  }, [categories]);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, cRes, ctxRes] = await Promise.all([
          fetch(`/api/tasks/${id}`),
          fetch(`/api/categories`),
          fetch(`/api/contexts`),
        ]);
        const tData = await tRes.json();
        if (!tRes.ok) throw new Error(tData?.error || 'Failed to load task');
        const cData = await cRes.json();
        const ctxData = await ctxRes.json();
        setTask(tData);
        setCategories(Array.isArray(cData) ? cData : (cData.results || []));
        setAllContexts(Array.isArray(ctxData) ? ctxData : (ctxData.results || []));
        setCategoryId(tData.category || '');
        // initialize date
        if (tData.due_date) {
          const d = new Date(tData.due_date);
          if (!isNaN(d.getTime())) {
            setDueDate(d);
            setDueHour(String(d.getHours()).padStart(2, '0'));
            setDueMinute(String(d.getMinutes()).padStart(2, '0'));
          }
        }
        setContextIds((tData.contexts || []).map(String));
      } catch (err) {
        toast.error(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getAISuggestions = async () => {
    setAiLoading(true);
    setAi(null);
    try {
      const res = await fetch(`/api/tasks/${id}/ai-suggestions`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI failed');
      setAi(data);
      setOpen(true);
    } catch (err) {
      toast.error(err.message || 'AI failed');
    } finally {
      setAiLoading(false);
    }
  };

  const applyServerSideAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}/ai-apply`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI apply failed');
      setTask(data);
      setCategoryId(data.category || '');
      if (data.due_date) {
        const d = new Date(data.due_date);
        if (!isNaN(d.getTime())) {
          setDueDate(d);
          setDueHour(String(d.getHours()).padStart(2, '0'));
          setDueMinute(String(d.getMinutes()).padStart(2, '0'));
        }
      }
      setContextIds((data.contexts || []).map(String));
      toast.success('AI suggestions applied');
    } catch (err) {
      toast.error(err.message || 'AI apply failed');
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!ai || !task) return;
    const updated = { ...task, description: ai.enhanced_description || task.description };

    const suggested = toArrayCategories(ai.categories);
    let matchedId = '';
    for (const s of suggested) {
      const norm = normalizeName(s);
      if (categoryIndex.has(norm)) { matchedId = categoryIndex.get(norm); break; }
      for (const c of categories) {
        const cn = normalizeName(c.name);
        if (cn.includes(norm) || norm.includes(cn)) { matchedId = c.id; break; }
      }
      if (matchedId) break;
    }
    if (matchedId) {
      setCategoryId(matchedId);
      if (suggested.length > 1) toast.message('Multiple categories suggested', { description: 'Applied the first available match.' });
    } else if (suggested.length) {
      toast.message('No matching category found', { description: `Suggested: ${suggested.join(', ')}` });
    }

    if (ai.suggested_deadline) {
      const d = new Date(ai.suggested_deadline);
      if (!isNaN(d.getTime())) {
        setDueDate(d);
        setDueHour(String(d.getHours()).padStart(2, '0'));
        setDueMinute(String(d.getMinutes()).padStart(2, '0'));
      }
    }

    setTask(updated);
    setOpen(false);
  };

  const getSchedule = async () => {
    setAiLoading(true);
    setSchedule(null);
    try {
      const res = await fetch(`/api/tasks/${id}/schedule-suggestions`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Schedule failed');
      setSchedule(data);
      setOpenSchedule(true);
    } catch (err) {
      toast.error(err.message || 'Schedule failed');
    } finally {
      setAiLoading(false);
    }
  };

  function toICS(schedule, task) {
    const lines = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//SmartTodo//EN');
    const title = (task?.title || 'Task');
    const desc = (task?.description || '');
    (schedule?.blocks || []).forEach((b, i) => {
      const uid = `${id}-${i}@smarttodo`;
      const dtStart = new Date(b.start);
      const dtEnd = new Date(b.end);
      const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${fmt(new Date())}`);
      lines.push(`DTSTART:${fmt(dtStart)}`);
      lines.push(`DTEND:${fmt(dtEnd)}`);
      lines.push(`SUMMARY:${b.label || title}`);
      if (desc) lines.push(`DESCRIPTION:${desc.replace(/\n/g, '\\n')}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function googleCalendarLink(b, task) {
    const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const base = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent((task?.title || b.label || 'Task'));
    const details = encodeURIComponent(task?.description || '');
    const dates = `${fmt(b.start)}/${fmt(b.end)}`;
    return `${base}&text=${text}&details=${details}&dates=${dates}`;
  }

  const save = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const payload = {
        title: task.title,
        description: task.description,
        category: categoryId || null,
        contexts: contextIds,
      };
      if (dueDate) {
        const d = new Date(dueDate);
        d.setHours(Number(dueHour), Number(dueMinute), 0, 0);
        payload.due_date = d.toISOString();
      } else {
        payload.due_date = null;
      }

      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      setTask(data);
      setCategoryId(data.category || '');
      if (data.due_date) {
        const d = new Date(data.due_date);
        setDueDate(d);
        setDueHour(String(d.getHours()).padStart(2, '0'));
        setDueMinute(String(d.getMinutes()).padStart(2, '0'));
      } else {
        setDueDate(null);
      }
      setContextIds((data.contexts || []).map(String));
      toast.success('Task saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10">Loading...</div>;
  if (!task) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4 stagger-container">
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <Input value={task.title || ''} onChange={e => setTask({ ...task, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <Textarea rows={6} value={task.description || ''} onChange={e => setTask({ ...task, description: e.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <Select value={categoryId || ''} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
                {categories.length === 0 && <div className="p-2 text-sm text-foreground/60">No categories</div>}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">Due date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="w-full text-left px-3 py-2 rounded-md bg-card border border-border">
                  {dueDate ? new Date(dueDate).toLocaleDateString() : 'Pick a date'} {dueDate && `• ${dueHour}:${dueMinute}`}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-card/90 backdrop-blur border border-border">
                <div className="grid gap-3">
                  <Calendar
                    mode="single"
                    selected={dueDate || undefined}
                    onSelect={(d) => setDueDate(d || null)}
                  />
                  <div className="flex items-center gap-2">
                    <Input type="number" min="0" max="23" value={dueHour} onChange={(e) => setDueHour(String(Math.max(0, Math.min(23, Number(e.target.value) || 0)).toString().padStart(2, '0')))} className="w-20 bg-input text-foreground border-border" />
                    <span className="text-foreground">:</span>
                    <Input type="number" min="0" max="59" value={dueMinute} onChange={(e) => setDueMinute(String(Math.max(0, Math.min(59, Number(e.target.value) || 0)).toString().padStart(2, '0')))} className="w-20 bg-input text-foreground border-border" />
                    <button 
                      type="button" 
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm" 
                      onClick={() => toast.message('Time set')}
                    >
                      Set
                    </button>
                    <button 
                      type="button" 
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm" 
                      onClick={() => { setDueDate(null); }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Contexts</label>
          <div className="card p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {allContexts.map((c) => {
                const selected = contextIds.includes(String(c.id));
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContextIds((prev) => selected ? prev.filter((x) => x !== String(c.id)) : [...prev, String(c.id)])}
                    className={`px-3 py-1 rounded-md border ${selected ? 'border-cyan-500 text-cyan-700 dark:text-cyan-300' : 'border-border text-foreground/70'}`}
                    title={c.keywords?.join(', ') || ''}
                  >
                    {c.source_type}: {c.content.slice(0, 24)}{c.content.length > 24 ? '…' : ''}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-foreground/60">Tap to select/deselect. Selected: {contextIds.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary: Apply & Save */}
          <button 
            onClick={applyServerSideAI} 
            disabled={aiLoading} 
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Apply AI suggestions to this task and save"
          >
            {aiLoading ? 'Applying…' : 'Apply & Save'}
          </button>

          {/* Secondary actions */}
          <button 
            onClick={getAISuggestions} 
            disabled={aiLoading} 
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300 hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview AI-proposed description, deadline, and categories (no changes saved)"
          >
            {aiLoading ? 'AI…' : 'Preview AI'}
          </button>

          <button 
            onClick={getSchedule} 
            disabled={aiLoading} 
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI-suggested time blocks; add to Google Calendar or download .ics"
          >
            {aiLoading ? 'Planning…' : 'Schedule'}
          </button>

          <button
            onClick={async () => {
              try {
                const res = await fetch(`/api/tasks/${id}/link-contexts-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 5 }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Linking failed');
                toast.success(`Linked ${data.linked?.length || 0} contexts`);
              } catch (e) {
                toast.error(e.message || 'Linking failed');
              }
            }}
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Automatically attach relevant contexts to this task"
          >
            Auto-link Contexts
          </button>

          {/* Secondary: plain save */}
          <button 
            onClick={save} 
            disabled={saving || aiLoading} 
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save changes to this task"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-foreground/10 mx-1" />

          {/* Destructive */}
          <button
            onClick={() => setOpenDelete(true)}
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-700 dark:text-red-300 hover:from-red-500/30 hover:to-rose-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete this task"
          >
            Delete
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="backdrop-blur bg-card/90 border border-border">
          <DialogHeader>
            <DialogTitle>AI Suggestions</DialogTitle>
          </DialogHeader>
          {!ai ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">Priority: {ai.priority_score?.toFixed?.(2)}</div>
              <div className="text-sm">Suggested deadline: {ai.suggested_deadline || '—'}</div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">Enhanced description</div>
                <div className="text-foreground whitespace-pre-wrap">{ai.enhanced_description}</div>
              </div>
              {!!toArrayCategories(ai.categories).length && (
                <div className="text-sm">Categories: {toArrayCategories(ai.categories).join(', ')}</div>
              )}
              {ai.reasoning && (
                <div className="text-sm text-foreground/60">Reasoning: {ai.reasoning}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={applySuggestion} 
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300 hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 backdrop-blur-sm font-medium"
                >
                  Apply
                </button>
                <button 
                  onClick={() => setOpen(false)} 
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
        <DialogContent className="backdrop-blur bg-card/90 border border-border">
          <DialogHeader>
            <DialogTitle>Schedule Suggestions</DialogTitle>
          </DialogHeader>
          {!schedule ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {schedule.blocks?.length ? (
                <div className="space-y-2">
                  {schedule.blocks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <div className="text-sm font-medium">{b.label || 'Work block'}</div>
                        <div className="text-xs text-foreground/60">{new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={googleCalendarLink(b, task)} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 dark:text-cyan-400 hover:opacity-80">Add to Google</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-foreground/60">No blocks provided.</div>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const ics = toICS(schedule, task);
                    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `task-${id}-schedule.ics`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }} 
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm"
                >
                  Download .ics
                </button>
                <button 
                  onClick={() => setOpenSchedule(false)} 
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="backdrop-blur bg-card/90 border border-border">
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/70">
            <p>This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
                    if (res.ok) {
                      toast.success('Task deleted')
                      window.location.href = '/tasks'
                    } else {
                      const data = await res.json().catch(() => ({}))
                      throw new Error(data?.detail || 'Delete failed')
                    }
                  } catch (e) {
                    toast.error(e.message || 'Delete failed')
                  } finally {
                    setOpenDelete(false)
                  }
                }}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-700 dark:text-red-300 hover:from-red-500/30 hover:to-rose-500/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm"
              >
                Delete
              </button>
              <button onClick={() => setOpenDelete(false)} className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-700 dark:text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm">
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
