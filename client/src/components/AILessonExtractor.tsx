import React, { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, Camera, FileText, Sparkles, Edit, Trash2, Plus } from "lucide-react"
import { apiRequest } from "@/lib/queryClient"

interface Lesson {
  lessonNumber: number
  title: string
  type: "lesson" | "quiz" | "test" | "review" | "exam"
  description: string
  estimatedMinutes: number
}

interface AILessonExtractorProps {
  onLessonsExtracted: (lessons: Lesson[], curriculumData: any) => void
}

export default function AILessonExtractor({ onLessonsExtracted }: AILessonExtractorProps) {
  const { toast } = useToast()
  
  // Initialize useRef with proper error handling
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  const [extractedLessons, setExtractedLessons] = useState<Lesson[]>([])
  const [curriculumData, setCurriculumData] = useState({
    name: "",
    subject: "",
    publisher: "",
    gradeLevel: "",
    description: ""
  })
  const [isExtracting, setIsExtracting] = useState(false)
  const [textInput, setTextInput] = useState("")

  // Define type colors for lesson badges
  const typeColors: Record<string, string> = {
    lesson: "bg-blue-100 text-blue-800 border-blue-300",
    quiz: "bg-yellow-100 text-yellow-800 border-yellow-300", 
    test: "bg-red-100 text-red-800 border-red-300",
    review: "bg-green-100 text-green-800 border-green-300",
    exam: "bg-purple-100 text-purple-800 border-purple-300"
  }

  // Extract lessons mutation
  const extractLessonsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/curriculums/extract-lessons', 'POST', data)
      return response
    },
    onSuccess: (response: any) => {
      const lessons = response?.lessons || []
      const count = response?.count || lessons.length
      setExtractedLessons(lessons)
      toast({
        title: "Success!",
        description: `Extracted ${count} lessons from your curriculum index`
      })
    },
    onError: (error: any) => {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract lessons. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Enhance description mutation
  const enhanceDescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/curriculums/enhance-description', 'POST', data)
      return response
    },
    onSuccess: (response: any) => {
      const description = response?.description || ""
      setCurriculumData(prev => ({ ...prev, description }))
      toast({
        title: "Description Enhanced",
        description: "AI has generated a curriculum description for you"
      })
    }
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      })
      return
    }

    setIsExtracting(true)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const imageData = e.target.result as string
          
          extractLessonsMutation.mutate({
            imageData,
            curriculumName: curriculumData.name || "curriculum",
            extractionType: "image"
          })
        }
      }
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read image file",
          variant: "destructive"
        })
        setIsExtracting(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive"
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleTextExtraction = () => {
    if (!textInput.trim()) {
      toast({
        title: "No Text",
        description: "Please paste your curriculum index text",
        variant: "destructive"
      })
      return
    }

    extractLessonsMutation.mutate({
      textContent: textInput,
      curriculumName: curriculumData.name || "curriculum",
      extractionType: "text"
    })
  }

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    setExtractedLessons(prev => prev.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  const deleteLesson = (index: number) => {
    setExtractedLessons(prev => prev.filter((_, i) => i !== index))
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      lessonNumber: extractedLessons.length + 1,
      title: "New Lesson",
      type: "lesson",
      description: "",
      estimatedMinutes: 30
    }
    setExtractedLessons(prev => [...prev, newLesson])
  }

  const handleEnhanceDescription = () => {
    if (!curriculumData.name || !curriculumData.publisher) {
      toast({
        title: "Missing Information",
        description: "Please enter curriculum name and publisher first",
        variant: "destructive"
      })
      return
    }

    enhanceDescriptionMutation.mutate({
      curriculumName: curriculumData.name,
      publisher: curriculumData.publisher,
      gradeLevel: curriculumData.gradeLevel
    })
  }

  const handleImportLessons = () => {
    if (extractedLessons.length === 0) {
      toast({
        title: "No Lessons",
        description: "Please extract lessons first",
        variant: "destructive"
      })
      return
    }

    if (!curriculumData.name) {
      toast({
        title: "Missing Name",
        description: "Please enter a curriculum name",
        variant: "destructive"
      })
      return
    }

    onLessonsExtracted(extractedLessons, {
      ...curriculumData,
      totalLessons: extractedLessons.length
    })
  }



  return (
    <div className="space-y-6">
      {/* Curriculum Details */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Information</CardTitle>
          <CardDescription>Enter your curriculum details before extracting lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curriculum-name">Curriculum Name *</Label>
              <Input
                id="curriculum-name"
                placeholder="e.g., Teaching Textbooks Algebra 1"
                value={curriculumData.name}
                onChange={(e) => setCurriculumData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="curriculum-subject">Subject</Label>
              <Input
                id="curriculum-subject"
                placeholder="e.g., Math, Science, History"
                value={curriculumData.subject}
                onChange={(e) => setCurriculumData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="curriculum-publisher">Publisher</Label>
              <Input
                id="curriculum-publisher"
                placeholder="e.g., Teaching Textbooks"
                value={curriculumData.publisher}
                onChange={(e) => setCurriculumData(prev => ({ ...prev, publisher: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="curriculum-grade">Grade Level</Label>
              <Input
                id="curriculum-grade"
                placeholder="e.g., High School, 7th Grade"
                value={curriculumData.gradeLevel}
                onChange={(e) => setCurriculumData(prev => ({ ...prev, gradeLevel: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="curriculum-description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnhanceDescription}
                disabled={enhanceDescriptionMutation.isPending}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {enhanceDescriptionMutation.isPending ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            </div>
            <Textarea
              id="curriculum-description"
              placeholder="Brief description of the curriculum..."
              value={curriculumData.description}
              onChange={(e) => setCurriculumData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lesson Extraction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
            AI Lesson Extraction
          </CardTitle>
          <CardDescription>
            Upload an image or paste text from your curriculum index
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image Upload</TabsTrigger>
              <TabsTrigger value="text">Text Input</TabsTrigger>
            </TabsList>
            
            <TabsContent value="image" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Lesson Index Image</h3>
                <p className="text-gray-600 mb-4">
                  Take a photo of your Teaching Textbooks lesson index or upload any curriculum table of contents
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click()
                    }
                  }}
                  disabled={isExtracting || extractLessonsMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isExtracting || extractLessonsMutation.isPending ? 'Extracting...' : 'Choose Image'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-input">Paste Curriculum Index Text</Label>
                <Textarea
                  id="text-input"
                  placeholder="Paste your curriculum table of contents or lesson list here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={8}
                />
              </div>
              <Button
                onClick={handleTextExtraction}
                disabled={extractLessonsMutation.isPending}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {extractLessonsMutation.isPending ? 'Extracting...' : 'Extract from Text'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Extracted Lessons */}
      {extractedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Extracted Lessons ({extractedLessons.length})</CardTitle>
                <CardDescription>Review and edit lessons before importing</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={addLesson}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Lesson
                </Button>
                <Button onClick={handleImportLessons} className="bg-green-600 hover:bg-green-700">
                  Import {extractedLessons.length} Lessons
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {extractedLessons.map((lesson, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">#{lesson.lessonNumber}</span>
                      <Badge className={typeColors[lesson.type] || typeColors.lesson}>
                        {lesson.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLesson(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <select
                        value={lesson.type}
                        onChange={(e) => updateLesson(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="lesson">Lesson</option>
                        <option value="quiz">Quiz</option>
                        <option value="test">Test</option>
                        <option value="review">Review</option>
                        <option value="exam">Exam</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={lesson.description}
                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                        placeholder="Brief description..."
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Minutes</Label>
                      <Input
                        type="number"
                        value={lesson.estimatedMinutes}
                        onChange={(e) => updateLesson(index, 'estimatedMinutes', parseInt(e.target.value) || 30)}
                        min="5"
                        max="120"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}