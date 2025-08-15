import { Link, useLocation } from "wouter";
import { 
  Gauge, 
  Users, 
  UserCog, 
  ListTodo, 
  PlayCircle, 
  Brain, 
  Book, 
  Folder,
  Settings,
  Bot
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/crews", label: "Crews", icon: Users },
  { href: "/agents", label: "Agents", icon: UserCog },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/executions", label: "Executions", icon: PlayCircle },
  { href: "/llm-providers", label: "LLM Providers", icon: Brain },
  { href: "/knowledge-base", label: "Knowledge Base", icon: Book },
  { href: "/projects", label: "Projects", icon: Folder },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">CrewAI Studio</h1>
            <p className="text-xs text-muted-foreground">AI Agent Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Smith</p>
            <p className="text-xs text-muted-foreground truncate">john@company.com</p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
