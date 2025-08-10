import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Pen, Circle, Square, Type, SquarePen, Save } from 'lucide-react';
import { fetchWithAuth } from '../services/api';

const Whiteboard = ({ workspaceId }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444');
  const [tool, setTool] = useState('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [textInput, setTextInput] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    fetchWithAuth(`/whiteboards/${workspaceId}/`)
      .then(data => {
        if (data.data && data.data.imageData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = data.data.imageData;
        }
        setLastUpdate(new Date(data.last_updated).toLocaleString());
      })
      .catch(err => {
        setLastUpdate('Error');
        console.error(err);
      });
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [workspaceId]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    setIsDrawing(true);
    
    if (tool === 'text') {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      
      ctx.font = `${lineWidth * 5}px Arial`;
      ctx.fillText(textInput, x, y);
      saveCanvas();
      setTextInput('');
    } else {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    } else if (tool === 'circle') {
      // Implement circle drawing
    } else if (tool === 'rectangle') {
      // Implement rectangle drawing
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveCanvas();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    fetchWithAuth(`/whiteboards/${workspaceId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        data: { imageData: dataUrl } 
      })
    })
    .then(data => {
      setLastUpdate(new Date(data.last_updated).toLocaleString());
    })
    .catch(err => {
      setLastUpdate('Error');
      console.error(err);
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvas();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <SquarePen className="w-6 h-6 mr-2 text-red-400" />
          Whiteboard
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last saved: {lastUpdate || 'Never'}
          </span>
          <button
            onClick={saveCanvas}
            className="p-2 bg-green-600 rounded-lg hover:bg-green-700 text-white"
            title="Save"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
            title="Clear"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-lg ${
            tool === 'pen' 
              ? 'bg-red-500/20 border border-red-400' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title="Pen"
        >
          <Pen className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('circle')}
          className={`p-2 rounded-lg ${
            tool === 'circle' 
              ? 'bg-red-500/20 border border-red-400' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title="Circle"
        >
          <Circle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('rectangle')}
          className={`p-2 rounded-lg ${
            tool === 'rectangle' 
              ? 'bg-red-500/20 border border-red-400' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title="Rectangle"
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('text')}
          className={`p-2 rounded-lg ${
            tool === 'text' 
              ? 'bg-red-500/20 border border-red-400' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title="Text"
        >
          <Type className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 cursor-pointer bg-transparent"
          />
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="bg-gray-700 text-white rounded-lg px-2 py-1"
          >
            <option value="1">Thin</option>
            <option value="3">Medium</option>
            <option value="5">Thick</option>
            <option value="8">Extra Thick</option>
          </select>
        </div>
      </div>

      {tool === 'text' && (
        <div className="mb-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type text to add..."
            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
      )}

      <div className="backdrop-blur-md bg-white/5 rounded-xl border border-gray-600 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-[600px] cursor-crosshair"
        />
      </div>
    </div>
  );
};
Whiteboard.propTypes = {
  workspaceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};


export default Whiteboard;