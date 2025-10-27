import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

// Import routes
import tramiteRoutes from './routes/tramiteRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import grupoRoutes from './routes/grupoRoutes';
import consultanteRoutes from './routes/consultanteRoutes';
import notificacionRoutes from './routes/notificacionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tramites', tramiteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/consultantes', consultanteRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Backend iniciado en puerto ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'not configured'}`);
  
  // Verificar conexión a la base de datos
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

