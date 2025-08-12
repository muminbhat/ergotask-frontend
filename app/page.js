'use client'

import Link from "next/link";
import { Plus, Target, Zap, BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp, Activity, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    contexts: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, contextsRes] = await Promise.all([
          fetch('/api/tasks?page_size=100'),
          fetch('/api/contexts?page_size=100')
        ]);
        
        const tasksData = await tasksRes.json();
        const contextsData = await contextsRes.json();
        
        const tasks = Array.isArray(tasksData) ? tasksData : (tasksData.results || []);
        const contexts = Array.isArray(contextsData) ? contextsData : (contextsData.results || []);
        
        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => ['todo', 'in_progress'].includes(t.status)).length;
        
        // Get recent activity (last 5 tasks and contexts)
        const recentTasks = tasks.slice(0, 3).map(t => ({
          type: 'task',
          title: t.title,
          status: t.status,
          date: t.updated_at,
          id: t.id
        }));
        
        const recentContexts = contexts.slice(0, 2).map(c => ({
          type: 'context',
          title: `${c.source_type}: ${c.content.slice(0, 30)}...`,
          sourceType: c.source_type,
          date: c.created_at,
          id: c.id
        }));
        
        const recentActivity = [...recentTasks, ...recentContexts]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        
        setStats({
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: pending,
          contexts: contexts.length,
          recentActivity
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'todo': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'text-green-600 dark:text-green-400';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400';
      case 'todo': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 stagger-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-neutral-500 bg-clip-text text-transparent mb-4">
          Welcome to ErgoTask AI
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
          Your AI-powered task management system with intelligent prioritization and context-aware suggestions.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30">
              <Target className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : stats.totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Completed</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : stats.completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/15 border border-yellow-500/30">
              <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Pending</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30">
              <Zap className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">Contexts</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : stats.contexts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link href="/tasks" className="group">
          <div className="card p-6 hover:bg-foreground/5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <Target className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:opacity-90 transition-colors">Task Board</h2>
            </div>
            <p className="text-foreground/70 mb-4">
              Manage your tasks with our modern Kanban board. Drag and drop to change status, view AI suggestions, and track progress.
            </p>
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <Plus className="w-4 h-4" />
              View Tasks
            </div>
          </div>
        </Link>

        <Link href="/contexts" className="group">
          <div className="card p-6 hover:bg-foreground/5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:opacity-90 transition-colors">Contexts</h2>
            </div>
            <p className="text-foreground/70 mb-4">
              Add daily context from messages, emails, and notes. Our AI analyzes this data to provide intelligent task suggestions.
            </p>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
              <Plus className="w-4 h-4" />
              Manage Contexts
            </div>
          </div>
        </Link>

        <div className="card p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/30">
              <BarChart3 className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">AI Features</h2>
          </div>
          <p className="text-foreground/70 mb-4">
            Intelligent task prioritization, deadline suggestions, and context-aware recommendations powered by advanced AI.
          </p>
          {/* <div className="space-y-2 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Smart Priority Scoring
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Deadline Suggestions
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              Context Analysis
            </div>
          </div> */}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse"></div>
                    <div className="flex-1 h-4 bg-foreground/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors">
                  {activity.type === 'task' ? (
                    getStatusIcon(activity.status)
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30"></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.type === 'task' && (
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activity.status)} bg-foreground/5`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground/60">No recent activity</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link href="/tasks/new" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <Plus className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Create New Task</p>
                <p className="text-xs text-foreground/60">Add a new task to your board</p>
              </div>
            </Link>
            
            <Link href="/contexts/new" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
              <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30">
                <Zap className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Add Context</p>
                <p className="text-xs text-foreground/60">Share context for better AI suggestions</p>
              </div>
            </Link>
            
            <Link href="/tasks" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
              <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/30">
                <BarChart3 className="w-4 h-4 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">View Analytics</p>
                <p className="text-xs text-foreground/60">Check your productivity insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          System Ready
        </div>
      </div>
    </div>
  );
}
