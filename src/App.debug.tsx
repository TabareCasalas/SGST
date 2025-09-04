import React from 'react';

// App de debug ultra simple
function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SGST - Sistema de Gestión Notarial</h1>
      <p>Frontend funcionando correctamente</p>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Estado del Sistema:</h2>
        <ul>
          <li>✅ React funcionando</li>
          <li>✅ Vite funcionando</li>
          <li>✅ TypeScript funcionando</li>
          <li>✅ Tailwind CSS funcionando</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Pruebas de API:</h2>
        <button 
          onClick={async () => {
            try {
              console.log('Probando API...');
              const response = await fetch('http://localhost:3001/api/tramites');
              const data = await response.json();
              console.log('Respuesta de la API:', data);
              alert(`API funcionando! Trámites: ${data.data?.length || 0}`);
            } catch (error) {
              console.error('Error en API:', error);
              alert('Error en API: ' + error.message);
            }
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Probar API Backend
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Información del Navegador:</h2>
        <p>URL: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;
