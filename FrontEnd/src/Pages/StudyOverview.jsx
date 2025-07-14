import {  useEffect,  } from 'react';
import { CalendarDays, Video,  } from 'lucide-react';

import AnimatedBackground from '../Components/Background'; 
const StudyOverview = () => {
  

  useEffect(() => {

  }, []);

  const progress = [
    { subject: 'Informatique', percentage: 0 },
    { subject: 'Anglais', percentage: 0 },
    { subject: 'Chimie', percentage: 22.23 },
    { subject: 'Analyse', percentage: 4.88 },
    { subject: 'Algèbre', percentage: 7.22 },
  ];

  const freeVideos = [
    {
      title: '01_Techniques en Analyse (ancien)',
      instructor: 'Wisssem',
      date: '01-10-2016',
    },
    {
      title: '01_Techniques en Analyse (ancien)',
      instructor: 'Wisssem',
      date: '01-10-2016',
    }
  ];

  return (
    <div className="min-h-screen relative text-gray-200 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
            Study Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your learning journey and access helpful resources</p>
        </div>

        {/* Live Sessions & Latest Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-red-400 font-semibold">
              <CalendarDays className="w-5 h-5" />
              <span>This week timetable</span>
            </div>
            <p className="text-gray-400">Your Class</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-red-400 font-semibold">
              Assinements
              <span>Latest Assinements</span>
            </div>
            <p className="text-gray-400">Subject Name</p>
          </div>
        </div>

        {/* Free Videos Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">sugessested Courses</h2>
          <div className="space-y-4">
            {freeVideos.map((video, idx) => (
              <div key={idx} className="bg-gray-900/40 border border-gray-700 p-4 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                <p className="text-gray-400 text-sm">By {video.instructor} — {video.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Progress */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-red-400 mb-6">My Progress</h2>
          <div className="space-y-4">
            {progress.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{item.subject}</span>
                  <span className="text-gray-300">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded">
                  <div
                    className="bg-red-500 h-2 rounded"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default StudyOverview;
