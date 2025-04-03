import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LiveStreams from "@/pages/live-streams";
import Recordings from "@/pages/recordings";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useState } from "react";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/live-streams" component={LiveStreams} />
            <Route path="/recordings" component={Recordings} />
            <Route path="/alerts" component={Alerts} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
