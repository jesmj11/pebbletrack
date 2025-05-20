import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Download } from "lucide-react";

interface StudentProgress {
  studentId: number;
  fullName: string;
  className: string;
  completedTasks: number;
  pendingTasks: number;
  progressPercentage: number;
}

interface ClassWithCount {
  id: number;
  name: string;
  studentCount: number;
}

interface DashboardData {
  classes: ClassWithCount[];
  studentProgress: StudentProgress[];
  completionRate: number;
}

// These colors match the design reference's chart colors
const COLORS = ["hsl(207, 90%, 54%)", "hsl(180, 50%, 48%)", "hsl(276, 91%, 38%)", "hsl(340, 82%, 52%)", "hsl(36, 100%, 50%)"];

const Reports = () => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("week");
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard/teacher"],
  });
  
  const dashboardData = data as DashboardData;
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  // Filter data based on selected class
  const filteredStudents = dashboardData?.studentProgress
    ? selectedClass === "all"
      ? dashboardData.studentProgress
      : dashboardData.studentProgress.filter(
          (student) => student.className === selectedClass
        )
    : [];
  
  // Prepare data for class completion chart
  const classCompletionData = dashboardData?.classes
    ? dashboardData.classes.map((cls) => {
        const studentsInClass = dashboardData.studentProgress.filter(
          (student) => student.className === cls.name
        );
        
        const avgCompletion =
          studentsInClass.length > 0
            ? studentsInClass.reduce((sum, student) => sum + student.progressPercentage, 0) /
              studentsInClass.length
            : 0;
        
        return {
          name: cls.name,
          completion: Math.round(avgCompletion),
        };
      })
    : [];
  
  // Data for task priority distribution (mock data as we don't have this in our API)
  // In a real app, this would come from the API
  const taskPriorityData = [
    { name: "High", value: 30 },
    { name: "Medium", value: 45 },
    { name: "Low", value: 25 },
  ];
  
  // Completion by day of week (mock data for demonstration)
  // In a real app, this would come from the API
  const weekdayCompletionData = [
    { name: "Mon", tasks: 12 },
    { name: "Tue", tasks: 19 },
    { name: "Wed", tasks: 8 },
    { name: "Thu", tasks: 15 },
    { name: "Fri", tasks: 23 },
    { name: "Sat", tasks: 10 },
    { name: "Sun", tasks: 5 },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading report data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 md:mb-0">Reports</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-neutral-dark" />
            <span className="text-sm text-neutral-dark">{currentDate}</span>
          </div>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {dashboardData?.classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-dark">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.studentProgress.length || 0}</div>
            <p className="text-xs text-neutral-medium mt-1">Across {dashboardData?.classes.length || 0} classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-dark">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.reduce((sum, student) => sum + student.completedTasks, 0)}
            </div>
            <p className="text-xs text-green-500 mt-1">
              {Math.round(dashboardData?.completionRate || 0)}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-dark">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.reduce((sum, student) => sum + student.pendingTasks, 0)}
            </div>
            <p className="text-xs text-amber-500 mt-1">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-dark">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.length > 0
                ? Math.round(
                    filteredStudents.reduce((sum, student) => sum + student.progressPercentage, 0) /
                      filteredStudents.length
                  )
                : 0}%
            </div>
            <p className="text-xs text-neutral-medium mt-1">Across all students</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classCompletionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Completion Rate"]}
                    contentStyle={{ backgroundColor: "white", borderRadius: "0.5rem" }}
                  />
                  <Bar dataKey="completion" fill="hsl(207, 90%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, "Count"]}
                    contentStyle={{ backgroundColor: "white", borderRadius: "0.5rem" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Completion by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayCompletionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, "Completed"]}
                    contentStyle={{ backgroundColor: "white", borderRadius: "0.5rem" }}
                  />
                  <Bar dataKey="tasks" fill="hsl(180, 50%, 48%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Performing Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-dark border-b border-neutral-light">
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Class</th>
                  <th className="py-3 px-4 font-medium">Completed Tasks</th>
                  <th className="py-3 px-4 font-medium">Pending Tasks</th>
                  <th className="py-3 px-4 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents
                    .sort((a, b) => b.progressPercentage - a.progressPercentage)
                    .map((student, index) => (
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
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-neutral-dark">
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
