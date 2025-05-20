import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { CheckCircle, Clock, BookOpen, CheckSquare, TrendingUp, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  completedTasks: number;
  pendingTasks: number;
  dueTodayTasks: number;
  totalClasses: number;
  progress: Array<{
    className: string;
    percentage: number;
  }>;
}

interface Task {
  id: number;
  assignment: {
    id: number;
    title: string;
    dueDate: string;
    priority: string;
  };
  class: {
    id: number;
    name: string;
  };
  completed: boolean;
  completedAt: string | null;
}

const StudentDashboard = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  
  // For demo purposes, provide mock data 
  const isLoading = false;
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  // Mock student dashboard data
  const studentData: DashboardData = {
    completedTasks: 12,
    pendingTasks: 8,
    dueTodayTasks: 3,
    totalClasses: 4,
    progress: [
      { className: "Math 101", percentage: 75 },
      { className: "Science", percentage: 60 },
      { className: "History", percentage: 90 },
      { className: "English", percentage: 45 }
    ]
  };
  
  // Mock tasks data
  const tasks: Task[] = [
    {
      id: 1,
      assignment: {
        id: 101,
        title: "Math Homework - Chapter 4",
        dueDate: new Date().toISOString(),
        priority: "high"
      },
      class: {
        id: 1,
        name: "Math 101"
      },
      completed: false,
      completedAt: null
    },
    {
      id: 2,
      assignment: {
        id: 102,
        title: "Science Lab Report",
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        priority: "medium" 
      },
      class: {
        id: 2,
        name: "Science"
      },
      completed: false,
      completedAt: null
    },
    {
      id: 3,
      assignment: {
        id: 103,
        title: "History Essay",
        dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        priority: "low"
      },
      class: {
        id: 3,
        name: "History" 
      },
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
      id: 4,
      assignment: {
        id: 104,
        title: "English Literature Review",
        dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        priority: "high"
      },
      class: {
        id: 4,
        name: "English"
      },
      completed: true,
      completedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ];
  
  // Filter tasks by class if selected
  const filteredTasks = tasks ? (
    selectedClass === "all" 
      ? tasks 
      : tasks.filter(task => task.class.name === selectedClass)
  ) : [];
  
  // Group tasks by due date
  const todayTasks = filteredTasks
    ? filteredTasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.assignment.dueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
      })
    : [];
  
  const upcomingTasks = filteredTasks
    ? filteredTasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.assignment.dueDate);
        const today = new Date();
        return dueDate > today && dueDate.toDateString() !== today.toDateString();
      })
    : [];
  
  const completedTasks = filteredTasks
    ? filteredTasks.filter(task => task.completed)
        .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
        .slice(0, 2) // Just show the 2 most recent
    : [];
  
  const handleTaskComplete = (taskId: number, isCompleted: boolean) => {
    // For demo purposes, just show a toast notification
    toast({
      title: isCompleted ? "Task completed" : "Task marked as incomplete",
      description: isCompleted ? "Great job! Task marked as complete." : "Task marked as incomplete.",
      variant: isCompleted ? "default" : "destructive",
    });
  };
  
  const getTaskPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-neutral-dark";
    }
  };
  
  const getTaskPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <span className="material-icons text-xs mr-1 text-error">priority_high</span>;
      case "medium":
        return <span className="material-icons text-xs mr-1 text-warning">low_priority</span>;
      case "low":
        return <span className="material-icons text-xs mr-1 text-success">low_priority</span>;
      default:
        return null;
    }
  };
  
  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    if (dueDate.toDateString() === today.toDateString()) {
      return `Due ${format(dueDate, "h:mm a")}`;
    } else {
      return `Due ${format(dueDate, "MMM d")}`;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading your tasks...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-medium text-neutral-darkest mb-2 md:mb-0">My Tasks</h2>
        <div>
          <span className="text-sm text-neutral-dark">Today: <span className="font-medium">{currentDate}</span></span>
        </div>
      </div>
      
      {/* Student Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">Pending Tasks</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">{studentData?.pendingTasks || 0}</h3>
            </div>
            <div className="bg-secondary bg-opacity-10 p-2 rounded-full">
              <CheckSquare className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <p className="text-xs text-amber-500 mt-2 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{studentData?.dueTodayTasks || 0} due today</span>
          </p>
        </Card>
        
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">Completed</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">{studentData?.completedTasks || 0}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-green-500 mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>{completedTasks?.length || 0} completed recently</span>
          </p>
        </Card>
        
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-dark text-sm">My Classes</p>
              <h3 className="text-2xl font-medium text-neutral-darkest">{studentData?.totalClasses || 0}</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-neutral-dark mt-2">
            {studentData?.progress?.map(p => p.className).join(", ") || "No classes"}
          </p>
        </Card>
      </div>
      
      {/* Task List */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-darkest">My Tasks</h3>
          <div className="flex space-x-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-neutral-light text-neutral-darkest w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {studentData?.progress?.map(p => (
                  <SelectItem key={p.className} value={p.className}>{p.className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3">
          {todayTasks.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-neutral-dark mt-4">Due Today</h4>
              
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center bg-neutral-light bg-opacity-50 rounded-lg p-3 border-l-4 border-amber-500">
                  <div className="mr-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                      className="h-5 w-5 rounded border-neutral-medium text-secondary"
                    />
                  </div>
                  <div className="flex-grow">
                    <h5 className={`text-neutral-darkest font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.assignment.title}
                    </h5>
                    <div className="flex items-center text-xs text-neutral-dark mt-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span className="mr-3">{task.class.name}</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="mr-3">{formatDueDate(task.assignment.dueDate)}</span>
                      <span className={`mr-1 ${getTaskPriorityColor(task.assignment.priority)}`}>•</span>
                      <span className={getTaskPriorityColor(task.assignment.priority)}>
                        {task.assignment.priority.charAt(0).toUpperCase() + task.assignment.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-neutral-dark hover:text-neutral-darkest ml-2 p-1 h-auto">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </>
          )}
          
          {upcomingTasks.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-neutral-dark mt-4">Upcoming</h4>
              
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center bg-neutral-light bg-opacity-50 rounded-lg p-3 border-l-4 border-neutral-medium">
                  <div className="mr-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                      className="h-5 w-5 rounded border-neutral-medium text-secondary"
                    />
                  </div>
                  <div className="flex-grow">
                    <h5 className={`text-neutral-darkest font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.assignment.title}
                    </h5>
                    <div className="flex items-center text-xs text-neutral-dark mt-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span className="mr-3">{task.class.name}</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="mr-3">{formatDueDate(task.assignment.dueDate)}</span>
                      <span className={`mr-1 ${getTaskPriorityColor(task.assignment.priority)}`}>•</span>
                      <span className={getTaskPriorityColor(task.assignment.priority)}>
                        {task.assignment.priority.charAt(0).toUpperCase() + task.assignment.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-neutral-dark hover:text-neutral-darkest ml-2 p-1 h-auto">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </>
          )}
          
          {completedTasks.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-neutral-dark mt-4">Recently Completed</h4>
              
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center bg-neutral-light bg-opacity-30 rounded-lg p-3 border-l-4 border-green-500">
                  <div className="mr-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                      className="h-5 w-5 rounded border-neutral-medium text-secondary"
                    />
                  </div>
                  <div className="flex-grow">
                    <h5 className="text-neutral-darkest font-medium line-through">
                      {task.assignment.title}
                    </h5>
                    <div className="flex items-center text-xs text-neutral-dark mt-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span className="mr-3">{task.class.name}</span>
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500">
                        Completed {task.completedAt ? format(new Date(task.completedAt), "MMM d") : ""}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-neutral-dark hover:text-neutral-darkest ml-2 p-1 h-auto">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </>
          )}
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-neutral-dark">
              <p>No tasks available for the selected class.</p>
            </div>
          )}
        </div>
        
        <Link href="/student/tasks">
          <Button variant="link" className="mt-4 text-secondary hover:text-secondary-dark text-sm flex items-center p-0">
            <span>View All Tasks</span>
          </Button>
        </Link>
      </Card>
      
      {/* Progress Summary */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-darkest">My Progress</h3>
          <Link href="/student/progress">
            <Button variant="link" className="text-secondary text-sm hover:underline p-0">
              View Detailed Report
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-neutral-light rounded-lg p-4">
            <h4 className="text-neutral-dark text-sm mb-3">Task Completion by Class</h4>
            <div className="space-y-3">
              {studentData?.progress?.map(prog => (
                <div key={prog.className}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-darkest">{prog.className}</span>
                    <span className="text-neutral-dark">{Math.round(prog.percentage)}%</span>
                  </div>
                  <div className="w-full bg-neutral-light rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {(!studentData?.progress || studentData.progress.length === 0) && (
                <div className="text-center py-4 text-neutral-dark">
                  <p>No progress data available.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border border-neutral-light rounded-lg p-4">
            <h4 className="text-neutral-dark text-sm mb-3">Weekly Overview</h4>
            <div className="h-40 flex items-end justify-between px-2">
              {/* This would ideally be real data from the backend */}
              <DayBar day="Mon" percentage={30} isToday={false} />
              <DayBar day="Tue" percentage={60} isToday={false} />
              <DayBar day="Wed" percentage={40} isToday={false} />
              <DayBar day="Thu" percentage={80} isToday={false} />
              <DayBar day="Fri" percentage={65} isToday={true} />
              <DayBar day="Sat" percentage={20} isToday={false} />
              <DayBar day="Sun" percentage={10} isToday={false} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface DayBarProps {
  day: string;
  percentage: number;
  isToday: boolean;
}

const DayBar = ({ day, percentage, isToday }: DayBarProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-8 rounded-t-sm ${isToday ? 'bg-secondary' : 'bg-neutral-light'}`}
        style={{ height: `${percentage}%` }}
      />
      <span className={`text-xs mt-1 ${isToday ? 'font-medium text-secondary' : 'text-neutral-dark'}`}>
        {day}
      </span>
    </div>
  );
};

// Simple chevron right icon
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default StudentDashboard;
