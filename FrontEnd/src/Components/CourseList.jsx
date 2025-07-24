import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'; // Ensure Axios is installed
import { Star, Play, ChevronRight, ChevronDown } from 'lucide-react';

const CourseList = ({ role, courses, onAction, currentTeacher = '' }) => {
  const getButtonConfig = (role, isFollowed, teacherName) => {
    const configs = {
      student: [
        {
          action: isFollowed ? 'unfollow' : 'follow',
          icon: Star,
          activeClass: isFollowed ? 'fill-current' : '',
          label: isFollowed ? 'Unfollow' : 'Follow',
        },
        { action: 'preview', icon: Play, label: 'Preview' },
      ],
      teacher: [
        ...(teacherName === currentTeacher ? [{ action: 'viewOwn', icon: ChevronRight, label: 'View Course' }] : []),
      ],
      admin: [
        { action: 'viewChapters', icon: ChevronDown, label: 'View Chapters' },
      ],
    };
    return configs[role] || [];
  };

  // Local state to manage button state, chapter visibility, and chapter data
  const [localCourses, setLocalCourses] = useState(courses);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [chapters, setChapters] = useState({});

  useEffect(() => {
    // Sync local state with props when courses change
    setLocalCourses(courses);
  }, [courses]);

  // Fetch chapters for a specific course
  const fetchChapters = async (courseId) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(`http://localhost:8000/courses/${courseId}/chapters/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters((prev) => ({ ...prev, [courseId]: response.data }));
    } catch (error) {
      console.error(`Failed to fetch chapters for course ${courseId}:`, error);
    }
  };

  const handleAction = async (action, courseId) => {
    if (action === 'preview' || action === 'viewOwn') {
      window.location.href = `http://localhost:5173/courses/${courseId}/chapters/`;
      return;
    } else if (action === 'viewChapters') {
      if (expandedCourse !== courseId) {
        if (!chapters[courseId]) {
          await fetchChapters(courseId); // Fetch chapters if not already loaded
        }
      }
      setExpandedCourse(expandedCourse === courseId ? null : courseId); // Toggle visibility
      return;
    }

    // Optimistically update the local state for follow/unfollow
    setLocalCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, isFollowed: action === 'follow' } : course
      )
    );

    try {
      await onAction(action, courseId);
      // After successful action, the parent should update courses; local state will sync in the next render
    } catch (error) {
      // Revert optimistic update on failure
      setLocalCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, isFollowed: !!(action === 'unfollow') } : course
        )
      );
      console.error(`Action ${action} failed:`, error);
    }
  };

  return (
    <div className="space-y-4">
      {localCourses.map((course) => (
        <div
          key={course.id}
          className="bg-gray-900/40 border border-gray-700 p-4 rounded-xl shadow animate-fadeIn"
          style={{ animationDelay: `${localCourses.indexOf(course) * 0.1}s` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{course.title}</h3>
              <p className="text-gray-400 text-sm italic mb-2">Taught by {course.teacherName}</p>
              <p className="text-gray-300 line-clamp-3">{course.description}</p>
            </div>
            <div className="flex gap-2 ml-4 mt-1">
              {getButtonConfig(role, course.isFollowed, course.teacherName).map(
                ({ action, icon: Icon, activeClass, label }, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action, course.id)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                    title={label}
                  >
                    {Icon && <Icon size={20} className={activeClass || ''} />}
                  </button>
                )
              )}
            </div>
          </div>
          {role === 'admin' && expandedCourse === course.id && (
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: expandedCourse === course.id ? '300px' : '0' }}
            >
              <div className="mt-4 space-y-2">
                {chapters[course.id]?.map((chapter) => (
                  <div key={chapter.id} className="bg-gray-800/50 p-2 rounded-lg text-gray-200">
                    {chapter.title}
                  </div>
                )) || <p className="text-gray-400">No chapters available.</p>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

CourseList.propTypes = {
  role: PropTypes.oneOf(['student', 'teacher', 'admin']).isRequired,
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      teacherName: PropTypes.string.isRequired,
      isFollowed: PropTypes.bool,
    })
  ).isRequired,
  onAction: PropTypes.func.isRequired,
  currentTeacher: PropTypes.string,
};

// Animation keyframes
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default CourseList;