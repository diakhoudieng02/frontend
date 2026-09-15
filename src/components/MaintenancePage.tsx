// src/components/MaintenancePage.tsx
import React from 'react';
import maintenanceService from '../services/maintenance.service';

const MaintenancePage: React.FC = () => {
  const status = maintenanceService.getStatus();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>
          🚧 Maintenance
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>
          DocuSage AI est actuellement en maintenance pour amélioration.
        </p>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px' }}>
          Nous serons de retour dans quelques instants.
        </p>

        {/* Bouton de rafraîchissement */}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Rafraîchir
        </button>

        {/* Panneau debug (visible seulement si debug actif) */}
        {status.debug && (
          <div style={{
            marginTop: '50px',
            padding: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ marginBottom: '10px' }}>🔧 MODE DEBUG</h3>
            <p>Maintenance: {status.maintenance ? 'ACTIVÉE' : 'désactivée'}</p>
            <p>Debug: ACTIVÉ</p>
            <button
              onClick={() => maintenanceService.toggleDebug(false)}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Désactiver le mode debug
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;