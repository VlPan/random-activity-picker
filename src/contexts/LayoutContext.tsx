import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarWidth: number;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Constants from Sidebar.tsx (approximate for logic, can be refined)
  // Expanded: 240
  // Collapsed: 65 (sm up) or 57. We can use a safe value or logic.
  // Let's use 240 for open, and a base value for closed.
  // Actually, we can just export the width value.
  
  const sidebarWidth = isSidebarOpen ? 240 : 65; // Using 65 as safe estimate for collapsed

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar, sidebarWidth }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
