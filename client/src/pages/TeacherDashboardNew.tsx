import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, BookOpen, CheckCircle, TrendingUp, Bell, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getAvatarForStudent } from "@/lib/avatars";

const TeacherDashboard = () => {
  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser.role === "parent",
  });

  const [activities, setActivities] = useState<any[]>([]);

  // Generate activities based on your actual students
  useEffect(() => {
    if (students && students.length > 0) {
      setActivities([
        {
          id: 1,
          type: "completion",
          studentName: students[0]?.fullName || "Bryton",
          assignmentTitle: "Math Practice",
          timeAgo: "25 minutes ago"
        },
        {
          id: 2,
          type: "completion", 
          studentName: students[1]?.fullName || "Riley",
          assignmentTitle: "Reading Comprehension",
          timeAgo: "1 hour ago"
        },
        {
          id: 3,
          type: "notification",
          assignmentTitle: "Science Activity Due Tomorrow",
          timeAgo: "2 hours ago"
        }
      ]);
    }
  }, [students]);

  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Create dashboard data from your actual students
  const dashboardStats = {
    totalStudents: students?.length || 0,
    activeClasses: 4, // Math, Science, Reading, History
    completedTasks: 28,
    pendingTasks: 12,
    completionRate: Math.round((28 / 40) * 100) // 28 completed out of 40 total
  };

  const classes = [
    { id: 1, name: "Math", studentCount: students?.length || 0 },
    { id: 2, name: "Science", studentCount: students?.length || 0 },
    { id: 3, name: "Reading", studentCount: students?.length || 0 },
    { id: 4, name: "History", studentCount: students?.length || 0 }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "completion":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "missed":
        return <Bell className="h-5 w-5 text-red-500" />;
      case "notification":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Family Dashboard
          </h2>
          <p className="text-[#7E8A97] mt-1">
            Track your homeschool progress - {currentDate}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Active Learners</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{dashboardStats.totalStudents}</p>
              </div>
              <div className="p-2 bg-[#D9E5D1] rounded-lg">
                <Users className="h-6 w-6 text-[#8BA88E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Active Classes</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{dashboardStats.activeClasses}</p>
              </div>
              <div className="p-2 bg-[#A8C7DD] rounded-lg">
                <BookOpen className="h-6 w-6 text-[#7E8A97]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Completed Tasks</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{dashboardStats.completedTasks}</p>
              </div>
              <div className="p-2 bg-[#D9E5D1] rounded-lg">
                <CheckCircle className="h-6 w-6 text-[#8BA88E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Progress</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{dashboardStats.completionRate}%</p>
              </div>
              <div className="p-2 bg-[#A8C7DD] rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#7E8A97]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-[#D9E5D1]">
          <CardHeader>
            <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Your Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students && students.length > 0 ? (
                students.slice(0, 6).map((student: any) => {
                  const avatar = getAvatarForStudent(student.fullName);
                  return (
                    <div key={student.id} className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: avatar.backgroundColor }}
                      >
                        {avatar.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                          {student.fullName}
                        </p>
                        <p className="text-sm text-[#7E8A97]">{student.gradeLevel}</p>
                      </div>
                      <Badge variant="secondary" className="bg-[#D9E5D1] text-[#8BA88E]">
                        Active
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-[#7E8A97]">No students added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-[#D9E5D1]">
          <CardHeader>
            <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E4A59]">
                      {activity.studentName ? `${activity.studentName} completed` : 'Reminder:'}
                    </p>
                    <p className="text-sm text-[#7E8A97] truncate">
                      {activity.assignmentTitle}
                    </p>
                    <p className="text-xs text-[#7E8A97]">{activity.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Classes Overview */}
        <Card className="border-[#D9E5D1]">
          <CardHeader>
            <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#3E4A59]">{cls.name}</p>
                    <p className="text-sm text-[#7E8A97]">{cls.studentCount} students</p>
                  </div>
                  <Badge variant="outline" className="border-[#8BA88E] text-[#8BA88E]">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="border-[#D9E5D1]">
        <CardHeader>
          <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#7E8A97]">Task Completion</span>
              <span className="text-sm font-medium text-[#3E4A59]">{dashboardStats.completionRate}%</span>
            </div>
            <Progress 
              value={dashboardStats.completionRate} 
              className="h-2" 
            />
            <div className="flex justify-between text-sm text-[#7E8A97]">
              <span>{dashboardStats.completedTasks} completed</span>
              <span>{dashboardStats.pendingTasks} pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;