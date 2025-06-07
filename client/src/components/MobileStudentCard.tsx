import { CheckCircle, Clock, BookOpen, Target } from "lucide-react";
import TouchFriendlyCard from "./TouchFriendlyCard";
import { cn } from "@/lib/utils";
import { getAvatarForStudent } from "@/lib/avatars";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

interface MobileStudentCardProps {
  assignment: Assignment;
  studentName: string;
  onToggleComplete: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

const MobileStudentCard = ({ 
  assignment, 
  studentName, 
  onToggleComplete,
  onViewDetails 
}: MobileStudentCardProps) => {
  const avatar = getAvatarForStudent(studentName);
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = !assignment.completed && dueDate < new Date();
  const isDueToday = !assignment.completed && 
    dueDate.toDateString() === new Date().toDateString();

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800", 
    hard: "bg-red-100 text-red-800"
  };

  const getCardVariant = () => {
    if (assignment.completed) return "success";
    if (isOverdue) return "warning";
    if (isDueToday) return "info";
    return "default";
  };

  return (
    <TouchFriendlyCard
      variant={getCardVariant()}
      className="student-card touch-feedback focus-ring"
      onClick={() => onViewDetails?.(assignment.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar and completion status */}
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {avatar.emoji}
          </div>
          {assignment.completed && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Assignment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-lg leading-tight mb-2",
                "font-comic-sans",
                assignment.completed && "line-through text-gray-500"
              )}>
                {assignment.title}
              </h3>
              
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-[#8BA88E]" />
                <span className="text-sm font-medium text-[#8BA88E]">
                  {assignment.subject}
                </span>
                {assignment.difficulty && (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    difficultyColors[assignment.difficulty]
                  )}>
                    {assignment.difficulty}
                  </span>
                )}
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {assignment.description}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className={cn(
                    "w-4 h-4",
                    isOverdue ? "text-red-500" : isDueToday ? "text-yellow-500" : "text-gray-500"
                  )} />
                  <span className={cn(
                    isOverdue ? "text-red-600 font-medium" : 
                    isDueToday ? "text-yellow-600 font-medium" : "text-gray-600"
                  )}>
                    {isOverdue ? "Overdue" : 
                     isDueToday ? "Due Today" : 
                     `Due ${dueDate.toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(assignment.id);
              }}
              className={cn(
                "touch-target flex-shrink-0 rounded-full p-3 transition-all duration-200",
                "focus-ring touch-feedback",
                assignment.completed 
                  ? "bg-green-100 text-green-600 hover:bg-green-200" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              )}
              aria-label={assignment.completed ? "Mark incomplete" : "Mark complete"}
            >
              <Target className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </TouchFriendlyCard>
  );
};

export default MobileStudentCard;