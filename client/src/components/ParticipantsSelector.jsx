// client/src/components/ParticipantsSelector.jsx
import React from 'react'

export default function ParticipantsSelector({ members = [], selected = [], onChange }) {
  const toggle = id => {
    if (!onChange) return
    onChange(
      selected.includes(id)
        ? selected.filter(x => x !== id)
        : [...selected, id]
    )
  }

  return (
    <div className="mb-3">
      <label className="block font-medium mb-1">Participantes</label>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
        {members.map(m => (
          <label key={m._id} className="flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(m._id)}
              onChange={() => toggle(m._id)}
              className="mr-2"
            />
            {m.firstName}
          </label>
        ))}
      </div>
    </div>
  )
}
