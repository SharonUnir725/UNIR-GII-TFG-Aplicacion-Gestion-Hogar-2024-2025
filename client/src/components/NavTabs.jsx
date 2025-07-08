// client/src/components/NavTabs.jsx
export default function NavTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'direccion',  label: 'Dirección' },
    { id: 'miembros',   label: 'Miembros' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'tareas',     label: 'Tareas' }
  ];

  return (
    <ul className="space-y-2">
      {tabs.map(tab => (
        <li key={tab.id}>
          <button
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-2 py-1 rounded ${
              activeTab === tab.id ? 'bg-gray-300 font-semibold' : ''
            }`}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
