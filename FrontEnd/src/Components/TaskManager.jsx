import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit, ClipboardList, Flag, Calendar } from 'lucide-react';

const TaskManager = () => {
  // State declarations
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');
  const [priority, setPriority] = useState('M');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  // Helper to get JWT token
  const getToken = () => localStorage.getItem('access_token');
  const filteredTasks = tasks.filter(task => {
      if (filter === 'active') return !task.completed_at;
      if (filter === 'completed') return task.completed_at;
      return true;
    });
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/workspace/tasks/', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (taskData) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://127.0.0.1:8000/api/workspace/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error(response.status === 400 ? 'Invalid task data' : 'Server error');
      }

      return await response.json();
    } catch (error) {
      console.error('Add task error:', error);
      throw error;
    }
  };

  // Handle task submission
  const handleAddTask = async () => {
    if (!newTask.trim() || isAdding) return;
    
    setIsAdding(true);
    try {
      const task = await addTask({
        title: newTask,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      
      setTasks(prev => [task, ...prev]);
      setNewTask('');
      setDueDate('');
      setPriority('M');
      showNotification('Task added successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to add task', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (task) => {
  try {
    // 1. Create the new completed_at value
    const newCompletedAt = task.completed_at ? null : new Date().toISOString();
    
    // 2. Optimistic UI update - update state immediately
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === task.id 
        ? { 
            ...t,
            completed_at: newCompletedAt,
            xp_earned: newCompletedAt ? (t.xp_earned || 5) : 0
          }
        : t
    ));

    // 3. Send API request
    const response = await fetch(`http://127.0.0.1:8000/api/workspace/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        completed_at: newCompletedAt,
        title: task.title,
        priority: task.priority,
        due_date: task.due_date || null
      })
    });

    // 4. Verify response
    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const updatedTask = await response.json();
    
    // 5. Final state update with server data
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    ));

    // 6. Show notification
    showNotification(
      updatedTask.completed_at 
        ? `Task completed! +${updatedTask.xp_earned} XP`
        : 'Task marked as incomplete',
      'success'
    );

  } catch (err) {
    console.error('Toggle error:', err);
    // 7. Revert on error
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === task.id 
        ? { ...t, completed_at: task.completed_at }
        : t
    ));
    showNotification(err.message, 'error');
  }
};

  // Save edited task
  const saveEdit = async (id) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;

      const response = await fetch(`http://127.0.0.1:8000/api/workspace/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ 
          title: editText,
          priority: taskToUpdate.priority,  
          due_date: taskToUpdate.due_date,  
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTaskId(null);
      showNotification('Task updated successfully', 'success');
    } catch (err) {
      console.error('Edit task error:', err);
      showNotification(err.message, 'error');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/workspace/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete task');
      }
      
      setTasks(tasks.filter(task => task.id !== id));
      showNotification('Task deleted successfully', 'success');
    } catch (err) {
      console.error('Delete task error:', err);
      showNotification(err.message, 'error');
    }
  };

  // Notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'H': return 'bg-red-500/20 border-red-500';
      case 'M': return 'bg-yellow-500/20 border-yellow-500';
      case 'L': return 'bg-green-500/20 border-green-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  // Handle keyboard submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-500/90' 
            : 'bg-red-500/90'
        } text-white z-50 transition-opacity duration-300`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <ClipboardList className="w-6 h-6 mr-2 text-red-400" />
          Task Manager
        </h2>
      </div>

      {/* Add Task Form */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
          disabled={isAdding}
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-gray-800/50 border border-gray-600 text-white rounded-lg px-3"
            disabled={isAdding}
          >
            <option value="H">High</option>
            <option value="M">Medium</option>
            <option value="L">Low</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-gray-800/50 border border-gray-600 text-white rounded-lg px-3"
            disabled={isAdding}
          />
          <button
            onClick={handleAddTask}
            disabled={isAdding || !newTask.trim()}
            className={`px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg transition-all flex items-center ${
              isAdding || !newTask.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-600 hover:to-red-700'
            }`}
          >
            {isAdding ? 'Adding...' : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Task Filter Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'all' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'active' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded-lg ${
            filter === 'completed' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            Error: {error}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {filter === 'all' && 'No tasks yet. Add your first task above!'}
            {filter === 'active' && 'No active tasks!'}
            {filter === 'completed' && 'No completed tasks yet!'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                task.completed_at 
                  ? 'bg-gray-800/20 border-gray-700 text-gray-500'
                  : `bg-gray-800/50 ${getPriorityColor(task.priority)} border`
              }`}
            >
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-gray-700 text-white p-2 rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task.id);
                      if (e.key === 'Escape') setEditingTaskId(null);
                    }}
                    onBlur={() => saveEdit(task.id)}
                  />
                  <div className="flex gap-2 ml-2">
                    <button 
                      onClick={() => saveEdit(task.id)}
                      className="p-2 text-green-400 hover:text-green-300"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="p-2 text-gray-400 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleTask(task)}
                      className={`w-5 h-5 rounded mr-3 flex items-center justify-center transition-colors ${
                        task.completed_at 
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'border border-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {task.completed_at && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div
                    className={`task-item ${task.completed_at ? 'completed' : 'active'}`}
                    style={{
                      opacity: task.completed_at ? 0.7 : 1,
                      textDecoration: task.completed_at ? 'line-through' : 'none'
                    }}
                    >
                      <span className={`${task.completed_at ? 'line-through' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {task.priority && (
                          <span className={`flex items-center ${
                            task.priority === 'H' ? 'text-red-400' :
                            task.priority === 'M' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            <Flag className="w-3 h-3 mr-1" />
                            {task.priority === 'H' ? 'High' : task.priority === 'M' ? 'Medium' : 'Low'}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.completed_at && task.xp_earned > 0 && (
                          <span className="flex items-center text-yellow-400">
                            +{task.xp_earned} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-1 text-gray-400 hover:text-yellow-400"
                      disabled={task.completed_at}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;