// Components/PlaceholderPage.js
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';

const PlaceholderPage = ({ title, description }) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400 mb-4">
        {title}
      </h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">{description}</p>
    </div>
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Teacher Module</h3>
        <p className="text-gray-300 mb-4">
          This module would be imported from:{' '}
          <code className="bg-gray-800 px-2 py-1 rounded text-red-400">
            ./teacher/{title.replace(/\s+/g, '')}
          </code>
        </p>
        <p className="text-sm text-gray-400">
          Create a separate component file and import it at the top of this dashboard
        </p>
      </div>
    </div>
  </div>
);

PlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default PlaceholderPage;