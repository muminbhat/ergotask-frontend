'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';
import { Plus, MessageSquare, Mail, FileText, Hash, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sourceTypeIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  note: FileText,
  other: Hash,
};

const sourceTypeColors = {
  whatsapp: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
  email: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  note: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  other: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30',
};

const pageInt = (str, fallback) => {
  const parsed = parseInt(str);
  return isNaN(parsed) ? fallback : parsed;
};

async function fetchContexts(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });
  
  const res = await fetch(`/api/contexts?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ContextsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentFilter, setContentFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState(searchParams.get('source_type') || '');
  const page = pageInt(searchParams.get('page'), 1);
  const page_size = pageInt(searchParams.get('page_size'), 10);

  useEffect(() => {
    (async () => {
      try {
        const params = {}
        if (sourceTypeFilter) params.source_type = sourceTypeFilter
        if (page > 1) params.page = page
        if (page_size !== 10) params.page_size = page_size
        
        const data = await fetchContexts(params);
        const items = Array.isArray(data) ? data : (data.results || []);
        
        // Filter by content if needed
        let filteredItems = items;
        if (contentFilter) {
          filteredItems = items.filter(item => 
            item.content.toLowerCase().includes(contentFilter.toLowerCase())
          );
        }
        
        setContexts(filteredItems);
      } catch (err) {
        toast.error('Failed to load contexts');
      } finally {
        setLoading(false);
      }
    })();
  }, [sourceTypeFilter, contentFilter, page, page_size]);

  const handleContentFilterChange = (e) => {
    setContentFilter(e.target.value);
  };

  const handleSourceTypeFilterChange = (newFilter) => {
    setSourceTypeFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter) {
      params.set('source_type', newFilter);
    } else {
      params.delete('source_type');
    }
    params.delete('page'); // Reset to first page when filtering
    const qs = params.toString();
    router.push(`/contexts${qs ? `?${qs}` : ''}`);
  };

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground/60">Loading contexts...</div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-neutral-500 bg-clip-text text-transparent">
          Contexts
        </h1>
        <Link 
          href="/contexts/new" 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 backdrop-blur-sm"
        >
          <Plus className="w-4 h-4" />
          New Context
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Filter by content..."
              value={contentFilter}
              onChange={handleContentFilterChange}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <Select value={sourceTypeFilter} onValueChange={handleSourceTypeFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contexts?.length ? contexts.map((c) => {
          const IconComponent = sourceTypeIcons[c.source_type] || Hash;
          return (
            <div key={c.id} className="p-4 rounded-lg border border-border bg-card backdrop-blur-sm hover:bg-foreground/5 transition-all duration-300 hover:border-border hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${sourceTypeColors[c.source_type]}`}>
                  <IconComponent className="w-3 h-3" />
                  {c.source_type}
                </div>
                {c.sentiment_score !== null && (
                  <div className="flex items-center gap-1 text-xs text-foreground/60">
                    <TrendingUp className="w-3 h-3" />
                    {c.sentiment_score.toFixed(2)}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-foreground/80 mb-3 line-clamp-3">
                {c.content}
              </p>

              {c.keywords && c.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.keywords.slice(0, 3).map((keyword, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-foreground/5 text-foreground/70 border border-border">
                      {keyword}
                    </span>
                  ))}
                  {c.keywords.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-foreground/5 text-foreground/60 border border-border">
                      +{c.keywords.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-foreground/60">
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-12">
            <div className="text-foreground/60 mb-4">No contexts found</div>
            <Link 
              href="/contexts/new" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4" />
              Add your first context
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
