// client/src/components/AssocDetail.jsx
import React from 'react';

/**
 * Subcomponente para mostrar detalle de "join_request" (asociación a familia)
 * Recibe la notificación y la función onDecision para aprobar/rechazar
 */
export default function AssocDetail({ notification, onDecision }) {
  const { payload } = notification;
  const { userName } = payload;

  return (
    <>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <p>
          El usuario <strong>{userName}</strong> solicita unirse a la familia.
        </p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => onDecision('approve')} style={{ marginRight: 8 }}>
          Aprobar
        </button>
        <button onClick={() => onDecision('reject')}>
          Rechazar
        </button>
      </div>
    </>
  );
}