import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Trophy, Clock } from "lucide-react";

interface Student {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
  gradeLevel: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  xpReward: number;
  studentId: string;
  description?: string;
}

const TeacherDashboard = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Mock students data
  const students: Student[] = [
    { id: "1", name: "Emma Johnson", avatar: "👧", level: 2, xp: 340, totalXp: 500, gradeLevel: "2nd Grade" },
    { id: "2", name: "Liam Smith", avatar: "👦", level: 5, xp: 720, totalXp: 1000, gradeLevel: "5th Grade" },
    { id: "3", name: "Sophia Davis", avatar: "👩", level: 7, xp: 1250, totalXp: 1500, gradeLevel: "7th Grade" },
    { id: "4", name: "Noah Wilson", avatar: "🧒", level: 2, xp: 180, totalXp: 500, gradeLevel: "2nd Grade" },
    { id: "5", name: "Olivia Brown", avatar: "👧", level: 5, xp: 480, totalXp: 1000, gradeLevel: "5th Grade" }
  ];

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Math Practice - Addition",
      subject: "Mathematics",
      dueDate: "2024-01-15",
      priority: "high",
      completed: false,
      xpReward: 50,
      studentId: "1",
      description: "Complete 20 addition problems",
    },
    {
      id: "2",
      title: "Read Chapter 3",
      subject: "Reading",
      dueDate: "2024-01-15",
      priority: "medium",
      completed: true,
      xpReward: 30,
      studentId: "2",
    },
    {
      id: "3",
      title: "Science Experiment",
      subject: "Science",
      dueDate: "2024-01-16",
      priority: "low",
      completed: false,
      xpReward: 75,
      studentId: "3",
    },
    {
      id: "4",
      title: "History Timeline",
      subject: "History",
      dueDate: "2024-01-17",
      priority: "medium",
      completed: false,
      xpReward: 40,
      studentId: "3",
    },
    {
      id: "5",
      title: "Art Project",
      subject: "Art",
      dueDate: "2024-01-18",
      priority: "low",
      completed: true,
      xpReward: 35,
      studentId: "4",
    }
  ]);

  const toggleTaskCompletion = (taskId: string) => {
    setAssignments(assignments.map((task) => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case "mathematics":
        return "🔢";
      case "reading":
        return "📚";
      case "science":
        return "🔬";
      case "history":
        return "🏛️";
      case "art":
        return "🎨";
      default:
        return "📖";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-drift-sand to-fern-mist p-4" style={{
      background: "linear-gradient(135deg, hsl(var(--drift-sand)) 0%, hsl(var(--fern-mist)) 100%)"
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-charcoal-slate" style={{color: "hsl(var(--charcoal-slate))"}}>Pebble Track Dashboard</h1>
          <Button 
            onClick={() => setShowTaskModal(true)}
            className="bg-moss-green hover:bg-moss-green/90 text-white"
            style={{
              backgroundColor: "hsl(var(--moss-green))",
              color: "white"
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </div>

        {/* Student Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {students.map((student) => {
            const studentTasks = assignments.filter((task) => task.studentId === student.id);
            const completedTasks = studentTasks.filter((task) => task.completed).length;
            const totalTasks = studentTasks.length;
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{student.avatar}</span>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <p className="text-sm text-gray-600">{student.gradeLevel} • Level {student.level}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>XP Progress</span>
                        <span>
                          {student.xp}/{student.totalXp}
                        </span>
                      </div>
                      <Progress value={(student.xp / student.totalXp) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tasks Completed</span>
                        <span>
                          {completedTasks}/{totalTasks}
                        </span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Today's XP
                      </span>
                      <span className="font-semibold">
                        {studentTasks.filter((t) => t.completed).reduce((sum, t) => sum + t.xpReward, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Assignments Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((task) => {
                const student = students.find((s) => s.id === task.studentId);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all ${
                      task.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getSubjectIcon(task.subject)}</span>
                          <div>
                            <h3 className={`font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {student?.name} • {task.subject}
                            </p>
                          </div>
                        </div>
                        {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-purple-600">
                            <Trophy className="w-4 h-4" />
                            {task.xpReward} XP
                          </span>
                        </div>
                      </div>
                      <Button
                        variant={task.completed ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {task.completed ? "Completed" : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;