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

  // Function to handle class completion
  const handleClassComplete = (className: string, isCompleted: boolean) => {
    toast({
      title: isCompleted ? "Class Complete!" : "Class Reopened",
      description: isCompleted ? `Great work on ${className}!` : `${className} has been reopened.`,
    });
  };

  // Function to get class icons
  const getClassIcon = (className: string) => {
    switch (className.toLowerCase()) {
      case 'math':
        return '🔢';
      case 'science':
        return '🔬';
      case 'reading':
        return '📚';
      case 'history':
        return '🏛️';
      case 'english':
        return '✍️';
      case 'art':
        return '🎨';
      case 'music':
        return '🎵';
      case 'pe':
      case 'physical education':
        return '⚽';
      default:
        return '📖';
    }
  };

  // Function to get class colors
  const getClassColor = (className: string) => {
    switch (className.toLowerCase()) {
      case 'math':
        return 'bg-blue-500';
      case 'science':
        return 'bg-purple-500';
      case 'reading':
        return 'bg-green-500';
      case 'history':
        return 'bg-amber-500';
      case 'english':
        return 'bg-red-500';
      case 'art':
        return 'bg-pink-500';
      case 'music':
        return 'bg-indigo-500';
      case 'pe':
      case 'physical education':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
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
      
      {/* Daily Class Checklist */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-secondary/20">
        <h2 className="text-3xl font-bold text-center mb-8 text-secondary">Today's Classes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentData.progress.map(classItem => {
            const isCompleted = Math.random() > 0.5; // This will be replaced with real completion status
            return (
              <button
                key={classItem.className}
                onClick={() => handleClassComplete(classItem.className, !isCompleted)}
                className={`relative p-8 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-green-200' 
                    : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-blue-200 hover:shadow-xl'
                }`}
              >
                {/* Class Icon */}
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl ${
                    isCompleted ? 'bg-green-500' : getClassColor(classItem.className)
                  }`}>
                    {getClassIcon(classItem.className)}
                  </div>
                </div>
                
                {/* Class Name */}
                <h3 className={`text-2xl font-bold text-center mb-4 ${
                  isCompleted ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {classItem.className}
                </h3>
                
                {/* Completion Status */}
                <div className="text-center">
                  {isCompleted ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Complete!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-bold text-blue-600">Tap to Complete</span>
                    </div>
                  )}
                </div>
                
                {/* Completion Checkmark Overlay */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* All Complete Message */}
        {studentData.progress.every(() => Math.random() > 0.7) && (
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-100 to-yellow-100 rounded-xl border-2 border-green-300">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-3xl font-bold text-green-700 mb-2">Amazing Work!</h3>
            <p className="text-xl text-green-600">You completed all your classes today!</p>
          </div>
        )}
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