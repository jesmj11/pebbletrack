'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Plus, Upload, Settings, Users, Calendar, Clock, Award } from "lucide-react"
import { apiRequest } from "@/lib/queryClient"
import type { Curriculum, CurriculumLesson, Student, StudentDailyLessons } from "@shared/schema"

export default function CurriculumPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // Fetch curriculums
  const { data: curriculums = [], isLoading: curriculumsLoading } = useQuery({
    queryKey: ['/api/curriculums']
  })

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/auth/students']
  })

  // Create curriculum mutation
  const createCurriculumMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/curriculums', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/curriculums'] })
      setImportDialogOpen(false)
      toast({
        title: "Success",
        description: "Curriculum imported successfully!"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import curriculum",
        variant: "destructive"
      })
    }
  })

  // Assign curriculum mutation
  const assignCurriculumMutation = useMutation({
    mutationFn: async ({ studentId, curriculumId, lessonsPerDay }: any) => 
      await apiRequest(`/api/students/${studentId}/curriculums`, 'POST', { curriculumId, lessonsPerDay }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/students'] })
      setAssignDialogOpen(false)
      toast({
        title: "Success",
        description: "Curriculum assigned to student successfully!"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign curriculum",
        variant: "destructive"
      })
    }
  })

  const handleImportCurriculum = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const curriculumData = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      publisher: formData.get('publisher') as string,
      gradeLevel: formData.get('gradeLevel') as string,
      description: formData.get('description') as string,
      totalLessons: parseInt(formData.get('totalLessons') as string) || 0
    }

    createCurriculumMutation.mutate(curriculumData)
  }

  const handleAssignCurriculum = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const assignmentData = {
      studentId: parseInt(formData.get('studentId') as string),
      curriculumId: selectedCurriculum?.id,
      lessonsPerDay: parseInt(formData.get('lessonsPerDay') as string) || 1
    }

    assignCurriculumMutation.mutate(assignmentData)
  }

  const subjectColors: Record<string, string> = {
    'Math': 'bg-blue-100 text-blue-800',
    'Science': 'bg-green-100 text-green-800',
    'History': 'bg-yellow-100 text-yellow-800',
    'Language Arts': 'bg-purple-100 text-purple-800',
    'Reading': 'bg-pink-100 text-pink-800',
    'Art': 'bg-orange-100 text-orange-800'
  }

  if (curriculumsLoading || studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Curriculum Management</h1>
          <p className="text-gray-600">Import your curriculum index and configure daily lesson schedules for each student</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="import">Import Curriculum</TabsTrigger>
            <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curriculums.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Curriculums Yet</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Start by importing your curriculum index to set up daily lessons for your students
                    </p>
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Import First Curriculum
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Import Curriculum</DialogTitle>
                          <DialogDescription>
                            Add your curriculum details to start tracking lessons and progress
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleImportCurriculum} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Curriculum Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Saxon Math 7/6"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="subject">Subject</Label>
                              <Select name="subject" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Math">Math</SelectItem>
                                  <SelectItem value="Science">Science</SelectItem>
                                  <SelectItem value="History">History</SelectItem>
                                  <SelectItem value="Language Arts">Language Arts</SelectItem>
                                  <SelectItem value="Reading">Reading</SelectItem>
                                  <SelectItem value="Art">Art</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="publisher">Publisher</Label>
                              <Input
                                id="publisher"
                                name="publisher"
                                placeholder="Saxon Publishers"
                              />
                            </div>
                            <div>
                              <Label htmlFor="gradeLevel">Grade Level</Label>
                              <Input
                                id="gradeLevel"
                                name="gradeLevel"
                                placeholder="7th Grade"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="totalLessons">Total Lessons</Label>
                            <Input
                              id="totalLessons"
                              name="totalLessons"
                              type="number"
                              placeholder="120"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="Brief description of the curriculum content..."
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setImportDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={createCurriculumMutation.isPending}
                            >
                              {createCurriculumMutation.isPending ? 'Importing...' : 'Import Curriculum'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                curriculums.map((curriculum: Curriculum) => (
                  <Card key={curriculum.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{curriculum.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {curriculum.publisher} • {curriculum.gradeLevel}
                          </CardDescription>
                        </div>
                        <Badge className={subjectColors[curriculum.subject] || 'bg-gray-100 text-gray-800'}>
                          {curriculum.subject}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="mr-2 h-4 w-4" />
                          {curriculum.totalLessons} total lessons
                        </div>
                        {curriculum.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {curriculum.description}
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCurriculum(curriculum)
                              setAssignDialogOpen(true)
                            }}
                          >
                            <Users className="mr-1 h-3 w-3" />
                            Assign to Student
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {curriculums.length > 0 && (
              <div className="flex justify-center">
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Import Another Curriculum
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Import Curriculum</DialogTitle>
                      <DialogDescription>
                        Add your curriculum details to start tracking lessons and progress
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleImportCurriculum} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Curriculum Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Teaching Textbooks Algebra 1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select name="subject" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Math">Math</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Language Arts">Language Arts</SelectItem>
                              <SelectItem value="Reading">Reading</SelectItem>
                              <SelectItem value="Art">Art</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="publisher">Publisher</Label>
                          <Input
                            id="publisher"
                            name="publisher"
                            placeholder="Teaching Textbooks"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gradeLevel">Grade Level</Label>
                          <Input
                            id="gradeLevel"
                            name="gradeLevel"
                            placeholder="High School"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="totalLessons">Total Lessons</Label>
                        <Input
                          id="totalLessons"
                          name="totalLessons"
                          type="number"
                          placeholder="150"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Brief description of the curriculum content..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImportDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createCurriculumMutation.isPending}
                        >
                          {createCurriculumMutation.isPending ? 'Importing...' : 'Import Curriculum'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Import Curriculum Index
                </CardTitle>
                <CardDescription>
                  Upload your curriculum details to automatically generate daily lesson schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">How to Import Your Curriculum</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Enter your curriculum name and details</li>
                      <li>• Specify the total number of lessons in your curriculum</li>
                      <li>• Set the number of lessons per day for each student</li>
                      <li>• The system will automatically schedule daily lessons</li>
                    </ul>
                  </div>

                  <form onSubmit={handleImportCurriculum} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Curriculum Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Saxon Math 7/6, Teaching Textbooks Algebra 1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Select name="subject" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Math">Math</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Language Arts">Language Arts</SelectItem>
                            <SelectItem value="Reading">Reading</SelectItem>
                            <SelectItem value="Art">Art</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publisher">Publisher</Label>
                        <Input
                          id="publisher"
                          name="publisher"
                          placeholder="e.g., Saxon Publishers, Teaching Textbooks"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gradeLevel">Grade Level</Label>
                        <Input
                          id="gradeLevel"
                          name="gradeLevel"
                          placeholder="e.g., 7th Grade, High School"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="totalLessons">Total Lessons *</Label>
                      <Input
                        id="totalLessons"
                        name="totalLessons"
                        type="number"
                        placeholder="Enter the total number of lessons in your curriculum"
                        min="1"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Count all lessons, quizzes, and tests in your curriculum
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of what this curriculum covers..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createCurriculumMutation.isPending}
                      className="w-full"
                    >
                      {createCurriculumMutation.isPending ? 'Importing...' : 'Import Curriculum'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Configure Student Schedules
                  </CardTitle>
                  <CardDescription>
                    Assign curriculums to students and set daily lesson amounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student: Student) => (
                      <div key={student.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{student.avatar}</span>
                            <div>
                              <h3 className="font-semibold">{student.fullName}</h3>
                              <p className="text-sm text-gray-600">{student.gradeLevel}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCurriculum(curriculums[0] || null)
                              setAssignDialogOpen(true)
                            }}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Assign
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          No curriculums assigned yet
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Daily Schedule Preview
                  </CardTitle>
                  <CardDescription>
                    See how lessons will be distributed across days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        Assign curriculums to students to see their daily schedules
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Assign Curriculum</DialogTitle>
              <DialogDescription>
                Choose a student and set their daily lesson amount
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignCurriculum} className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: Student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.avatar} {student.fullName} ({student.gradeLevel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="lessonsPerDay">Lessons Per Day</Label>
                <Select name="lessonsPerDay" defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 lesson per day</SelectItem>
                    <SelectItem value="2">2 lessons per day</SelectItem>
                    <SelectItem value="3">3 lessons per day</SelectItem>
                    <SelectItem value="4">4 lessons per day</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  For math with several lessons before a quiz, choose 2 lessons per day
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={assignCurriculumMutation.isPending}
                >
                  {assignCurriculumMutation.isPending ? 'Assigning...' : 'Assign Curriculum'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}