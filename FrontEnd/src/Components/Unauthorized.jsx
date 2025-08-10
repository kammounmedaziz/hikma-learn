// src/Pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center mt-5">
      <h1>401 Unauthorized</h1>
      <p>You don&apos;t have permission to access this page.</p>
      <Button 
        variant="danger" 
        onClick={() => navigate(-1)}
      >
        Go Back
      </Button>
      <Button 
        variant="primary" 
        onClick={() => navigate('/')}
        className="ms-2"
      >
        Go Home
      </Button>
    </div>
  );
};

export default Unauthorized;