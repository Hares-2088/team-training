'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">💪 TeamTrainer</h1>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900">
              Track Your Team's Fitness Journey
            </h2>
            <p className="text-xl text-gray-600">
              A beautiful, intuitive platform for trainers to create workouts and members to log their progress
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Start Training
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <CardTitle>Create Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trainers can easily create and schedule workout sessions with multiple exercises
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <CardTitle>Log Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Members log their weights, reps, and notes for each exercise session
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Organize teams, invite members, and monitor everyone's progress in real-time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Training?</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of trainers and athletes using TeamTrainer
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-12">
              Get Started Now
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2026 TeamTrainer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
