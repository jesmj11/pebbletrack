import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Check,
  X,
  GripVertical,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvatarForStudent } from "@/lib/avatars";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";

interface PlannerTask {
  id: string;
  studentId: number;
  day: string;
  time: string;
  subject: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in_progress';
  type: 'lesson' | 'assignment' | 'activity' | 'assessment';
}

const Planner = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{studentId: number, day: string} | null>(null);
  const { toast } = useToast();

  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser?.role === "parent",
  });

  // Get week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)); // Monday to Friday

  // Sample planner data with proper subject hierarchy
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([
    {
      id: '1',
      studentId: 1, // Bryton
      day: 'Monday',
      time: '9:00 AM',
      subject: 'Math K-7',
      title: 'Multiplication Tables',
      description: 'Practice times tables 6-8',
      status: 'completed',
      type: 'lesson'
    },
    {
      id: '2',
      studentId: 1,
      day: 'Monday',
      time: '10:30 AM',
      subject: 'Elementary Science',
      title: 'Plant Growth',
      description: 'Observe and record plant changes',
      status: 'in_progress',
      type: 'activity'
    },
    {
      id: '3',
      studentId: 2, // Riley
      day: 'Monday',
      time: '9:00 AM',
      subject: 'Reading K-5',
      title: 'Chapter 3 Discussion',
      description: 'Read and discuss main characters',
      status: 'pending',
      type: 'lesson'
    },
    {
      id: '4',
      studentId: 1,
      day: 'Tuesday',
      time: '9:00 AM',
      subject: 'History',
      title: 'Ancient Egypt',
      description: 'Learn about pyramids and pharaohs',
      status: 'pending',
      type: 'lesson'
    },
    {
      id: '5',
      studentId: 3, // Levi
      day: 'Wednesday',
      time: '2:00 PM',
      subject: 'Art',
      title: 'Nature Drawing',
      description: 'Draw trees and flowers from garden',
      status: 'pending',
      type: 'activity'
    }
  ]);

  const getTasksForCell = (studentId: number, day: string) => {
    return plannerTasks.filter(task => 
      task.studentId === studentId && task.day === day
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#D9E5D1] text-[#8BA88E] border-[#8BA88E]';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in_progress': return <Clock className="h-3 w-3" />;
      case 'pending': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Math': '#8BA88E',
      'Science': '#A8C7DD',
      'Reading': '#D9E5D1',
      'History': '#F5F2EA',
      'Art': '#7E8A97',
      'Music': '#A8C7DD',
      'PE': '#8BA88E'
    };
    return colors[subject] || '#F5F2EA';
  };

  const handleAddTask = (studentId: number, day: string) => {
    setSelectedCell({ studentId, day });
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: PlannerTask) => {
    setEditingTask(task);
    setSelectedCell({ studentId: task.studentId, day: task.day });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<PlannerTask>) => {
    if (editingTask) {
      // Update existing task
      setPlannerTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    } else {
      // Add new task
      const newTask: PlannerTask = {
        id: Date.now().toString(),
        studentId: selectedCell!.studentId,
        day: selectedCell!.day,
        time: '9:00 AM', // Default time since we removed time selection
        subject: taskData.subject || 'Math K-7',
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: 'pending',
        type: taskData.type || 'lesson'
      };
      setPlannerTasks(prev => [...prev, newTask]);
      toast({
        title: "Task added",
        description: "A new task has been added to the planner.",
      });
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedCell(null);
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'completed' | 'in_progress') => {
    setPlannerTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setPlannerTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed from the planner.",
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  if (!students || students.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#3E4A59] mb-2">No Students Found</h3>
          <p className="text-[#7E8A97]">Add students to start planning their weekly schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Weekly Planner
          </h2>
          <p className="text-[#7E8A97] mt-1">
            Plan and track your family's weekly learning schedule
          </p>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => navigateWeek('prev')}
            className="border-[#D9E5D1] text-[#7E8A97] hover:bg-[#F5F2EA]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold text-[#3E4A59]">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 4), 'MMM d, yyyy')}
            </h3>
            <p className="text-sm text-[#7E8A97]">Week {format(weekStart, 'w')}</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigateWeek('next')}
            className="border-[#D9E5D1] text-[#7E8A97] hover:bg-[#F5F2EA]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Planner Grid */}
      <Card className="border-[#D9E5D1]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D9E5D1]">
                  <th className="p-4 text-left font-semibold text-[#3E4A59] bg-[#F5F2EA] min-w-[120px]">
                    Day
                  </th>
                  {students.map((student: any) => {
                    const avatar = getAvatarForStudent(student.fullName);
                    return (
                      <th 
                        key={student.id} 
                        className="p-4 text-center font-semibold text-[#3E4A59] bg-[#F5F2EA] min-w-[280px]"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                            style={{ backgroundColor: avatar.backgroundColor }}
                          >
                            {avatar.emoji}
                          </div>
                          <div>
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-xs text-[#7E8A97] font-normal">{student.gradeLevel}</div>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {weekDays.map((date, dayIndex) => {
                  const dayName = format(date, 'EEEE');
                  return (
                    <tr key={dayIndex} className="border-b border-[#D9E5D1]">
                      <td className="p-4 bg-[#F5F2EA] font-medium text-[#3E4A59] min-h-[200px] align-top">
                        <div>
                          <div className="font-semibold">{dayName}</div>
                          <div className="text-sm text-[#7E8A97]">{format(date, 'MMM d')}</div>
                        </div>
                      </td>
                      {students.map((student: any) => {
                        const cellTasks = getTasksForCell(student.id, dayName);
                        return (
                          <td 
                            key={`${dayIndex}-${student.id}`} 
                            className="p-2 align-top min-h-[200px] bg-white hover:bg-[#F5F2EA] transition-colors border-r border-[#D9E5D1]"
                          >
                            <div className="space-y-2 min-h-[180px]">
                              {cellTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                                  style={{ 
                                    backgroundColor: `${getSubjectColor(task.subject)}15`,
                                    borderColor: getSubjectColor(task.subject)
                                  }}
                                  onClick={() => handleEditTask(task)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Badge 
                                        className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextStatus = task.status === 'pending' ? 'in_progress' 
                                            : task.status === 'in_progress' ? 'completed' 
                                            : 'pending';
                                          handleStatusChange(task.id, nextStatus);
                                        }}
                                      >
                                        {getStatusIcon(task.status)}
                                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-[#7E8A97]">{task.time}</span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: getSubjectColor(task.subject) }}
                                      />
                                      <span className="text-xs font-medium text-[#7E8A97]">{task.subject}</span>
                                    </div>
                                    <h4 className="font-medium text-[#3E4A59] text-sm">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-xs text-[#7E8A97] line-clamp-2">{task.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Task Button */}
                              <Button
                                variant="ghost"
                                className="w-full h-12 border-2 border-dashed border-[#D9E5D1] text-[#7E8A97] hover:border-[#8BA88E] hover:text-[#8BA88E] hover:bg-[#D9E5D1]"
                                onClick={() => handleAddTask(student.id, dayName)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                              </Button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setSelectedCell(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
      />
    </div>
  );
};

// Task Modal Component
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: PlannerTask | null;
  onSave: (taskData: Partial<PlannerTask>) => void;
  onDelete?: () => void;
}

const TaskModal = ({ isOpen, onClose, task, onSave, onDelete }: TaskModalProps) => {
  const [formData, setFormData] = useState({
    subject: task?.subject || 'Math K',
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'lesson'
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Math']);

  const subjectHierarchy = {
    'Math': [
      'Math K',
      'Math 1st Grade',
      'Math 2nd Grade', 
      'Math 3rd Grade',
      'Math 4th Grade',
      'Math 5th Grade',
      'Math 6th Grade',
      'Math 7th Grade',
      'Pre-Algebra',
      'Algebra I',
      'Geometry',
      'Algebra II',
      'Trigonometry',
      'Pre-Calculus',
      'Calculus'
    ],
    'Science': [
      'Science K',
      'Science 1st Grade',
      'Science 2nd Grade',
      'Science 3rd Grade', 
      'Science 4th Grade',
      'Science 5th Grade',
      'Science 6th Grade',
      'Science 7th Grade',
      'Science 8th Grade',
      'Earth Science',
      'Life Science',
      'Physical Science',
      'Biology',
      'Chemistry',
      'Physics',
      'Environmental Science'
    ],
    'ELA': [
      'Reading K',
      'Reading 1st Grade',
      'Reading 2nd Grade',
      'Reading 3rd Grade',
      'Reading 4th Grade', 
      'Reading 5th Grade',
      'Language Arts 6th Grade',
      'Language Arts 7th Grade',
      'Language Arts 8th Grade',
      'English 9',
      'English 10',
      'English 11',
      'English 12',
      'Creative Writing',
      'Literature'
    ],
    'Other': [
      'History',
      'Geography',
      'Art',
      'Music',
      'PE',
      'Foreign Language'
    ]
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Update the task details' : 'Create a new task for the selected day'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="text-sm font-medium text-[#3E4A59]">Subject</label>
            <div className="border rounded-md p-2 max-h-32 overflow-y-auto bg-white text-xs">
              {Object.entries(subjectHierarchy).map(([category, subjects]) => (
                <div key={category} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex items-center w-full text-left px-1 py-1 text-xs font-semibold text-[#3E4A59] bg-[#F5F2EA] rounded hover:bg-[#E8E2D5] transition-colors"
                  >
                    <span className="mr-1 text-xs">
                      {expandedCategories.includes(category) ? '▼' : '▶'}
                    </span>
                    {category}
                  </button>
                  {expandedCategories.includes(category) && (
                    <div className="mt-1 ml-3 space-y-0.5">
                      {subjects.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, subject }))}
                          className={`block w-full text-left px-2 py-0.5 text-xs rounded transition-colors ${
                            formData.subject === subject
                              ? 'bg-[#C3A06D] text-white'
                              : 'hover:bg-gray-100 text-[#3E4A59]'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-1 text-xs text-[#7E8A97]">
              Selected: <span className="font-medium">{formData.subject}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-[#3E4A59]">Task Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              className="border-[#D9E5D1] focus:border-[#8BA88E]"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-[#3E4A59]">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add task description or notes"
              className="border-[#D9E5D1] focus:border-[#8BA88E]"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-[#3E4A59]">Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0 mt-4">
          <div className="flex justify-between w-full">
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.title.trim()}
                className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
              >
                {task ? 'Update' : 'Add'} Task
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Planner;