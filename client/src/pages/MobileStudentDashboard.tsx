import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Target, BookOpen, Star, TrendingUp } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import MobileStudentCard from "@/components/MobileStudentCard";
import TouchFriendlyCard from "@/components/TouchFriendlyCard";
import NotificationPermissionDialog from "@/components/NotificationPermissionDialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { getAvatarForStudent } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

interface StudentData {
  id: number;
  fullName: string;
  gradeLevel: string;
  level: number;
  xp: number;
  totalXp: number;
}

const MobileStudentDashboard = () => {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const queryClient = useQueryClient();

  // Fetch student data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    retry: false,
  });

  // Fetch assignments/tasks for the selected student
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/tasks", selectedStudent?.id],
    enabled: !!selectedStudent,
    retry: false,
  });

  // Toggle assignment completion
  const toggleAssignmentMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: "PATCH",
        body: { completed }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Set initial student selection
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // Check notification permission on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        setShowNotificationDialog(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleToggleComplete = (assignmentId: number) => {
    const assignment = assignments.find((a: Assignment) => a.id === assignmentId);
    if (assignment) {
      toggleAssignmentMutation.mutate({
        id: assignmentId,
        completed: !assignment.completed
      });
    }
  };

  if (studentsLoading) {
    return (
      <MobileLayout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (!selectedStudent) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Students Found</h2>
          <p className="text-gray-600">Ask your parent to add you to the system.</p>
        </div>
      </MobileLayout>
    );
  }

  const avatar = getAvatarForStudent(selectedStudent.fullName);
  const completedAssignments = assignments.filter((a: Assignment) => a.completed).length;
  const totalAssignments = assignments.length;
  const progressPercentage = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  const todayAssignments = assignments.filter((a: Assignment) => {
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString() && !a.completed;
  });

  const upcomingAssignments = assignments.filter((a: Assignment) => {
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate >= tomorrow && !a.completed;
  }).slice(0, 3);

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Student Header */}
        <TouchFriendlyCard className="bg-gradient-to-r from-[#8BA88E] to-[#A8C7DD] text-white">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {avatar.emoji}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-comic-sans">{selectedStudent.fullName}</h1>
              <p className="text-white/90">Grade {selectedStudent.gradeLevel}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">Level {selectedStudent.level} • {selectedStudent.xp} XP</span>
              </div>
            </div>
          </div>
        </TouchFriendlyCard>

        {/* Progress Overview */}
        <TouchFriendlyCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-comic-sans">Today's Progress</h2>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>{completedAssignments} of {totalAssignments}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="progress-leaf" />
              <p className="text-sm text-center text-gray-600">
                {progressPercentage.toFixed(0)}% Complete • Keep going!
              </p>
            </div>
          </div>
        </TouchFriendlyCard>

        {/* Today's Tasks */}
        {todayAssignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-comic-sans flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#8BA88E]" />
              <span>Due Today</span>
            </h2>
            {todayAssignments.map((assignment: Assignment) => (
              <MobileStudentCard
                key={assignment.id}
                assignment={assignment}
                studentName={selectedStudent.fullName}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}

        {/* Upcoming Tasks */}
        {upcomingAssignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-comic-sans flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#8BA88E]" />
              <span>Coming Up</span>
            </h2>
            {upcomingAssignments.map((assignment: Assignment) => (
              <MobileStudentCard
                key={assignment.id}
                assignment={assignment}
                studentName={selectedStudent.fullName}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}

        {/* All Assignments */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-comic-sans flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#8BA88E]" />
              <span>All Assignments</span>
            </h2>
            {assignments.map((assignment: Assignment) => (
              <MobileStudentCard
                key={assignment.id}
                assignment={assignment}
                studentName={selectedStudent.fullName}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {assignments.length === 0 && !assignmentsLoading && (
          <TouchFriendlyCard>
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">Your assignments will appear here when your teacher adds them.</p>
            </div>
          </TouchFriendlyCard>
        )}

        {/* Student Switcher (if multiple students) */}
        {students.length > 1 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Switch Student</h3>
            <div className="grid grid-cols-2 gap-3">
              {students.map((student: StudentData) => {
                const studentAvatar = getAvatarForStudent(student.fullName);
                return (
                  <TouchFriendlyCard
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "text-center touch-feedback",
                      selectedStudent?.id === student.id && "ring-2 ring-[#8BA88E]"
                    )}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg"
                      style={{ backgroundColor: studentAvatar.backgroundColor }}
                    >
                      {studentAvatar.emoji}
                    </div>
                    <p className="font-medium text-sm">{student.fullName}</p>
                  </TouchFriendlyCard>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notification Permission Dialog */}
      <NotificationPermissionDialog
        open={showNotificationDialog}
        onOpenChange={setShowNotificationDialog}
        onPermissionGranted={() => {
          console.log('Notifications enabled for student dashboard');
        }}
      />
    </MobileLayout>
  );
};

export default MobileStudentDashboard;