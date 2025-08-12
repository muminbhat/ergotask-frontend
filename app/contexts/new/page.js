'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewContextPage() {
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('note');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, source_type: sourceType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create');
      toast.success('Context added');
      router.replace('/contexts');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 stagger-container">
      <h1 className="text-2xl font-semibold mb-4">New Context</h1>
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Content</label>
          <Textarea rows={6} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Source Type</label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-foreground/60">After saving, processing runs in background. Refresh the list to see keywords and sentiment.</p>
        <button 
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
