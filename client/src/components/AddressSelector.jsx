export default function AddressSelector({ addresses = [], value, onChange, onAddNew }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Ubicación</label>
      
      {/* Selector de direcciones */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1"
      >
        <option value="">-- Selecciona ubicación --</option>
        {addresses.map(addr => (
          <option key={addr._id} value={addr._id}>
            {addr.street}
            {addr.number ? `, ${addr.number}` : ''}
            {addr.city ? ` – ${addr.city}` : ''}
          </option>
        ))}
      </select>

      {/* Botón para añadir nueva dirección */}
      {onAddNew && (
        <button
          type="button"
          onClick={onAddNew}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          ➕ Añadir una nueva dirección
        </button>

      )}
    </div>
  );
}
