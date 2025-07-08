// client/src/components/AddressSelector.jsx
export default function AddressSelector({ addresses = [], value, onChange, onAddNew }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Ubicación</label>
      <div className="flex items-center space-x-2">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 border p-2 rounded"
        >
          <option value="">-- Selecciona ubicación --</option>
          {addresses.map(addr => (
            <option key={addr._id} value={addr._id}>
              {addr.street}{addr.number ? `, ${addr.number}` : ''}{addr.city ? ` – ${addr.city}` : ''}
            </option>
          ))}
        </select>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xl"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
