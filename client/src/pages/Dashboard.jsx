// client/src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Bell } from 'lucide-react';

export default function Dashboard() {
  const nav = useNavigate();
  const [notifCount, setNotifCount] = React.useState(0);
  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };

  React.useEffect(() => {
    async function fetchNotifs() {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await axios.get(
          `${baseUrl}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifCount(res.data.length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }
    fetchNotifs();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bienvenido a tu Dashboard</h1>
        <Link to="/dashboard/notifications" className="relative">
          <Bell className="w-6 h-6 text-gray-700 hover:text-gray-900" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifCount}
            </span>
          )}
        </Link>
      </div>
      <div className="flex gap-4 mb-6">
        <Link to="/dashboard/create-family">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
            Crear una familia
          </button>
        </Link>
        <Link to="/dashboard/join-family">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            Asociarse a una familia
          </button>
        </Link>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
}
