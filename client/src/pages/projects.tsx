import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@shared/schema";

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your content creation projects and workflows
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-10 w-80"
                data-testid="search-projects"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button variant="outline" data-testid="filter-projects">
              <Filter className="mr-2 w-4 h-4" />
              Filter
            </Button>
            
            <Button data-testid="create-project">
              <Plus className="mr-2 w-4 h-4" />
              Create Project
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No projects found. Create your first project to get started.</p>
              </div>
            ) : (
              projects?.map((project: Project) => (
                <Card key={project.id} data-testid={`project-${project.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Folder className="text-orange-600 w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{project.name}</h3>
                          <Badge variant={getStatusVariant(project.status || "active")} className="mt-1">
                            {project.status || "active"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(project.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
