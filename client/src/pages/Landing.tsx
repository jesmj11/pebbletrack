import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, Calendar, BookOpen, Star, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <School className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Homeschool Planner</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="/forgot-password">Forgot Password?</a>
            </Button>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Complete
            <span className="text-blue-600"> Homeschool</span>
            <br />
            Management Solution
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your homeschool journey with AI-powered curriculum management, 
            student tracking, and comprehensive planning tools designed for modern families.
          </p>
          <Button size="lg" className="text-lg px-8 py-3" asChild>
            <a href="/api/login">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600">
            Powerful tools designed specifically for homeschooling families
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>AI Curriculum Extraction</CardTitle>
              <CardDescription>
                Upload photos of textbook indexes and let AI automatically extract lessons and create structured curricula
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Student Progress Tracking</CardTitle>
              <CardDescription>
                Monitor each child's progress with detailed analytics, completion rates, and personalized learning paths
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Weekly Planner</CardTitle>
              <CardDescription>
                Create beautiful, printable weekly plans that adapt to your family's schedule and learning style
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Gamified Learning</CardTitle>
              <CardDescription>
                Keep students motivated with XP points, levels, and achievements for completed assignments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <School className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Multi-Student Management</CardTitle>
              <CardDescription>
                Manage multiple children with individual profiles, grade levels, and customized learning plans
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Printable Resources</CardTitle>
              <CardDescription>
                Generate beautiful printable planners, worksheets, and progress reports for offline use
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Homeschool Experience?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who have streamlined their homeschool journey
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
            <a href="/api/login">
              Start Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <School className="h-6 w-6" />
            <span className="text-lg font-semibold">Homeschool Planner</span>
          </div>
          <p className="text-gray-400">
            Empowering families to create amazing learning experiences at home
          </p>
        </div>
      </footer>
    </div>
  );
}