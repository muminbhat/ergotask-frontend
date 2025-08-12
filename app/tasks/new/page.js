"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create');
      toast.success('Task created');
      router.replace(`/tasks/${data.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 stagger-container">
      <h1 className="text-2xl font-semibold mb-4">New Task</h1>
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <button 
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
