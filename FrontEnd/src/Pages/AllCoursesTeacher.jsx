import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Library,
  UserCheck,
  Video,
  HelpCircle,
  TrendingUp,
  Award, PieChart, Mail, Star, Plus, Edit, Eye
} from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import TeacherSettings from '../Components/TeacherSettings';
import MyCoursesTeacher from './MyCoursesTeacher.jsx';
import CourseList from '../Components/CourseList'; // Import CourseList

const AllCoursesTeacher = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching all courses with authentication...');
        const token = localStorage.getItem('token') || '';
        const coursesResponse = await fetch('http://localhost:8000/courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Courses response status:', coursesResponse.status);
        if (!coursesResponse.ok) {
          throw new Error(`HTTP error! Status: ${coursesResponse.status}`);
        }
        const coursesData = await coursesResponse.json();
        console.log('Raw courses data:', coursesData);

        // Format all courses with teacher as an object, matching AdminDashboard
        const formattedCourses = coursesData.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          teacher: course.teacher && typeof course.teacher === 'object' ? course.teacher : { username: course.teacher || 'Unknown Teacher' },
          isFollowed: false,
        }));
        console.log('Formatted all courses:', formattedCourses);
        setAllCourses(formattedCourses);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Error fetching courses: ${err.message}. 
          - Ensure the Django server is running at http://localhost:8000/.
          - Check CORS configuration in Django settings.
          - Verify you are authenticated as a teacher.
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
      let response;
      if (action === 'viewOwn') {
        response = await fetch(`http://localhost:8000/courses/${courseId}/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
      }

      if (!response.ok) throw new Error(`Failed to ${action} course: ${response.status}`);
      console.log(`${action} action succeeded`);

      // Refresh course data if needed
      const updatedCoursesResponse = await fetch('http://localhost:8000/courses/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (!updatedCoursesResponse.ok) throw new Error(`Failed to refresh courses: ${updatedCoursesResponse.status}`);
      const updatedCoursesData = await updatedCoursesResponse.json();
      const formattedCourses = updatedCoursesData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
          teacher: course.teacher && typeof course.teacher === 'object' ? course.teacher : { username: course.teacher || 'Unknown Teacher' },
          isFollowed: false,
      }));
            setAllCourses(formattedCourses);
        } catch (err) {
            console.error(`${action} action failed:`, err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
                    All Courses
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    View all courses on the platform.
                </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20">
                {loading ? (
                    <p className="text-gray-300 text-center">Loading courses...</p>
                ) : error ? (
                    <p className="text-red-400 text-center">{error}</p>
                ) : (
                    <CourseList
                        role="teacher"
                        courses={allCourses}
                        onAction={handleCourseAction}
                        currentTeacher={localStorage.getItem('username') || 'teacher1'} // Match your logged-in user
                    />
                )}
            </div>
        </div>
    );
};

export default AllCoursesTeacher;