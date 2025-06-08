import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CA3AF] via-[#A7B8A8] to-[#7FB3C4] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* App Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#8BA88E] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🍃</span>
            </div>
            <h1 
              className="text-5xl font-bold text-[#4B5563]" 
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Pebble Track
            </h1>
          </div>
          <p className="text-xl text-[#6B7280] mb-2">
            Your Family's Homeschool Journey
          </p>
          <p className="text-lg text-[#6B7280]">
            Track progress, manage lessons, and celebrate learning together
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Parent Login */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#8BA88E]">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-[#8BA88E] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle 
                className="text-2xl text-[#4B5563]" 
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                Parent Login
              </CardTitle>
              <CardDescription className="text-base">
                Manage your family's homeschool curriculum, track student progress, and plan lessons
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Heart className="w-4 h-4 mr-2 text-[#8BA88E]" />
                  Create and manage student profiles
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <GraduationCap className="w-4 h-4 mr-2 text-[#8BA88E]" />
                  Plan lessons and assignments
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <User className="w-4 h-4 mr-2 text-[#8BA88E]" />
                  Monitor family progress
                </div>
              </div>
              <Link href="/parent/login">
                <Button 
                  className="w-full bg-[#8BA88E] hover:bg-[#7A9A7D] text-white text-lg py-6"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  Parent Sign In
                </Button>
              </Link>
              <p className="text-xs text-[#9CA3AF] mt-3">
                New family? <Link href="/parent/register" className="text-[#8BA88E] hover:underline">Create Account</Link>
              </p>
            </CardContent>
          </Card>

          {/* Student Login */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#7FB3C4]">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-[#7FB3C4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <CardTitle 
                className="text-2xl text-[#4B5563]" 
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                Student Login
              </CardTitle>
              <CardDescription className="text-base">
                Access your personalized learning dashboard and complete your daily tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-[#6B7280]">
                  <span className="w-4 h-4 mr-2 text-2xl">📚</span>
                  View your daily assignments
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <span className="w-4 h-4 mr-2 text-2xl">⭐</span>
                  Track your progress and achievements
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <span className="w-4 h-4 mr-2 text-2xl">🎯</span>
                  Complete fun learning activities
                </div>
              </div>
              <Link href="/student/login">
                <Button 
                  className="w-full bg-[#7FB3C4] hover:bg-[#6FA3B4] text-white text-lg py-6"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  Student Sign In
                </Button>
              </Link>
              <p className="text-xs text-[#9CA3AF] mt-3">
                Ask your parent for your PIN number
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h2 
            className="text-3xl font-bold text-[#4B5563] mb-8" 
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Why Families Love Pebble Track
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl mb-4 block">🌱</span>
              <h3 className="font-bold text-[#4B5563] mb-2">Growth Focused</h3>
              <p className="text-sm text-[#6B7280]">
                Track each child's unique learning journey with personalized progress monitoring
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
              <h3 className="font-bold text-[#4B5563] mb-2">Family Centered</h3>
              <p className="text-sm text-[#6B7280]">
                Designed specifically for homeschool families with multiple children
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl mb-4 block">📱</span>
              <h3 className="font-bold text-[#4B5563] mb-2">Mobile Ready</h3>
              <p className="text-sm text-[#6B7280]">
                Access your homeschool tools anywhere with our mobile-friendly design
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}