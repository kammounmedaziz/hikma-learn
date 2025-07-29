import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
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
        {
          action: 'previewChapters',
          icon: isFollowed ? Play : ChevronDown,
          label: isFollowed ? 'Preview' : 'View Chapters',
        },
      ],
      teacher: [
        ...(teacherName === currentTeacher ? [
          { action: 'viewOwn', icon: ChevronRight, label: 'View Course' },
        ] : []),
      ],
      admin: [
        { action: 'viewChapters', icon: ChevronDown, label: 'View Chapters' },
      ],
    };
    return configs[role] || [];
  };

  const [localCourses, setLocalCourses] = useState(courses);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [chapters, setChapters] = useState({});

  useEffect(() => {
    if (courses && Array.isArray(courses)) {
      setLocalCourses(
        [...courses].sort(
          (a, b) => (b.isFollowed ? 1 : 0) - (a.isFollowed ? 1 : 0)
        )
      );
    } else {
      console.error('Invalid courses prop received:', courses);
      setLocalCourses([]);
    }
  }, [courses]);

  const fetchChapters = async (courseId) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapters((prev) => ({
        ...prev,
        [courseId]: response.data.results || response.data || [],
      }));
    } catch (error) {
      console.error(`Failed to fetch chapters for course ${courseId}:`, error);
      setChapters((prev) => ({ ...prev, [courseId]: [] }));
    }
  };

  const handleAction = async (action, courseId) => {
    if (action === 'previewChapters' || action === 'viewChapters') {
      if (expandedCourse !== courseId && !chapters[courseId]) {
        await fetchChapters(courseId);
      }
      setExpandedCourse(expandedCourse === courseId ? null : courseId);
      return;
    } else if (action === 'viewOwn') {
      window.location.href = `http://localhost:5173/courses/${courseId}/`;
      return;
    }

    setLocalCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? { ...course, isFollowed: action === 'follow' }
          : course
      )
    );

    try {
      await onAction(action, courseId);
    } catch (error) {
      setLocalCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? { ...course, isFollowed: !!(action === 'unfollow') }
            : course
        )
      );
      console.error(`Action ${action} failed:`, error);
    }
  };

  // Function to construct the correct image URL
  const getImageSrc = (coverPhoto) => {
    if (!coverPhoto) return null;
    if (coverPhoto.startsWith('http://') || coverPhoto.startsWith('https://')) {
      return coverPhoto; // Use absolute URL as-is
    }
    return `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${coverPhoto.startsWith('/') ? '' : '/'}${coverPhoto}`;
  };

  return (
    <div className="space-y-4">
      {localCourses.map((course) => (
        <div
          key={course.id}
          className="bg-gray-900/40 border border-gray-700 p-4 rounded-xl shadow animate-fadeIn flex items-start"
          style={{
            animationDelay: `${localCourses.indexOf(course) * 0.1}s`,
          }}
        >
          {/* Photo on the left side with explicit placeholder */}
          {role === 'admin' && (
            <div className="mr-4 flex-shrink-0">
              {course.cover_photo ? (
                <img
                  src={getImageSrc(course.cover_photo)}
                  alt={course.title}
                  className="w-32 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.log(`Image failed to load for ${course.title}: ${e.target.src}`);
                  }}
                />
              ) : (
                <div className="w-32 h-20 rounded-lg bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </div>
          )}
          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{course.title}</h3>
            <p className="text-gray-400 text-sm italic mb-2">
              Taught by {course.teacher?.username || course.teacher_name || course.teacher || 'Unknown Teacher'}
            </p>
            <p className="text-gray-300 line-clamp-3">{course.description}</p>
          </div>
          {/* Buttons */}
          <div className="flex gap-2 ml-4">
            {getButtonConfig(role, course.isFollowed, course.teacher?.username || course.teacher_name || course.teacher).map(
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
          {(role === 'student' && !course.isFollowed || role === 'admin') && expandedCourse === course.id && (
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: expandedCourse === course.id ? '300px' : '0',
              }}
            >
              <div className="mt-4 space-y-2">
                {chapters[course.id]?.length > 0 ? (
                  chapters[course.id].map((chapter) => (
                    <div
                      key={chapter.id}
                      className="bg-gray-800/50 p-2 rounded-lg text-gray-200"
                    >
                      {chapter.title || 'Untitled Chapter'}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No chapters available.</p>
                )}
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
      teacher: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      isFollowed: PropTypes.bool,
      cover_photo: PropTypes.string,
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