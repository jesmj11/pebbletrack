import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusIcon, Search, Users, Edit, Trash, MoreHorizontal, BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ClassData {
  id: number;
  name: string;
  gradeLevel?: string;
  description?: string;
  studentCount: number;
  assignments?: Assignment[];
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'active' | 'completed' | 'overdue';
  completedBy: number;
  totalStudents: number;
}

const Classes = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students to get count
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser.role === "parent",
  });

  // Sample classes data with assignments (would come from API)
  const classes: ClassData[] = [
    {
      id: 1,
      name: "Math",
      gradeLevel: "Multiple Grades",
      description: "Mathematics curriculum covering fundamentals to advanced concepts",
      studentCount: students?.length || 0,
      assignments: [
        {
          id: 1,
          title: "Addition Practice",
          description: "Practice basic addition problems",
          dueDate: "2025-01-05",
          status: 'active',
          completedBy: 3,
          totalStudents: students?.length || 6
        },
        {
          id: 2,
          title: "Multiplication Tables",
          description: "Learn and practice multiplication tables 1-12",
          dueDate: "2025-01-10",
          status: 'active',
          completedBy: 1,
          totalStudents: students?.length || 6
        }
      ]
    },
    {
      id: 2,
      name: "Science",
      gradeLevel: "Multiple Grades",
      description: "Hands-on science experiments and discovery",
      studentCount: students?.length || 0,
      assignments: [
        {
          id: 3,
          title: "Solar System Project",
          description: "Create a model of the solar system",
          dueDate: "2025-01-15",
          status: 'active',
          completedBy: 2,
          totalStudents: students?.length || 6
        }
      ]
    },
    {
      id: 3,
      name: "Reading",
      gradeLevel: "Multiple Grades", 
      description: "Reading comprehension and literature exploration",
      studentCount: students?.length || 0,
      assignments: [
        {
          id: 4,
          title: "Chapter Reading",
          description: "Read chapters 1-3 and answer questions",
          dueDate: "2025-01-08",
          status: 'active',
          completedBy: 4,
          totalStudents: students?.length || 6
        }
      ]
    },
    {
      id: 4,
      name: "History",
      gradeLevel: "Multiple Grades",
      description: "World history and cultural studies",
      studentCount: students?.length || 0,
      assignments: [
        {
          id: 5,
          title: "Ancient Civilizations",
          description: "Research project on ancient civilizations",
          dueDate: "2025-01-20",
          status: 'active',
          completedBy: 0,
          totalStudents: students?.length || 6
        }
      ]
    }
  ];

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.gradeLevel && cls.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#D9E5D1] text-[#8BA88E]';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-[#A8C7DD] text-[#7E8A97]';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Classes & Assignments
          </h2>
          <p className="text-[#7E8A97] mt-1">
            Manage your homeschool curriculum and assignments
          </p>
        </div>
        <Button 
          onClick={() => setIsClassModalOpen(true)}
          className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7E8A97]" />
        <Input 
          placeholder="Search classes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-[#D9E5D1] focus:border-[#8BA88E]"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(classItem => (
          <Card key={classItem.id} className="border-[#D9E5D1] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 bg-[#A8C7DD] rounded-lg">
                  <BookOpen className="h-6 w-6 text-[#7E8A97]" />
                </div>
                <Badge variant="outline" className="border-[#8BA88E] text-[#8BA88E]">
                  {classItem.gradeLevel}
                </Badge>
              </div>
              <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {classItem.name}
              </CardTitle>
              <p className="text-sm text-[#7E8A97]">{classItem.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Student count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-[#7E8A97]">
                    <Users className="h-4 w-4 mr-1" />
                    {classItem.studentCount} students
                  </div>
                  <div className="flex items-center text-sm text-[#7E8A97]">
                    <Calendar className="h-4 w-4 mr-1" />
                    {classItem.assignments?.length || 0} assignments
                  </div>
                </div>

                {/* Assignment progress */}
                {classItem.assignments && classItem.assignments.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-[#3E4A59] mb-2">Recent Assignments</div>
                    <div className="space-y-2">
                      {classItem.assignments.slice(0, 2).map(assignment => {
                        const progress = (assignment.completedBy / assignment.totalStudents) * 100;
                        return (
                          <div key={assignment.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[#3E4A59]">{assignment.title}</span>
                              <Badge 
                                variant="secondary" 
                                className={getStatusColor(assignment.status)}
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                            <Progress value={progress} className="h-1" />
                            <div className="text-xs text-[#7E8A97]">
                              {assignment.completedBy}/{assignment.totalStudents} completed
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedClass(classItem)}
                    className="flex-1 border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="bg-[#8BA88E] hover:bg-[#7B987E] text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Details Modal */}
      <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {selectedClass?.name} - Class Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <Tabs defaultValue="assignments" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assignments" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#3E4A59]">Assignments</h3>
                  <Button 
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="bg-[#8BA88E] hover:bg-[#7B987E] text-white"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedClass.assignments?.map(assignment => (
                    <Card key={assignment.id} className="border-[#D9E5D1]">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[#3E4A59]">{assignment.title}</h4>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#7E8A97] mb-3">{assignment.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-[#7E8A97]">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {assignment.dueDate}
                          </div>
                          <div className="flex items-center text-[#7E8A97]">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {assignment.completedBy}/{assignment.totalStudents} completed
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Progress 
                            value={(assignment.completedBy / assignment.totalStudents) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="students" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Enrolled Students</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students?.map((student: any) => (
                    <Card key={student.id} className="border-[#D9E5D1]">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#A8C7DD] rounded-full flex items-center justify-center">
                            <span className="text-lg">{student.fullName.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-[#3E4A59]">{student.fullName}</p>
                            <p className="text-sm text-[#7E8A97]">{student.gradeLevel}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;
