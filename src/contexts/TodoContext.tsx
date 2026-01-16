import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TodoItem } from '../models/todo';

interface TodoContextType {
  todoItems: TodoItem[];
  activeTaskId: string | null;
  isPaused: boolean;
  addTodo: (item: TodoItem) => void;
  removeTodo: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  toggleComplete: (id: string) => void;
  completeTask: (id: string) => void;
  getFormattedTime: (timeInSeconds: number) => string;
  activeTaskTime: number; // Current accumulated time for active task (including current session)
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTaskTime, setActiveTaskTime] = useState<number>(0);

  // Load from storage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('todo_items');
    const storedActiveId = localStorage.getItem('todo_active_task');
    const storedIsPaused = localStorage.getItem('todo_is_paused');

    if (storedTodos) {
      const parsedTodos = JSON.parse(storedTodos, (key, value) => {
        if (key === 'completedAt' || key === 'lastStartedAt') {
          return value ? new Date(value) : undefined;
        }
        return value;
      });
      setTodoItems(parsedTodos);
    }
    
    if (storedActiveId) setActiveTaskId(storedActiveId);
    if (storedIsPaused) setIsPaused(storedIsPaused === 'true');
  }, []);

  // Save to storage on change
  useEffect(() => {
    localStorage.setItem('todo_items', JSON.stringify(todoItems));
    if (activeTaskId) {
      localStorage.setItem('todo_active_task', activeTaskId);
    } else {
      localStorage.removeItem('todo_active_task');
    }
    localStorage.setItem('todo_is_paused', String(isPaused));
  }, [todoItems, activeTaskId, isPaused]);

  // Update active task time every second
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (activeTaskId && !isPaused) {
      // Update immediately
      updateActiveTaskTime();
      
      interval = setInterval(() => {
        updateActiveTaskTime();
      }, 1000);
    } else if (activeTaskId && isPaused) {
      // Just show stored time
      updateActiveTaskTime();
    } else {
      setActiveTaskTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTaskId, isPaused, todoItems]);

  const updateActiveTaskTime = () => {
    if (!activeTaskId) return;
    
    const item = todoItems.find(i => i.id === activeTaskId);
    if (!item) return;

    let time = item.timeSpent || 0;
    
    if (!isPaused && item.lastStartedAt) {
      const sessionDuration = Math.floor((new Date().getTime() - new Date(item.lastStartedAt).getTime()) / 1000);
      time += sessionDuration;
    }
    
    setActiveTaskTime(time);
  };

  const addTodo = (item: TodoItem) => {
    setTodoItems(prev => [...prev, item]);
  };

  const removeTodo = (id: string) => {
    if (activeTaskId === id) {
        setActiveTaskId(null);
        setIsPaused(false);
    }
    setTodoItems(prev => prev.filter(i => i.id !== id));
  };

  const startTimer = (id: string) => {
    // If another task is active, pause it first
    if (activeTaskId && activeTaskId !== id) {
      pauseTimerLogic(activeTaskId);
    }

    const now = new Date();
    
    setTodoItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, lastStartedAt: now };
      }
      return item;
    }));
    
    setActiveTaskId(id);
    setIsPaused(false);
  };

  const pauseTimerLogic = (id: string) => {
    setTodoItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item || !item.lastStartedAt) return prev;

      const sessionDuration = Math.floor((new Date().getTime() - new Date(item.lastStartedAt).getTime()) / 1000);
      const newTimeSpent = (item.timeSpent || 0) + sessionDuration;

      return prev.map(i => {
        if (i.id === id) {
          return { ...i, timeSpent: newTimeSpent, lastStartedAt: undefined };
        }
        return i;
      });
    });
  };

  const pauseTimer = () => {
    if (activeTaskId) {
      pauseTimerLogic(activeTaskId);
      setIsPaused(true);
    }
  };

  const resumeTimer = () => {
    if (activeTaskId) {
      startTimer(activeTaskId);
    }
  };

  const toggleComplete = (id: string) => {
    setTodoItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;

      if (!item.isCompleted) {
        // Completing
        if (activeTaskId === id) {
          pauseTimerLogic(id);
          setActiveTaskId(null);
          setIsPaused(false);
        }
        return prev.map(i => 
          i.id === id ? { ...i, isCompleted: true, completedAt: new Date() } : i
        ).sort((a, b) => {
            if (a.isCompleted === b.isCompleted) {
                if (a.isCompleted && a.completedAt && b.completedAt) {
                    return b.completedAt.getTime() - a.completedAt.getTime();
                }
                return 0;
            }
            return a.isCompleted ? 1 : -1;
        });
      } else {
        // Uncompleting
        return prev.map(i => 
          i.id === id ? { ...i, isCompleted: false, completedAt: undefined } : i
        ).sort((a, b) => {
            if (a.isCompleted === b.isCompleted) {
                if (a.isCompleted && a.completedAt && b.completedAt) {
                    return b.completedAt.getTime() - a.completedAt.getTime();
                }
                return 0;
            }
            return a.isCompleted ? 1 : -1;
        });
      }
    });
  };

  const completeTask = (id: string) => {
    // If it's the active task, update time one last time
    if (activeTaskId === id) {
        pauseTimerLogic(id); // Consolidate time
        setActiveTaskId(null);
        setIsPaused(false);
    }

    setTodoItems(prev => {
        const updated = prev.map(item => {
            if (item.id === id) {
                return { 
                    ...item, 
                    isCompleted: true, 
                    completedAt: new Date() 
                };
            }
            return item;
        });
        
        // Sort: incomplete first, then completed by date (newest first)
        return updated.sort((a, b) => {
            if (a.isCompleted === b.isCompleted) {
                if (a.isCompleted && a.completedAt && b.completedAt) {
                    return b.completedAt.getTime() - a.completedAt.getTime();
                }
                return 0;
            }
            return a.isCompleted ? 1 : -1;
        });
    });
  };

  const getFormattedTime = (seconds: number) => {
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h${m}m`;
    }
  };

  const value = {
    todoItems,
    activeTaskId,
    isPaused,
    addTodo,
    removeTodo,
    startTimer,
    pauseTimer,
    resumeTimer,
    toggleComplete,
    completeTask,
    getFormattedTime,
    activeTaskTime
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};
