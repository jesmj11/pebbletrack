import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusIcon, Search, Users, Edit, Trash, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import AddClassModal from "@/components/modals/AddClassModal";

interface ClassWithCount {
  id: number;
  name: string;
  gradeLevel?: string;
  description?: string;
  studentCount: number;
}

const Classes = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithCount | null>(null);
  
  const { data: classesData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/teacher"],
  });
  
  const classes = classesData?.classes as ClassWithCount[];
  
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      return apiRequest("DELETE", `/api/classes/${classId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/teacher"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Class deleted",
        description: "The class has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete the class",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteClass = (classId: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      deleteClassMutation.mutate(classId);
    }
  };
  
  const handleEditClass = (classItem: ClassWithCount) => {
    setEditingClass(classItem);
    setIsAddModalOpen(true);
  };
  
  const filteredClasses = classes
    ? classes.filter(cls => 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.gradeLevel && cls.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 sm:mb-0">Classes</h2>
        <Button onClick={() => {
          setEditingClass(null);
          setIsAddModalOpen(true);
        }} className="bg-primary hover:bg-primary-dark text-white flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          <span>Add Class</span>
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search classes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-neutral-light"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-8 text-neutral-dark">
            <p>No classes found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map(cls => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    {cls.gradeLevel ? (
                      <Badge variant="outline" className="bg-neutral-light">
                        {cls.gradeLevel}
                      </Badge>
                    ) : (
                      <span className="text-neutral-dark text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-neutral-dark" />
                      <span>{cls.studentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {cls.description || <span className="text-neutral-dark text-sm">No description</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClass(cls)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClass(cls.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      <AddClassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        classItem={editingClass}
      />
    </div>
  );
};

export default Classes;
