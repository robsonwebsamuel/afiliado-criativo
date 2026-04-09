import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Top bar */}
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-lg hover:bg-elevated transition-colors text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
          </header>

          {/* Notification bar */}
          {showNotif && (
            <div className="bg-surface border-b border-border/50 px-6 py-3 text-sm flex items-center justify-between animate-fade-in">
              <span className="text-muted-foreground">
                {currentUser.plan === 'free'
                  ? '⏰ Seu período gratuito termina em 4 dias. Assine agora!'
                  : `📊 Você criou ${currentUser.artsCreatedToday} artes hoje.`}
              </span>
              <button onClick={() => setShowNotif(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Fechar
              </button>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6 bg-background text-foreground relative z-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
