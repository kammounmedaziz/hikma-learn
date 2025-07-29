import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  CardActions,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from '@mui/material';
import { ChevronRight, StarOff } from 'lucide-react';

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unfollowCourseId, setUnfollowCourseId] = useState(null);
  const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: allCourses } = await axios.get('http://localhost:8000/courses/followed-courses/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });

      setEnrolledCourses(allCourses);
    } catch (error) {
      console.error('Failed to fetch courses', error.response?.status || error.message);
      setError('Failed to load courses. Please check your authentication or server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const handleUnenroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.delete(`http://localhost:8000/courses/${courseId}/follow/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
        setEnrolledCourses(prev => prev.filter(course => course.id !== courseId));
      }
    } catch (error) {
      console.error('Failed to unenroll from course', error.message);
      setError('Failed to unenroll from course. Please try again.');
    }
  };

  const handleUnenrollClick = (courseId) => {
    setUnfollowCourseId(courseId);
    setUnfollowDialogOpen(true);
  };

  const handleUnfollowConfirm = () => {
    if (unfollowCourseId) {
      handleUnenroll(unfollowCourseId);
    }
    setUnfollowDialogOpen(false);
    setUnfollowCourseId(null);
  };

  const handleUnfollowCancel = () => {
    setUnfollowDialogOpen(false);
    setUnfollowCourseId(null);
  };

  // Handle Escape key to act as "No"
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && unfollowDialogOpen) {
        handleUnfollowCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [unfollowDialogOpen]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <Typography variant="body1" color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
          My Courses
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Explore your enrolled courses
        </p>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
        <div className="mb-4">
          <Grid container spacing={2}>
            {enrolledCourses.length === 0 ? (
              <Typography variant="body1" style={{ padding: '2rem' }}>No courses enrolled.</Typography>
            ) : (
              enrolledCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      color: '#E2E8F0',
                      border: '2px solid #f7e7bc',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 20px rgba(251, 191, 36, 0.5)',
                      },
                      animation: 'pulse 2s infinite',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardActionArea sx={{ flexGrow: 1 }}>
                      {course.cover_photo && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={course.cover_photo}
                          sx={{ borderTopLeftRadius: '14px', borderTopRightRadius: '14px', objectFit: 'cover' }}
                        />
                      )}
                      {!course.cover_photo && (
                        <div style={{ height: '140px', backgroundColor: '#2D3748', borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }} />
                      )}
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#FBBF24' }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#CBD5E0', pt: 1 }}>
                          Teacher : {course.teacher}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ padding: '0 16px 16px', justifyContent: 'space-between' }}>
                      <Tooltip title="View" placement="top" slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <IconButton
                          component={Link}
                          to={`/courses/${course.id}/`}
                          sx={{
                            backgroundColor: '#F56565',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#E53E3E' },
                            minWidth: '40px',
                            padding: '8px',
                            borderRadius: '50%',
                          }}
                        >
                          <ChevronRight size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Unenroll" placement="top" slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <IconButton
                          onClick={() => handleUnenrollClick(course.id)}
                          sx={{
                            backgroundColor: '#F56565',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            '&:hover': { backgroundColor: '#E53E3E' },
                          }}
                        >
                          <StarOff color="white" size={20} />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </div>
      </div>

      <Dialog
        open={unfollowDialogOpen}
        onClose={handleUnfollowCancel}
        PaperProps={{
          sx: {
            backgroundColor: '#2D3748',
            color: '#E2E8F0',
            border: '2px solid #F56565',
            borderRadius: '16px',
          },
        }}
      >
        <DialogContent>
          <DialogContentText sx={{ color: '#E2E8F0' }}>
            Are you sure you want to unfollow from this course?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnfollowCancel} sx={{ color: '#CBD5E0', '&:hover': { color: '#F56565' } }}>
            No
          </Button>
          <Button onClick={handleUnfollowConfirm} sx={{ color: '#F56565', '&:hover': { color: '#E53E3E' } }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyCourses;