import TaskManager from './TaskManager';
import PomodoroTimer from './PomodoroTimer';
import Whiteboard from './Whiteboard';
import Achievements from './Achievements';
import UserProfile from './UserProfile';
import PropTypes from 'prop-types';

const WorkspaceLayout = ({ activeTab }) => {
  const workspaceId = 1; // In a real app, this would come from router params
  
  switch(activeTab) {
    case 'tasks':
      return <TaskManager />;
    case 'pomodoro':
      return <PomodoroTimer />;
    case 'whiteboard':
      return <Whiteboard workspaceId={workspaceId} />;
    case 'achievements':
      return <Achievements />;
    case 'profile':
      return <UserProfile />;
    default:
      return (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to FocusForge</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Select a tool from the sidebar to get started. Track your progress, earn XP, 
            and unlock achievements as you complete tasks and focus sessions.
          </p>
        </div>
      );
  }
};

WorkspaceLayout.propTypes = {
  activeTab: PropTypes.string.isRequired,
};

export default WorkspaceLayout;