import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Added Axios
import {
  Home,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Library,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Target,
  Star,
} from 'lucide-react';

import StudyOverview from './StudyOverview';
import StudentSettings from '../Components/StudentSettings';
import MyCourses from './MyCourses';
import { NavLink, Outlet } from 'react-router-dom';
import CourseList from '../Components/CourseList';

const AllCoursesStudent = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        console.log('Fetching all courses with token...', token);

        const coursesResponse = await axios.get('http://localhost:8000/courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Courses response status:', coursesResponse.status);
        const coursesData = coursesResponse.data;

        console.log('Fetching followed courses...');
        const followedResponse = await axios.get('http://localhost:8000/courses/followed-courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Followed response status:', followedResponse.status);
        const followedData = followedResponse.data;

        // Map followed course IDs
        const followedIds = new Set(followedData.map(course => course.id));

        // Format courses with teacher as an object, matching AdminDashboard
        const formattedCourses = coursesData.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          teacher: course.teacher && typeof course.teacher === 'object' ? course.teacher : { username: course.teacher || 'Unknown Teacher' },
          isFollowed: followedIds.has(course.id),
        }));
        console.log('Formatted courses:', formattedCourses);
        setAllCourses(formattedCourses);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Error fetching courses: ${err.message}. 
          - Ensure the Django server is running at http://localhost:8000/.
          - Check token authentication.
          - Verify you are authenticated as a student.
          - Check browser console for details.`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseAction = async (action, courseId) => {
    console.log(`Action: ${action}, Course ID: ${courseId}`);
    try {
      const token = localStorage.getItem('token') || '';
      let response;

      if (action === 'follow') {
        response = await axios.post(`http://localhost:8000/courses/${courseId}/follow/`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 201) {
          console.log(`${action} action succeeded`);
        }
      } else if (action === 'unfollow') {
        response = await axios.delete(`http://localhost:8000/courses/${courseId}/follow/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 204) {
          console.log(`${action} action succeeded`);
        }
      }

      // Refresh courses to update isFollowed status
      const updatedCoursesResponse = await axios.get('http://localhost:8000/courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updatedCoursesResponse.status !== 200) throw new Error(`Failed to refresh courses: ${updatedCoursesResponse.status}`);
      const updatedCoursesData = updatedCoursesResponse.data;

      const followedResponse = await axios.get('http://localhost:8000/courses/followed-courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (followedResponse.status !== 200) throw new Error(`Failed to refresh followed courses: ${followedResponse.status}`);
      const followedData = followedResponse.data;

      const followedIds = new Set(followedData.map(course => course.id));
      const updatedFormattedCourses = updatedCoursesData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        teacher: course.teacher && typeof course.teacher === 'object' ? course.teacher : { username: course.teacher || 'Unknown Teacher' },
        isFollowed: followedIds.has(course.id),
      }));
      setAllCourses(updatedFormattedCourses);
    } catch (error) {
      console.error(`${action} action failed:`, error.message);
      setError(`Failed to ${action} course. Please try again.`);
    }
  };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
                    Explore All Courses
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Browse all available courses and start learning something new today.
                </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20">
                {loading ? (
                    <p className="text-gray-300 text-center">Loading courses...</p>
                ) : error ? (
                    <p className="text-red-400 text-center">{error}</p>
                ) : (
                    <CourseList
                        role="student"
                        courses={allCourses}
                        onAction={handleCourseAction}
                    />
                )}
            </div>
        </div>
    );
};

export default AllCoursesStudent;