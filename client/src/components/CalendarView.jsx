import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import es from 'date-fns/locale/es';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EventForm from './EventForm';
import EventDetail from './EventDetail';
import ParticipantsSelector from './ParticipantsSelector';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Localizador con date-fns y locale español
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  const { token, user } = useAuth();
  const apiBase = process.env.REACT_APP_API_URL || '';

  // Estados para eventos y filtros
  const [events, setEvents]                 = useState([]);
  const [members, setMembers]               = useState([]); // Miembros de la familia
  const [selectedMembers, setSelectedMembers] = useState([]); // IDs seleccionados en el filtro
  const [filterStart, setFilterStart]       = useState('');
  const [filterEnd, setFilterEnd]           = useState('');

  // Estados para la interacción del calendario
  const [date, setDate]                     = useState(new Date());
  const [view, setView]                     = useState('month');
  const [slot, setSlot]                     = useState(null);
  const [showForm, setShowForm]             = useState(false);
  const [selectedEvent, setSelectedEvent]   = useState(null);
  const [editingEvent, setEditingEvent]     = useState(null);

  // Cargar miembros de la familia desde el backend
  useEffect(() => {
    if (!token || !user?.familyId) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${apiBase}/api/users?familyId=${user.familyId}`, { headers }) // solo miembros de la familia
      .then(res => setMembers(res.data))
      .catch(err => console.error('Error cargando miembros de familia:', err));
  }, [token, user?.familyId, apiBase]);

  // Función para cargar eventos con filtros opcionales
  const loadEvents = () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const params = {};

    // Filtrar por participante si hay alguno seleccionado
    if (selectedMembers.length > 0) {
      params.userId = selectedMembers[0];
    }
    // Filtrar por rango de fechas si se han seleccionado
    if (filterStart) params.startDate = filterStart;
    if (filterEnd) params.endDate = filterEnd;

    axios
      .get(`${apiBase}/api/events`, { headers, params })
      .then(res => {
        setEvents(
          res.data.map(e => ({
            id: e._id,
            title: e.title,
            start: new Date(e.startDateTime),
            end: new Date(e.endDateTime),
          }))
        );
      })
      .catch(err => console.error('Error cargando eventos:', err));
  };

  // Cargar eventos al iniciar
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Abrir formulario al seleccionar un espacio vacío en el calendario
  const handleSelectSlot = ({ start, end }) => {
    setSlot({ start, end });
    setShowForm(true);
  };

  // Mostrar detalle de un evento al hacer clic
  const handleSelectEvent = evt => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${apiBase}/api/events/${evt.id}`, { headers })
      .then(res => setSelectedEvent(res.data))
      .catch(err => console.error('Error cargando detalle:', err));
  };

  // Añadir un nuevo evento tras crear
  const handleCreated = newEvent => {
    setEvents(prev => [
      ...prev,
      {
        id: newEvent._id,
        title: newEvent.title,
        start: new Date(newEvent.startDateTime),
        end: new Date(newEvent.endDateTime),
      },
    ]);
    setShowForm(false);
    setSlot(null);
  };

  // Preparar edición de un evento
  const handleEditEvent = evData => {
    setEditingEvent({
      _id: evData._id,
      title: evData.title,
      startDateTime: evData.startDateTime,
      endDateTime: evData.endDateTime,
      locatedAt: evData.locatedAt?._id,
      participants: evData.participants.map(u => u._id),
    });
    setSelectedEvent(null);
  };

  // Actualizar evento tras edición
  const handleUpdated = upd => {
    setEvents(prev =>
      prev.map(e =>
        e.id === upd._id
          ? {
              id: upd._id,
              title: upd.title,
              start: new Date(upd.startDateTime),
              end: new Date(upd.endDateTime),
            }
          : e
      )
    );
    setEditingEvent(null);
  };

  // Eliminar un evento
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
      {/* Controles de filtros */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        {/* Selector de participantes (miembros de la familia) */}
        <ParticipantsSelector
          members={members}
          selected={selectedMembers}
          onChange={setSelectedMembers}
        />

        {/* Selector de fechas para rango */}
        <div className="flex flex-col gap-2">
          <label>Desde:</label>
          <input
            type="date"
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
            className="border p-2 rounded"
          />
          <label>Hasta:</label>
          <input
            type="date"
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Botón para aplicar filtros */}
        <button
          onClick={loadEvents}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end"
        >
          Aplicar filtros
        </button>
      </div>

      {/* Calendario principal */}
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

      {/* Formularios y modales para eventos */}
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
