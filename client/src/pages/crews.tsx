import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Crew } from "@shared/schema";

export default function Crews() {
  const { data: crews = [], isLoading } = useQuery<Crew[]>({
    queryKey: ["/api/crews"],
  });

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Crews</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your AI agent crews and workflows
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search crews..."
                className="pl-10 w-80"
                data-testid="search-crews"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button variant="outline" data-testid="filter-crews">
              <Filter className="mr-2 w-4 h-4" />
              Filter
            </Button>
            
            <Button data-testid="create-crew">
              <Plus className="mr-2 w-4 h-4" />
              Create Crew
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
            {crews?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No crews found. Create your first crew to get started.</p>
              </div>
            ) : (
              crews?.map((crew: Crew) => (
                <Card key={crew.id} data-testid={`crew-${crew.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{crew.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{crew.description}</p>
                      </div>
                      <Badge variant="secondary">{crew.process}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created {new Date(crew.createdAt!).toLocaleDateString()}</span>
                      <span>{crew.maxIterations} iterations</span>
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
