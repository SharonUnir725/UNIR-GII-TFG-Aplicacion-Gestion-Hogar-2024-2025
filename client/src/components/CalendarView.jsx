// client/src/components/CalendarView.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import es from 'date-fns/locale/es';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EventForm from './EventForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar localizador con date-fns y locale español
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  const { token } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';

  const [events, setEvents] = useState([]);
  const [slot, setSlot]     = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 1) Cargar eventos desde la API
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${apiBase}/api/events`, { headers })
      .then(res => {
        const evs = res.data.map(e => ({
          id:    e._id,
          title: e.title,
          start: new Date(e.startDateTime),
          end:   new Date(e.endDateTime)
        }));
        setEvents(evs);
      })
      .catch(err => console.error('Error cargando eventos:', err));
  }, [token, apiBase]);

  // 2) Slot seleccionado
  const handleSelectSlot = ({ start, end }) => {
    setSlot({ start, end });
    setShowForm(true);
  };

  // 3) Tras creación, añadir evento al estado
  const handleCreated = (newEvent) => {
    setEvents(prev => [
      ...prev,
      {
        id:    newEvent._id,
        title: newEvent.title,
        start: new Date(newEvent.startDateTime),
        end:   new Date(newEvent.endDateTime)
      }
    ]);
    setShowForm(false);
    setSlot(null);
  };

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        messages={{
          next: 'Sig', previous: 'Ant', today: 'Hoy',
          month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda'
        }}
        culture="es"
        selectable
        onSelectSlot={handleSelectSlot}
      />

      {showForm && slot && (
        <EventForm
          slot={slot}
          onCancel={() => { setShowForm(false); setSlot(null); }}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
