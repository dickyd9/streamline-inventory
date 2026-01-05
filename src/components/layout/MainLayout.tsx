import { ReactNode } from 'react';
import { Sidebar, useSidebarState } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

function MainContent({ children, title }: MainLayoutProps) {
  const { collapsed } = useSidebarState();
  
  return (
    <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
      <Header title={title} />
      <main className="p-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MainContent title={title}>{children}</MainContent>
    </div>
  );
}
