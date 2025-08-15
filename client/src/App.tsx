import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Crews from "@/pages/crews";
import Agents from "@/pages/agents";
import Tasks from "@/pages/tasks";
import Executions from "@/pages/executions";
import LlmProviders from "@/pages/llm-providers";
import KnowledgeBase from "@/pages/knowledge-base";
import Projects from "@/pages/projects";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/crews" component={Crews} />
        <Route path="/agents" component={Agents} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/executions" component={Executions} />
        <Route path="/llm-providers" component={LlmProviders} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/projects" component={Projects} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
