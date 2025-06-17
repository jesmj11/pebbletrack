'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, CheckCircle, Clock, Star, Award, Target } from "lucide-react"
import { apiRequest } from "@/lib/queryClient"
import type { StudentDailyLessons, CurriculumLesson } from "@shared/schema"

interface StudentLessonsProps {
  studentId: number
}

export default function StudentLessons({ studentId }: StudentLessonsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)

  // Fetch student's daily lessons
  const { data: dailyLessons, isLoading } = useQuery<StudentDailyLessons>({
    queryKey: [`/api/students/${studentId}/daily-lessons`],
    enabled: !!studentId
  })

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, status, timeSpent, notes, score }: any) => 
      await apiRequest(`/api/lesson-progress/${lessonId}`, 'PUT', { 
        status, 
        timeSpent, 
        notes, 
        score,
        studentId,
        curriculumId: selectedLesson?.curriculumId,
        lessonId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/daily-lessons`] })
      setLessonDialogOpen(false)
      toast({
        title: "Great job!",
        description: "Lesson progress updated successfully!"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Oops!",
        description: error.message || "Failed to update progress",
        variant: "destructive"
      })
    }
  })

  const handleCompleteLesson = (lesson: CurriculumLesson, timeSpent?: number, notes?: string, score?: number) => {
    updateProgressMutation.mutate({
      lessonId: lesson.id,
      status: 'completed',
      timeSpent: timeSpent || 30,
      notes: notes || '',
      score: score || null
    })
  }

  const handleStartLesson = (lesson: CurriculumLesson) => {
    updateProgressMutation.mutate({
      lessonId: lesson.id,
      status: 'in_progress',
      timeSpent: 0,
      notes: '',
      score: null
    })
  }

  const subjectEmojis: Record<string, string> = {
    'Math': '🔢',
    'Science': '🔬',
    'History': '📚',
    'Language Arts': '✍️',
    'Reading': '📖',
    'Art': '🎨'
  }

  const subjectColors: Record<string, string> = {
    'Math': 'bg-blue-100 text-blue-800',
    'Science': 'bg-green-100 text-green-800',
    'History': 'bg-yellow-100 text-yellow-800',
    'Language Arts': 'bg-purple-100 text-purple-800',
    'Reading': 'bg-pink-100 text-pink-800',
    'Art': 'bg-orange-100 text-orange-800'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!dailyLessons || dailyLessons.curriculums.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Today</h3>
          <p className="text-gray-600 text-center">
            Your parent will set up your curriculum soon. Check back later!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Today's Lessons for {dailyLessons.studentName}
        </h1>
        <p className="text-gray-600">Complete your daily lessons to earn XP and level up!</p>
      </div>

      <div className="grid gap-6">
        {dailyLessons.curriculums.map((curriculum) => (
          <Card key={curriculum.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{subjectEmojis[curriculum.subject] || '📚'}</span>
                  <div>
                    <CardTitle className="text-xl">{curriculum.name}</CardTitle>
                    <CardDescription>
                      {curriculum.lessonsPerDay} lesson{curriculum.lessonsPerDay > 1 ? 's' : ''} per day
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={subjectColors[curriculum.subject] || 'bg-gray-100 text-gray-800'}>
                    {curriculum.subject}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{curriculum.progress}%</div>
                    <Progress value={curriculum.progress} className="w-20" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {curriculum.todaysLessons.length > 0 ? (
                <div className="space-y-3">
                  {curriculum.todaysLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.type === 'quiz' ? (
                            <Target className="h-5 w-5 text-orange-500" />
                          ) : lesson.type === 'test' ? (
                            <Award className="h-5 w-5 text-red-500" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Lesson {lesson.lessonNumber}: {lesson.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {lesson.estimatedMinutes || 30} min
                            </span>
                            <Badge 
                              variant={lesson.type === 'lesson' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {lesson.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartLesson(lesson)}
                          disabled={updateProgressMutation.isPending}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setLessonDialogOpen(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Done!</h3>
                  <p className="text-gray-600">
                    You've completed all your {curriculum.subject} lessons for today!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lesson Completion Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Lesson</DialogTitle>
            <DialogDescription>
              {selectedLesson && `Mark "${selectedLesson.title}" as complete`}
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const timeSpent = parseInt(formData.get('timeSpent') as string) || 30
              const notes = formData.get('notes') as string
              const score = selectedLesson?.type === 'quiz' || selectedLesson?.type === 'test' 
                ? parseInt(formData.get('score') as string) || null 
                : null
              
              if (selectedLesson) {
                handleCompleteLesson(selectedLesson, timeSpent, notes, score)
              }
            }} 
            className="space-y-4"
          >
            <div>
              <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700 mb-1">
                Time Spent (minutes)
              </label>
              <input
                type="number"
                id="timeSpent"
                name="timeSpent"
                defaultValue={selectedLesson?.estimatedMinutes || 30}
                min="1"
                max="180"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(selectedLesson?.type === 'quiz' || selectedLesson?.type === 'test') && (
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  min="0"
                  max="100"
                  placeholder="Enter your score"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="How did the lesson go? Any questions or thoughts?"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLessonDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProgressMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateProgressMutation.isPending ? 'Saving...' : 'Mark Complete'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}