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
    completedTasks: 3,
    pendingTasks: 5,
    dueTodayTasks: 3,
    totalClasses: 4,
    progress: [
      { className: "Math", percentage: 75 },
      { className: "Science", percentage: 60 },
      { className: "Reading", percentage: 90 },
      { className: "History", percentage: 45 }
    ]
  };
  
  // Mock tasks data - kid-friendly tasks
  const tasks: Task[] = [
    {
      id: 1,
      assignment: {
        id: 101,
        title: "Practice Addition Problems",
        dueDate: new Date().toISOString(),
        priority: "high"
      },
      class: {
        id: 1,
        name: "Math"
      },
      completed: false,
      completedAt: null
    },
    {
      id: 2,
      assignment: {
        id: 102,
        title: "Read 20 Minutes",
        dueDate: new Date().toISOString(),
        priority: "medium" 
      },
      class: {
        id: 3,
        name: "Reading"
      },
      completed: false,
      completedAt: null
    },
    {
      id: 3,
      assignment: {
        id: 103,
        title: "Science Journal Entry",
        dueDate: new Date().toISOString(),
        priority: "low"
      },
      class: {
        id: 2,
        name: "Science" 
      },
      completed: false,
      completedAt: null
    },
    {
      id: 4,
      assignment: {
        id: 104,
        title: "Spelling Practice",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: "high"
      },
      class: {
        id: 3,
        name: "Reading"
      },
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 5,
      assignment: {
        id: 105,
        title: "Math Worksheet",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: "medium"
      },
      class: {
        id: 1,
        name: "Math"
      },
      completed: true,
      completedAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  // Filter tasks by completion status
  const todayTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed).slice(0, 3);
  
  // Function to handle task completion toggle
  const handleTaskComplete = (taskId: number, isCompleted: boolean) => {
    toast({
      title: isCompleted ? "Great job!" : "Task reopened",
      description: isCompleted ? "You completed a task! Keep going!" : "Task has been reopened.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading your tasks...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Kid-friendly header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">My Learning Adventures!</h1>
        <p className="text-lg text-neutral-dark">Today is <span className="font-medium text-secondary">{currentDate}</span></p>
        <div className="mt-4 text-xl">
          <span className="text-green-600">Completed: {studentData?.completedTasks || 0} tasks!</span>
          <span className="mx-4">•</span>
          <span className="text-blue-600">To do: {studentData?.pendingTasks || 0} tasks!</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary/20">
        <h2 className="text-2xl font-bold text-center mb-4 text-primary">Today's Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-8 mb-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500"
            style={{ width: `${Math.round(((studentData?.completedTasks || 0) / ((studentData?.completedTasks || 0) + (studentData?.pendingTasks || 1))) * 100)}%` }}
          >
            {Math.round(((studentData?.completedTasks || 0) / ((studentData?.completedTasks || 0) + (studentData?.pendingTasks || 1))) * 100)}%
          </div>
        </div>
        <p className="text-center text-lg text-neutral-dark">
          You've completed <span className="font-bold text-green-600">{studentData?.completedTasks || 0}</span> out of <span className="font-bold text-blue-600">{(studentData?.completedTasks || 0) + (studentData?.pendingTasks || 0)}</span> tasks today!
        </p>
      </div>
      
      {/* Daily Checklist */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-secondary/20">
        <h2 className="text-3xl font-bold text-center mb-6 text-secondary">My Daily Checklist</h2>
        
        <div className="space-y-4">
          {todayTasks.length > 0 && (
            <>
              <h3 className="text-2xl font-bold text-orange-600 mb-4 text-center">Today's Tasks</h3>
              
              {todayTasks.map(task => (
                <div key={task.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center">
                    <div className="mr-6">
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                        className="h-8 w-8 rounded-lg border-2 border-orange-300 text-orange-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className={`text-xl font-bold mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.assignment.title}
                      </h4>
                      <div className="flex items-center text-lg text-gray-600">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-medium">{task.class.name}</span>
                      </div>
                    </div>
                    {task.completed && (
                      <div className="text-4xl">✅</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          
          {todayTasks.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Great job!</h3>
              <p className="text-lg text-gray-600">All your tasks are complete!</p>
              <div className="text-6xl mt-4">🎉</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Celebration Section */}
      {completedTasks.length > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 shadow-lg border-2 border-green-200">
          <h3 className="text-2xl font-bold text-green-700 mb-4 text-center">Recently Completed!</h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🎉</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 line-through">{task.assignment.title}</h4>
                    <p className="text-gray-600">{task.class.name} - Completed!</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;