// client/src/pages/VerifyEmail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/verify-email/${token}`)
      .then(res => {
        if (res.ok) {
          setTimeout(() => navigate('/login'), 5000); 
        }
      });
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Verificando...</p>
    </div>
  );
}

