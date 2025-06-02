import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAvatarById } from "@/lib/avatars";
import {
  ArrowLeft,
  Star,
  Trophy,
  CheckCircle2,
  BookOpen,
  Calculator,
  Palette,
  Microscope,
  PenTool,
  Activity,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
}

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  xpReward: number;
  studentId: string;
  description?: string;
  icon: any;
  color: string;
}

interface StudentDashboardProps {
  studentId?: number;
}

const StudentDashboard = ({ studentId }: StudentDashboardProps) => {
  // Fetch actual student data
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
  });

  const student = students?.find((s: any) => s.id === studentId) || students?.[0];
  
  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

  // Get the student's nature avatar
  const studentAvatar = getAvatarById(student.avatar);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Math Practice",
      subject: "Mathematics",
      dueDate: "2024-01-15",
      priority: "high",
      completed: false,
      xpReward: 50,
      studentId: student.id.toString(),
      icon: Calculator,
      color: "from-stream-blue/20 to-stream-blue/30 hover:from-stream-blue/30 hover:to-stream-blue/40 border-stream-blue/40",
    },
    {
      id: "2",
      title: "Read a Story",
      subject: "Reading",
      dueDate: "2024-01-15",
      priority: "medium",
      completed: false,
      xpReward: 30,
      studentId: student.id,
      icon: BookOpen,
      color: "from-moss-green/20 to-moss-green/30 hover:from-moss-green/30 hover:to-moss-green/40 border-moss-green/40",
    },
    {
      id: "3",
      title: "Create Art",
      subject: "Art",
      dueDate: "2024-01-16",
      priority: "low",
      completed: false,
      xpReward: 25,
      studentId: student.id,
      icon: Palette,
      color: "from-fern-mist/40 to-fern-mist/60 hover:from-fern-mist/50 hover:to-fern-mist/70 border-fern-mist/60",
    },
    {
      id: "4",
      title: "Science Exploration",
      subject: "Science",
      dueDate: "2024-01-16",
      priority: "medium",
      completed: false,
      xpReward: 40,
      studentId: student.id,
      icon: Microscope,
      color: "from-stream-blue/15 to-moss-green/25 hover:from-stream-blue/25 hover:to-moss-green/35 border-moss-green/50",
    },
    {
      id: "5",
      title: "Writing Practice",
      subject: "Writing",
      dueDate: "2024-01-16",
      priority: "medium",
      completed: false,
      xpReward: 35,
      studentId: student.id,
      icon: PenTool,
      color: "from-pebble-gray/20 to-pebble-gray/30 hover:from-pebble-gray/30 hover:to-pebble-gray/40 border-pebble-gray/50",
    },
    {
      id: "6",
      title: "Physical Activity",
      subject: "Physical Education",
      dueDate: "2024-01-16",
      priority: "low",
      completed: false,
      xpReward: 20,
      studentId: student.id,
      icon: Activity,
      color: "from-moss-green/15 to-stream-blue/25 hover:from-moss-green/25 hover:to-stream-blue/35 border-stream-blue/50",
    },
  ]);

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && !task.completed) {
          setCelebrationMessage(`Well done! +${task.xpReward} XP earned`);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          return { ...task, completed: true };
        }
        return task;
      }),
    );
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const todayXP = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.xpReward, 0);

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, hsl(var(--drift-sand)) 0%, hsl(var(--fern-mist)) 100%)"
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div 
              className="text-white px-12 py-6 rounded-2xl text-2xl font-semibold animate-bounce shadow-2xl border border-white"
              style={{
                background: "linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--stream-blue)))"
              }}
            >
              {celebrationMessage}
            </div>
          </div>
        )}

        {/* Title Card */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-lg" style={{borderColor: "hsl(var(--fern-mist))"}}>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: studentAvatar?.backgroundColor || '#3E4A59'
                }}
              >
                {studentAvatar?.emoji || '👦'}
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{color: "hsl(var(--charcoal-slate))"}}>
                  {student.fullName}'s Learning Path
                </h1>
                <p className="text-xl" style={{color: "hsl(var(--pebble-gray))"}}>
                  Level {student.level || 1} Explorer
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              className="rounded-2xl p-4 shadow-inner mb-6"
              style={{
                backgroundColor: "hsl(var(--fern-mist))",
                borderColor: "hsl(var(--fern-mist))"
              }}
            >
              <div className="flex justify-between text-lg font-semibold mb-3 px-2">
                <span style={{color: "hsl(var(--charcoal-slate))"}}>Today's Progress</span>
                <span style={{color: "hsl(var(--charcoal-slate))"}}>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <Progress 
                value={(completedTasks / totalTasks) * 100} 
                className="h-4"
                style={{
                  backgroundColor: "hsl(var(--drift-sand))"
                }}
              />
            </div>

            {/* Stats Display */}
            <div className="flex justify-center gap-6">
              <div 
                className="rounded-xl px-6 py-4 shadow-md border"
                style={{
                  backgroundColor: "white",
                  borderColor: "hsl(var(--moss-green))"
                }}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6" style={{color: "hsl(var(--moss-green))"}} />
                  <span className="text-xl font-semibold" style={{color: "hsl(var(--charcoal-slate))"}}>
                    {todayXP} XP Today
                  </span>
                </div>
              </div>
              <div 
                className="rounded-xl px-6 py-4 shadow-md border"
                style={{
                  backgroundColor: "white",
                  borderColor: "hsl(var(--stream-blue))"
                }}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6" style={{color: "hsl(var(--stream-blue))"}} />
                  <span className="text-xl font-semibold" style={{color: "hsl(var(--charcoal-slate))"}}>
                    Level {student.level}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Buttons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <button
                key={task.id}
                onClick={() => !task.completed && toggleTaskCompletion(task.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  task.completed
                    ? "border-4 shadow-lg"
                    : "border-2 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                }`}
                style={{
                  background: task.completed 
                    ? "linear-gradient(to bottom right, hsl(var(--moss-green) / 0.3), hsl(var(--moss-green) / 0.5))"
                    : `hsl(var(--drift-sand))`,
                  borderColor: task.completed 
                    ? "hsl(var(--moss-green))"
                    : "hsl(var(--fern-mist))"
                }}
                disabled={task.completed}
              >
                {/* Checkbox */}
                <div className="absolute top-4 left-4">
                  <div
                    className={`w-6 h-6 border-2 rounded-md flex items-center justify-center ${
                      task.completed 
                        ? "border-2" 
                        : "bg-white"
                    }`}
                    style={{
                      backgroundColor: task.completed ? "hsl(var(--moss-green))" : "white",
                      borderColor: task.completed ? "hsl(var(--moss-green))" : "hsl(var(--pebble-gray))"
                    }}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>

                {/* XP Badge */}
                <div className="absolute top-4 right-4">
                  <div 
                    className="text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md"
                    style={{backgroundColor: "hsl(var(--charcoal-slate))"}}
                  >
                    <Trophy className="w-3 h-3" />
                    {task.xpReward}
                  </div>
                </div>

                {/* Task Content */}
                <div className="flex items-center gap-4 mt-8">
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md border"
                    style={{
                      backgroundColor: "white",
                      borderColor: "hsl(var(--fern-mist))"
                    }}
                  >
                    <IconComponent className="w-8 h-8" style={{color: "hsl(var(--charcoal-slate))"}} />
                  </div>

                  {/* Task Text */}
                  <div className="flex-1 text-left">
                    <h3
                      className={`text-2xl font-bold mb-1 ${
                        task.completed ? "line-through" : ""
                      }`}
                      style={{
                        color: task.completed 
                          ? "hsl(var(--pebble-gray))" 
                          : "hsl(var(--charcoal-slate))",
                        fontFamily: "Comic Sans MS, cursive"
                      }}
                    >
                      {task.title}
                    </h3>
                    <p 
                      className="text-lg"
                      style={{
                        color: "hsl(var(--pebble-gray))",
                        fontFamily: "Comic Sans MS, cursive"
                      }}
                    >
                      {task.subject}
                    </p>
                  </div>
                </div>

                {/* Completion Overlay */}
                {task.completed && (
                  <div className="absolute inset-0 bg-opacity-10 rounded-2xl flex items-center justify-center">
                    <div 
                      className="text-white px-4 py-2 rounded-xl text-lg font-semibold shadow-lg"
                      style={{backgroundColor: "hsl(var(--moss-green))"}}
                    >
                      ✓ Complete
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Encouragement Message */}
        <Card 
          className="mt-8 border"
          style={{
            background: "linear-gradient(to right, hsl(var(--fern-mist) / 0.5), hsl(var(--stream-blue) / 0.3))",
            borderColor: "hsl(var(--moss-green))"
          }}
        >
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2" style={{color: "hsl(var(--charcoal-slate))"}}>
              Keep Growing, {student.fullName}!
            </h3>
            <p className="text-lg mb-4" style={{color: "hsl(var(--pebble-gray))"}}>
              {completedTasks === totalTasks
                ? "Excellent work! You've completed all your tasks today."
                : `You're making great progress. ${totalTasks - completedTasks} more to go!`}
            </p>
            
            {/* Parent Access Button */}
            <div className="mt-6 pt-4 border-t" style={{borderColor: "hsl(var(--fern-mist))"}}>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="text-sm px-4 py-2"
                style={{
                  borderColor: "hsl(var(--pebble-gray))",
                  color: "hsl(var(--pebble-gray))"
                }}
              >
                Parent Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;