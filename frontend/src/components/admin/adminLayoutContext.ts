import { createContext } from 'react';

export const AdminLayoutContext = createContext<{
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}>({
  toggleSidebar: () => {},
  isSidebarOpen: false,
});
