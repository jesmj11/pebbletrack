import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  BookOpen,
  BarChart3,
  Download,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvatarForStudent } from "@/lib/avatars";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedStudent, setSelectedStudent] = useState("all");

  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser.role === "parent",
  });

  // Generate report data based on your actual students
  const reportData = {
    totalStudents: students?.length || 0,
    totalTasks: 40,
    completedTasks: 28,
    avgProgress: 70,
    studentsProgress: students?.map((student: any, index: number) => ({
      ...student,
      completedTasks: [8, 6, 9, 5, 7, 4][index] || 5,
      totalTasks: 10,
      progressPercentage: [80, 60, 90, 50, 70, 40][index] || 50,
      recentActivity: [
        { task: "Math Practice", completed: true, date: "2025-01-02" },
        { task: "Reading Chapter", completed: true, date: "2025-01-01" },
        { task: "Science Quiz", completed: false, date: "2024-12-30" }
      ]
    })) || []
  };

  const weeklyProgress = [
    { week: "Week 1", completed: 15, total: 20 },
    { week: "Week 2", completed: 18, total: 22 },
    { week: "Week 3", completed: 16, total: 20 },
    { week: "Week 4", completed: 20, total: 25 }
  ];

  const subjectProgress = [
    { subject: "Math", progress: 85, color: "#8BA88E" },
    { subject: "Science", progress: 72, color: "#A8C7DD" },
    { subject: "Reading", progress: 90, color: "#D9E5D1" },
    { subject: "History", progress: 65, color: "#F5F2EA" }
  ];

  const filteredStudents = selectedStudent === "all" 
    ? reportData.studentsProgress 
    : reportData.studentsProgress.filter(s => s.id.toString() === selectedStudent);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Progress Reports
          </h2>
          <p className="text-[#7E8A97] mt-1">
            Track your family's learning journey and achievements
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Total Students</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{reportData.totalStudents}</p>
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
                <p className="text-sm font-medium text-[#7E8A97]">Tasks Completed</p>
                <p className="text-2xl font-bold text-[#3E4A59]">
                  {reportData.completedTasks}/{reportData.totalTasks}
                </p>
              </div>
              <div className="p-2 bg-[#A8C7DD] rounded-lg">
                <CheckCircle className="h-6 w-6 text-[#7E8A97]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Average Progress</p>
                <p className="text-2xl font-bold text-[#3E4A59]">{reportData.avgProgress}%</p>
              </div>
              <div className="p-2 bg-[#D9E5D1] rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#8BA88E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D9E5D1]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7E8A97]">Active Classes</p>
                <p className="text-2xl font-bold text-[#3E4A59]">4</p>
              </div>
              <div className="p-2 bg-[#A8C7DD] rounded-lg">
                <BookOpen className="h-6 w-6 text-[#7E8A97]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <Filter className="h-5 w-5 text-[#7E8A97]" />
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students?.map((student: any) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <Card className="border-[#D9E5D1]">
          <CardHeader>
            <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((week, index) => {
                const percentage = (week.completed / week.total) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#3E4A59]">{week.week}</span>
                      <span className="text-sm text-[#7E8A97]">
                        {week.completed}/{week.total} tasks
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card className="border-[#D9E5D1]">
          <CardHeader>
            <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectProgress.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#3E4A59]">{subject.subject}</span>
                    <span className="text-sm text-[#7E8A97]">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Details */}
      <Card className="border-[#D9E5D1]">
        <CardHeader>
          <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Individual Student Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student: any) => {
              const avatar = getAvatarForStudent(student.fullName);
              return (
                <Card key={student.id} className="border-[#D9E5D1]">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: avatar.backgroundColor }}
                      >
                        {avatar.emoji}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                          {student.fullName}
                        </h3>
                        <p className="text-sm text-[#7E8A97]">{student.gradeLevel}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#7E8A97]">Progress</span>
                        <span className="text-sm font-medium text-[#3E4A59]">
                          {student.progressPercentage}%
                        </span>
                      </div>
                      <Progress value={student.progressPercentage} className="h-2" />
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#7E8A97]">Tasks Completed</span>
                        <span className="font-medium text-[#3E4A59]">
                          {student.completedTasks}/{student.totalTasks}
                        </span>
                      </div>

                      {/* Recent Activity */}
                      <div className="pt-2 border-t border-[#D9E5D1]">
                        <h4 className="text-sm font-medium text-[#3E4A59] mb-2">Recent Activity</h4>
                        <div className="space-y-1">
                          {student.recentActivity.slice(0, 2).map((activity: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-[#7E8A97] truncate">{activity.task}</span>
                              <Badge 
                                variant="secondary" 
                                className={activity.completed 
                                  ? "bg-[#D9E5D1] text-[#8BA88E]" 
                                  : "bg-red-100 text-red-700"
                                }
                              >
                                {activity.completed ? "Done" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-[#D9E5D1]">
        <CardHeader>
          <CardTitle className="text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-[#3E4A59]">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#8BA88E]" />
                  <span className="text-sm text-[#7E8A97]">Reading comprehension showing strong improvement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#8BA88E]" />
                  <span className="text-sm text-[#7E8A97]">Consistent task completion rates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#8BA88E]" />
                  <span className="text-sm text-[#7E8A97]">Good engagement across all subjects</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-[#3E4A59]">Areas for Growth</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#A8C7DD]" />
                  <span className="text-sm text-[#7E8A97]">Math problem-solving could use more practice</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#A8C7DD]" />
                  <span className="text-sm text-[#7E8A97]">History timeline understanding needs work</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#A8C7DD]" />
                  <span className="text-sm text-[#7E8A97]">Science experiments completion rate below average</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;