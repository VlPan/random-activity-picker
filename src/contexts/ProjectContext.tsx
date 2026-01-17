import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, ProjectTask } from '../models/project';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'> & { tasks: Omit<ProjectTask, 'id' | 'isCompleted'>[] }) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id' | 'isCompleted'>) => void;
  updateTask: (projectId: string, task: ProjectTask) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  completeTask: (projectId: string, taskId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem('userProjects');
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (e) {
        console.error('Failed to parse projects', e);
      }
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('userProjects', JSON.stringify(newProjects));
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'tasks'> & { tasks: Omit<ProjectTask, 'id' | 'isCompleted'>[] }) => {
    const newProject: Project = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: projectData.name,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      status: projectData.status || 'unset',
      comments: projectData.comments || [],
      tasks: projectData.tasks.map(t => ({
        ...t,
        id: uuidv4(),
        isCompleted: false,
        status: t.status || 'unset',
        comments: t.comments || []
      }))
    };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (updatedProject: Project) => {
    saveProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId: string) => {
    saveProjects(projects.filter(p => p.id !== projectId));
  };

  const addTask = (projectId: string, taskData: Omit<ProjectTask, 'id' | 'isCompleted'>) => {
    const newTask: ProjectTask = {
      ...taskData,
      id: uuidv4(),
      isCompleted: false,
      status: taskData.status || 'unset',
      comments: taskData.comments || []
    };
    
    saveProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    }));
  };

  const updateTask = (projectId: string, updatedTask: ProjectTask) => {
    saveProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        };
      }
      return p;
    }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    saveProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
      }
      return p;
    }));
  };

  const completeTask = (projectId: string, taskId: string) => {
    saveProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, isCompleted: true, completedAt: new Date().toISOString() };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    completeTask
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
