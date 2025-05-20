import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon, Users, BookOpen, CheckCircle, TrendingUp, AlertCircle, Bell, ExternalLink, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddAssignmentModal from "@/components/modals/AddAssignmentModal";
import { useUserContext } from "@/context/UserContext";

interface DashboardData {
  classes: ClassWithCount[];
  studentProgress: StudentProgressData[];
  completionRate: number;
}

interface ClassWithCount {
  id: number;
  name: string;
  teacherId: number;
  gradeLevel?: string;
  description?: string;
  studentCount: number;
}

interface StudentProgressData {
  studentId: number;
  fullName: string;
  className: string;
  completedTasks: number;
  pendingTasks: number;
  progressPercentage: number;
}

interface Activity {
  id: number;
  type: "completion" | "missed" | "notification";
  studentName?: string;
  assignmentTitle?: string;
  timeAgo: string;
}

const TeacherDashboard = () => {
  const { user } = useUserContext();
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/teacher"],
    enabled: user?.role === "teacher",
  });
  
  const dashboardData = data as DashboardData;
  
  // Mock activities (would come from the server in a real app)
  useEffect(() => {
    setActivities([
      {
        id: 1,
        type: "completion",
        studentName: "Alex Thompson",
        assignmentTitle: "Math Equations Assignment",
        timeAgo: "10 minutes ago"
      },
      {
        id: 2,
        type: "missed",
        studentName: "Jamie Wilson",
        assignmentTitle: "Science Lab Report",
        timeAgo: "1 hour ago"
      },
      {
        id: 3,
        type: "notification",
        assignmentTitle: "History Essay",
        timeAgo: "2 hours ago"
      }
    ]);
  }, []);
  
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-medium text-neutral-darkest mb-2 md:mb-0">Teacher Dashboard</h2>
          <div className="flex space-x-2">
            <span className="text-sm text-neutral-dark">Today: <span className="font-medium">{currentDate}</span></span>
            <Button onClick={() => setIsAddAssignmentOpen(true)} className="bg-primary hover:bg-primary-dark text-white flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>New Assignment</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
          <p>Error loading dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const filteredStudents = selectedClass === "all" 
    ? dashboardData?.studentProgress || []
    : (dashboardData?.studentProgress || []).filter(
        student => student.className === selectedClass
      );
  
  const activityIcon = (type: string) => {
    switch (type) {
      case "completion":
        return (
          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
        );
      case "missed":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        );
      case "notification":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 md:mb-0">Teacher Dashboard</h2>
        <div className="flex space-x-2">
          <span className="text-sm text-neutral-dark">Today: <span className="font-medium">{currentDate}</span></span>
          <Button onClick={() => setIsAddAssignmentOpen(true)} className="bg-primary hover:bg-primary-dark text-white flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            <span>New Assignment</span>
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">Total Students</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">
                {dashboardData?.studentProgress.length || 0}
              </h3>
            </div>
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-success mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+12 from last month</span>
          </p>
        </Card>
        
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">Active Classes</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">
                {dashboardData?.classes.length || 0}
              </h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-neutral-dark mt-2">
            Across {new Set(dashboardData?.classes.map(c => c.gradeLevel)).size || 0} grade levels
          </p>
        </Card>
        
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">Task Completion</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">
                {Math.round(dashboardData?.completionRate || 0)}%
              </h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <Progress 
            value={dashboardData?.completionRate || 0} 
            className="h-1.5 mt-3"
          />
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-darkest">Today's Activities</h3>
          <Button variant="ghost" className="text-primary text-sm flex items-center hover:bg-transparent hover:underline p-0">
            <span>View All</span>
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start border-b border-neutral-light pb-3">
              <div className="flex-shrink-0 mr-3">
                {activityIcon(activity.type)}
              </div>
              <div className="flex-grow">
                <p className="text-neutral-darkest">
                  {activity.type === "notification" ? (
                    <>
                      New assignment <span className="font-medium">{activity.assignmentTitle}</span> is due tomorrow
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{activity.studentName}</span>
                      {activity.type === "completion" ? " completed " : " missed deadline for "}
                      <span className="font-medium">{activity.assignmentTitle}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-neutral-dark mt-1">{activity.timeAgo}</p>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary-dark p-1 h-auto">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Student Progress Section */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-darkest">Student Progress</h3>
          <div className="flex space-x-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-neutral-light text-neutral-darkest w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {dashboardData?.classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-neutral-dark border-b border-neutral-light">
                <th className="py-3 px-4 font-medium">Student</th>
                <th className="py-3 px-4 font-medium">Class</th>
                <th className="py-3 px-4 font-medium">Completed Tasks</th>
                <th className="py-3 px-4 font-medium">Pending Tasks</th>
                <th className="py-3 px-4 font-medium">Progress</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={`${student.studentId}-${index}`} className="border-b border-neutral-light hover:bg-neutral-light">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">
                            {student.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-neutral-darkest">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-dark">{student.className}</td>
                    <td className="py-3 px-4 text-neutral-darkest">{student.completedTasks}</td>
                    <td className="py-3 px-4 text-neutral-darkest">{student.pendingTasks}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-neutral-light rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              student.progressPercentage >= 80 
                                ? 'bg-green-500' 
                                : student.progressPercentage >= 60 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-neutral-dark">{Math.round(student.progressPercentage)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" className="text-primary hover:text-primary-dark p-1 h-auto mr-2">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" className="text-neutral-dark hover:text-neutral-darkest p-1 h-auto">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-neutral-dark">
                    No student data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-neutral-dark">
              Showing 1-{Math.min(filteredStudents.length, 10)} of {filteredStudents.length} students
            </span>
            <div className="flex space-x-1">
              <Button disabled variant="outline" size="icon" className="w-8 h-8 p-0">
                <span className="sr-only">Previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 p-0 bg-primary text-white">
                <span className="sr-only">Page 1</span>
                1
              </Button>
              <Button disabled variant="outline" size="icon" className="w-8 h-8 p-0">
                <span className="sr-only">Next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <AddAssignmentModal 
        isOpen={isAddAssignmentOpen} 
        onClose={() => setIsAddAssignmentOpen(false)} 
      />
    </div>
  );
};

// Simple chevron icons for pagination
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default TeacherDashboard;
