import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, Check, CalendarDays, BookOpen, Search, MoreVertical, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface Task {
  id: number;
  assignment: {
    id: number;
    title: string;
    description?: string;
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

interface Class {
  id: number;
  name: string;
}

const StudentTasks = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["/api/student/tasks"],
  });
  
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ["/api/classes"],
  });
  
  const tasks = tasksData as Task[];
  const classes = classesData as Class[];
  
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      return apiRequest("PUT", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/student"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });
  
  const handleTaskComplete = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({ taskId, completed });
    
    toast({
      title: completed ? "Task completed" : "Task marked as incomplete",
      description: completed ? "Great job! Task marked as complete." : "Task marked as incomplete.",
      variant: completed ? "default" : "destructive",
    });
  };
  
  const isLoading = isTasksLoading || isClassesLoading;
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  // Filter tasks based on search, class, and tab
  const filteredTasks = tasks
    ? tasks.filter(task => {
        // Search filter
        const matchesSearch = 
          task.assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.class.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.assignment.description && task.assignment.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Class filter
        const matchesClass = selectedClass === "all" || task.class.id.toString() === selectedClass;
        
        // Tab filter
        const matchesTab = 
          selectedTab === "all" || 
          (selectedTab === "pending" && !task.completed) ||
          (selectedTab === "completed" && task.completed);
        
        return matchesSearch && matchesClass && matchesTab;
      })
    : [];
  
  // Sort tasks by due date (pending tasks) or completion date (completed tasks)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed && b.completed) {
      // Sort completed tasks by completion date (newest first)
      return new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime();
    } else if (!a.completed && !b.completed) {
      // Sort pending tasks by due date (earliest first)
      return new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime();
    } else {
      // Pending tasks before completed tasks
      return a.completed ? 1 : -1;
    }
  });
  
  // Group tasks by due date status (today, upcoming, overdue)
  const todayTasks = sortedTasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.assignment.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });
  
  const upcomingTasks = sortedTasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.assignment.dueDate);
    const today = new Date();
    return dueDate > today && dueDate.toDateString() !== today.toDateString();
  });
  
  const overdueTasks = sortedTasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.assignment.dueDate);
    const today = new Date();
    return dueDate < today && dueDate.toDateString() !== today.toDateString();
  });
  
  const completedTasks = sortedTasks.filter(task => task.completed);
  
  const getPriorityColor = (priority: string) => {
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
  
  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return `Today at ${format(dueDate, "h:mm a")}`;
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(dueDate, "h:mm a")}`;
    } else {
      return format(dueDate, "MMM d 'at' h:mm a");
    }
  };
  
  const formatCompletedDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    
    const completedDate = new Date(dateString);
    const today = new Date();
    
    if (completedDate.toDateString() === today.toDateString()) {
      return `Today at ${format(completedDate, "h:mm a")}`;
    } else {
      return format(completedDate, "MMM d 'at' h:mm a");
    }
  };
  
  const renderTaskList = (taskList: Task[], statusLabel?: string) => {
    return (
      <>
        {statusLabel && (
          <h3 className="text-sm font-medium text-neutral-dark mt-4 mb-2">{statusLabel}</h3>
        )}
        
        {taskList.length > 0 ? (
          <div className="space-y-3">
            {taskList.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center rounded-lg p-3 border-l-4 ${
                  task.completed 
                    ? "bg-neutral-light bg-opacity-30 border-green-500" 
                    : statusLabel === "Overdue"
                    ? "bg-neutral-light bg-opacity-50 border-red-500"
                    : statusLabel === "Due Today"
                    ? "bg-neutral-light bg-opacity-50 border-amber-500"
                    : "bg-neutral-light bg-opacity-50 border-neutral-medium"
                }`}
              >
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
                    
                    {task.completed ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-green-500">
                          Completed {formatCompletedDate(task.completedAt)}
                        </span>
                      </>
                    ) : (
                      <>
                        {statusLabel === "Overdue" ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                            <span className="mr-3 text-red-500">
                              {formatDueDate(task.assignment.dueDate)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="mr-3">{formatDueDate(task.assignment.dueDate)}</span>
                          </>
                        )}
                        <span className={`mr-1 ${getPriorityColor(task.assignment.priority)}`}>•</span>
                        <span className={getPriorityColor(task.assignment.priority)}>
                          {task.assignment.priority.charAt(0).toUpperCase() + task.assignment.priority.slice(1)} Priority
                        </span>
                      </>
                    )}
                  </div>
                  {task.assignment.description && (
                    <p className="text-xs text-neutral-dark mt-1">
                      {task.assignment.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-neutral-dark hover:text-neutral-darkest ml-2 p-1 h-auto">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTaskComplete(task.id, !task.completed)}>
                      {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-dark">
            <p>No tasks found in this category</p>
          </div>
        )}
      </>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading tasks...</p>
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
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <CardTitle>All Tasks</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-neutral-light w-full md:w-auto"
                />
              </div>
              
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-neutral-light w-full md:w-[180px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map(cls => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {overdueTasks.length > 0 && renderTaskList(overdueTasks, "Overdue")}
              {todayTasks.length > 0 && renderTaskList(todayTasks, "Due Today")}
              {upcomingTasks.length > 0 && renderTaskList(upcomingTasks, "Upcoming")}
              {completedTasks.length > 0 && renderTaskList(completedTasks, "Completed")}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-neutral-dark">
                  <p>No tasks found for the selected filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {overdueTasks.length > 0 && renderTaskList(overdueTasks, "Overdue")}
              {todayTasks.length > 0 && renderTaskList(todayTasks, "Due Today")}
              {upcomingTasks.length > 0 && renderTaskList(upcomingTasks, "Upcoming")}
              
              {overdueTasks.length === 0 && todayTasks.length === 0 && upcomingTasks.length === 0 && (
                <div className="text-center py-8 text-neutral-dark">
                  <p>No pending tasks found for the selected filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedTasks.length > 0 ? renderTaskList(completedTasks) : (
                <div className="text-center py-8 text-neutral-dark">
                  <p>No completed tasks found for the selected filters</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Task Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>My Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-neutral-dark">Class Progress</h4>
              {classes && classes.map(cls => {
                const classTotal = tasks?.filter(task => task.class.id === cls.id).length || 0;
                const classCompleted = tasks?.filter(task => task.class.id === cls.id && task.completed).length || 0;
                const percentage = classTotal > 0 ? (classCompleted / classTotal) * 100 : 0;
                
                return (
                  <div key={cls.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-darkest">{cls.name}</span>
                      <span className="text-neutral-dark">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-neutral-light rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {(!classes || classes.length === 0) && (
                <div className="text-center py-4 text-neutral-dark">
                  <p>No classes available</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-neutral-dark mb-4">Task Status</h4>
              <div className="aspect-square max-w-[200px] mx-auto">
                <div className="relative h-full w-full rounded-full">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="15"
                    />
                    
                    {/* Progress circle */}
                    {tasks && tasks.length > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(207, 90%, 54%)"
                        strokeWidth="15"
                        strokeDasharray={`${(tasks.filter(t => t.completed).length / tasks.length) * 251.2} 251.2`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">
                      {tasks && tasks.length > 0
                        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
                        : 0}%
                    </span>
                    <span className="text-sm text-neutral-dark">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTasks;
