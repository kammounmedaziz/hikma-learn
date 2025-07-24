import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Grid,
  CircularProgress,
  Tooltip,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
} from '@mui/material';
import { Plus, ChevronRight, AlignJustify, SquarePen, Trash2, Type, Text, Image } from 'lucide-react';
import AnimatedBackground from "../Components/Background";

const MyCoursesTeacher = () => {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', cover_photo: null });
  const [addForm, setAddForm] = useState({ title: '', description: '', cover_photo: null });
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchTeacherCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data: allCourses } = await axios.get('http://localhost:8000/courses/my-courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Courses fetched:', allCourses);
      setTeacherCourses(allCourses);
    } catch (error) {
      console.error('Fetch error:', error.response?.status || error.message);
      setError('Failed to load courses. Please ensure you are logged in or check server status.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const handleMenuOpen = (event, courseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourseId(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourseId(null);
  };

  const handleEditOpen = (course) => {
    setSelectedCourse(course);
    setEditForm({ title: course.title, description: course.description, cover_photo: course.cover_photo || null });
    setEditOpen(true);
    handleMenuClose();
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditForm({ title: '', description: '', cover_photo: null });
    setSelectedCourse(null);
  };

  const handleDeleteOpen = (course) => {
    setSelectedCourse(course);
    setDeleteOpen(true);
    handleMenuClose();
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedCourse(null);
  };

  const handleAddOpen = () => {
    setAddForm({ title: '', description: '', cover_photo: null });
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setAddForm({ title: '', description: '', cover_photo: null });
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      if (editForm.cover_photo && typeof editForm.cover_photo !== 'string') {
        formData.append('cover_photo', editForm.cover_photo);
      }

      await axios.put(`http://localhost:8000/courses/${selectedCourse.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      const updatedCourse = { ...selectedCourse, ...editForm };
      if (editForm.cover_photo && typeof editForm.cover_photo !== 'string') {
        updatedCourse.cover_photo = URL.createObjectURL(editForm.cover_photo); // Temporary URL for preview
      }
      setTeacherCourses(teacherCourses.map(course =>
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      handleEditClose();
    } catch (error) {
      console.error('Edit error:', error.response?.status || error.message);
      setError('Failed to update course.');
    }
  };

  const handleAddSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', addForm.title);
      formData.append('description', addForm.description);
      if (addForm.cover_photo) {
        formData.append('cover_photo', addForm.cover_photo);
      }

      const { data: newCourse } = await axios.post('http://localhost:8000/courses/', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setTeacherCourses([...teacherCourses, newCourse]);
      handleAddClose();
    } catch (error) {
      console.error('Add error:', error.response?.status || error.message);
      setError('Failed to add course.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/courses/${selectedCourse.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeacherCourses(teacherCourses.filter(course => course.id !== selectedCourse.id));
      handleDeleteClose();
    } catch (error) {
      console.error('Delete error:', error.response?.status || error.message);
      setError('Failed to delete course.');
    }
  };

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (editOpen) handleEditClose();
        else if (addOpen) handleAddClose();
        else if (deleteOpen) handleDeleteClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editOpen, addOpen, deleteOpen]);

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
    <div className="space-y-8 relative">
      <AnimatedBackground />
      <div className="text-center mb-8 relative">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
          My Courses
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Manage your teaching courses
        </p>
        <Tooltip title="Add" placement="top" arrow slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
          <Button
            variant="contained"
            sx={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: '#F56565',
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#E53E3E' },
              minWidth: '40px',
              padding: '8px',
              borderRadius: '50%',
            }}
            onClick={handleAddOpen}
          >
            <Plus size={20} />
          </Button>
        </Tooltip>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
        <div className="mb-4">
          <Grid container spacing={2}>
            {teacherCourses.length === 0 ? (
              <Typography variant="body1" style={{ padding: '2rem' }}>No courses assigned.</Typography>
            ) : (
              teacherCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      margin: '0 auto',
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
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'visible',
                    }}
                  >
                    <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 180,
                          overflow: 'hidden',
                          borderTopLeftRadius: '14px',
                          borderTopRightRadius: '14px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {course.cover_photo ? (
                          <img
                            src={course.cover_photo}
                            alt={course.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#2D3748' }} />
                        )}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#FBBF24' }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#CBD5E0', pt: 1 }}>
                          Created: {formatDate(course.creation_date)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    <CardActions sx={{ padding: '0 16px 16px', justifyContent: 'flex-end' }}>
                      <Tooltip title="View" placement="top" arrow slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <Link to={`/courses/${course.id}/chapters/`}>
                          <Button
                            size="small"
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
                          </Button>
                        </Link>
                      </Tooltip>
                      <Tooltip title="More" placement="top" arrow slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: '#F56565',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#E53E3E' },
                            marginLeft: '8px',
                            minWidth: '40px',
                            padding: '8px',
                            borderRadius: '50%',
                          }}
                          onClick={(e) => handleMenuOpen(e, course.id)}
                        >
                          <AlignJustify size={20} />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedCourseId === course.id}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    PaperProps={{
                      sx: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Tooltip title="Edit" placement="top" arrow slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <Button
                          size="small"
                          sx={{
                            backgroundColor: '#F56565',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#E53E3E' },
                            minWidth: '40px',
                            padding: '8px',
                            borderRadius: '50%',
                          }}
                          onClick={() => handleEditOpen(course)}
                        >
                          <SquarePen size={20} />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Delete" placement="top" arrow slotProps={{ tooltip: { sx: { backgroundColor: '#2D3748', color: '#FFFFFF', border: '1px solid #F56565' } } }}>
                        <Button
                          size="small"
                          sx={{
                            backgroundColor: '#F56565',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#E53E3E' },
                            minWidth: '40px',
                            padding: '8px',
                            borderRadius: '50%',
                          }}
                          onClick={() => handleDeleteOpen(course)}
                        >
                          <Trash2 size={20} />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Menu>
                </Grid>
              ))
            )}
          </Grid>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-red-400/30">
            <h2 className="text-2xl font-semibold mb-6 text-red-300">Edit Course</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Type size={20} color="#F56565" />
                <input
                  type="text"
                  placeholder="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <Text size={20} color="#F56565" />
                <textarea
                  rows={5}
                  placeholder="Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <Image size={20} color="#F56565" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleEditSave}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Save
              </button>
              <button
                onClick={handleEditClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-red-400/30">
            <h2 className="text-2xl font-semibold mb-6 text-red-300">Add Course</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Type size={20} color="#F56565" />
                <input
                  type="text"
                  placeholder="Title"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <Text size={20} color="#F56565" />
                <textarea
                  rows={5}
                  placeholder="Description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <Image size={20} color="#F56565" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAddForm({ ...addForm, cover_photo: e.target.files[0] })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleAddSave}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Add
              </button>
              <button
                onClick={handleAddClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-red-400/30">
            <h2 className="text-xl font-semibold mb-6 text-red-300 text-center">Confirm Delete</h2>
            <p className="text-center text-gray-300 mb-6">
              Are you sure you want to delete "<span className="text-red-400">{selectedCourse?.title}</span>"?
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleDeleteClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesTeacher;