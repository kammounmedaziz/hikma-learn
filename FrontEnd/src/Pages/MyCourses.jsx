import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActionArea,
  CardActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import {Star} from "lucide-react";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: allCourses } = await axios.get('http://localhost:8000/courses/followed-courses/', {
       headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        // withCredentials: true

      });

      /**const enrolled = await Promise.all(
       allCourses.map(async (course) => {
          try {
            const response = await axios.get(`http://localhost:8000/courses/${course.id}/follow/`, {
             // headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
              withCredentials: true

            });
            return response.data.detail === "Already following this course." ? course : null;
          } catch (err) {
            return null;
          }
        })
      );**/
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
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
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
              }}
            >
              <CardActionArea>
                {course.cover_photo && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={course.cover_photo}
                    sx={{ borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ color: '#FBBF24' }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                    {course.description.slice(0, 100)}...
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#CBD5E0', pt: 1 }}>
                    Teacher : {course.teacher}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ justifyContent: 'flex-end', padding: '0 16px 16px' }}>
                <Button size="small" sx={{ backgroundColor: '#F56565', color: '#FFFFFF', '&:hover': { backgroundColor: '#E53E3E' } }}>
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>

      </div>
    </div>
  </div>
  );
};
export default MyCourses;