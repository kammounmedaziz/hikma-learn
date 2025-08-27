import {  useEffect,  } from 'react';
import { CalendarDays,   } from 'lucide-react';

const TeacherOverview = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
        Welcome Back, Professor!
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Your teaching dashboard - manage classes, track student progress, and create engaging content
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-red-400" />
          <span className="text-2xl font-bold text-white">156</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Total Students</h3>
        <p className="text-green-400 text-sm">+12 this month</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <BookOpen className="w-8 h-8 text-red-400" />
          <span className="text-2xl font-bold text-white">8</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Active Courses</h3>
        <p className="text-red-400 text-sm">2 new this semester</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <ClipboardList className="w-8 h-8 text-green-400" />
          <span className="text-2xl font-bold text-white">24</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Pending Reviews</h3>
        <p className="text-yellow-400 text-sm">6 urgent</p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">87%</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Avg. Performance</h3>
        <p className="text-green-400 text-sm">+5% improvement</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-red-400" />
          Today's Schedule
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Advanced Mathematics</p>
              <p className="text-gray-300 text-sm">Room 204 • 45 students</p>
            </div>
            <span className="text-red-400 font-bold">09:00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Physics Lab Session</p>
              <p className="text-gray-300 text-sm">Lab 3 • 20 students</p>
            </div>
            <span className="text-red-400 font-bold">14:00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
            <div>
              <p className="text-white font-medium">Office Hours</p>
              <p className="text-gray-300 text-sm">Room 105 • Open</p>
            </div>
            <span className="text-red-400 font-bold">16:00</span>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-yellow-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">New assignment submitted by John Doe</p>
              <p className="text-gray-400 text-xs">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">Quiz "Quantum Mechanics" completed by 25 students</p>
              <p className="text-gray-400 text-xs">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white text-sm">New forum discussion started in "General Physics"</p>
              <p className="text-gray-400 text-xs">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);