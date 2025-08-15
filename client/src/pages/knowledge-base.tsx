import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { KnowledgeItem } from "@shared/schema";

export default function KnowledgeBase() {
  const { data: knowledgeItems = [], isLoading } = useQuery<KnowledgeItem[]>({
    queryKey: ["/api/knowledge"],
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Knowledge Base</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage documents and training materials for your agents
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search knowledge base..."
                className="pl-10 w-80"
                data-testid="search-knowledge"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button variant="outline" data-testid="filter-knowledge">
              <Filter className="mr-2 w-4 h-4" />
              Filter
            </Button>
            
            <Button data-testid="upload-knowledge">
              <Upload className="mr-2 w-4 h-4" />
              Upload Document
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
            {knowledgeItems?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No knowledge items found. Upload your first document to get started.</p>
              </div>
            ) : (
              knowledgeItems?.map((item: KnowledgeItem) => (
                <Card key={item.id} data-testid={`knowledge-${item.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          {item.fileType && (
                            <Badge variant="outline" className="mt-1">
                              {item.fileType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.content && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {item.fileSize ? formatFileSize(item.fileSize) : "Text content"}
                      </span>
                      <span>Added {new Date(item.createdAt!).toLocaleDateString()}</span>
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
