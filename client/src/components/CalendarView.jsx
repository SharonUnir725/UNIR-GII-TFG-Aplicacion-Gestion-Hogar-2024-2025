// client/src/components/CalendarView.jsx
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import es from 'date-fns/locale/es';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EventForm from './EventForm';
import EventDetail from './EventDetail';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Localizador con date-fns y locale español
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  const { token } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';

  // Estados
  const [events, setEvents]               = useState([]);
  const [date, setDate]                   = useState(new Date());
  const [view, setView]                   = useState('month');
  const [slot, setSlot]                   = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent]   = useState(null);

  // 1) Cargar eventos
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${apiBase}/api/events`, { headers })
      .then(res => {
        setEvents(
          res.data.map(e => ({
            id:    e._id,
            title: e.title,
            start: new Date(e.startDateTime),
            end:   new Date(e.endDateTime),
          }))
        );
      })
      .catch(err => console.error('Error cargando eventos:', err));
  }, [token, apiBase]);

  // 2) Seleccionar slot para crear evento
  const handleSelectSlot = ({ start, end }) => {
    setSlot({ start, end });
    setShowForm(true);
  };

  // 3) Clic en evento para ver detalle
  const handleSelectEvent = evt => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${apiBase}/api/events/${evt.id}`, { headers })
      .then(res => setSelectedEvent(res.data))
      .catch(err => console.error('Error cargando detalle:', err));
  };

  // 4) Tras creación
  const handleCreated = newEvent => {
    setEvents(prev => [
      ...prev,
      {
        id:    newEvent._id,
        title: newEvent.title,
        start: new Date(newEvent.startDateTime),
        end:   new Date(newEvent.endDateTime),
      },
    ]);
    setShowForm(false);
    setSlot(null);
  };

  // 5) Al pulsar "Modificar evento" en el detalle
  const handleEditEvent = evData => {
    setEditingEvent({
      _id:           evData._id,
      title:         evData.title,
      startDateTime: evData.startDateTime,
      endDateTime:   evData.endDateTime,
      locatedAt:     evData.locatedAt?._id,
      participants:  evData.participants.map(u => u._id),
    });
    setSelectedEvent(null);
  };

  // 6) Tras actualizar
  const handleUpdated = upd => {
    setEvents(prev =>
      prev.map(e =>
        e.id === upd._id
          ? {
              id:    upd._id,
              title: upd.title,
              start: new Date(upd.startDateTime),
              end:   new Date(upd.endDateTime),
            }
          : e
      )
    );
    setEditingEvent(null);
  };

  // 7) Eliminar evento
  const handleDeleteEvent = async eventId => {
    if (!token) return;
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este evento?');
    if (!confirmDelete) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/api/events/${eventId}`, { headers });
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error eliminando evento:', err);
      alert('Hubo un error al eliminar el evento.');
    }
  };

  return (
    <div className="p-6">
      {/* Contenedor del calendario */}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={newDate => setDate(newDate)}
          view={view}
          onView={newView => setView(newView)}
          views={['month', 'week', 'day', 'agenda']}
          style={{ height: 600, minWidth: '700px' }}
          messages={{
            next: 'Sig',
            previous: 'Ant',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
          }}
          culture="es"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#2563eb', 
              borderRadius: '6px',
              padding: '2px 4px',
              color: '#fff',
              border: 'none',
            },
          })}
        />
      </div>

      {/* Modales */}
      {(showForm && slot) || selectedEvent || editingEvent ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {showForm && slot && (
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
              <EventForm
                slot={slot}
                onCancel={() => {
                  setShowForm(false);
                  setSlot(null);
                }}
                onCreated={handleCreated}
              />
            </div>
          )}

          {selectedEvent && (
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
              <EventDetail
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            </div>
          )}

          {editingEvent && (
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
              <EventForm
                event={editingEvent}
                onCancel={() => setEditingEvent(null)}
                onUpdated={handleUpdated}
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
