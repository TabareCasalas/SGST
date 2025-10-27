import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import { deployProcesses } from './deployment';
import { createLogger } from './logger';

dotenv.config();

const app = express();
const PORT = process.env.ORCHESTRATOR_PORT || 3002;
const logger = createLogger();

// Middleware para parsear JSON
app.use(express.json());

// URL de Camunda REST API
const CAMUNDA_URL = process.env.CAMUNDA_URL || 'http://camunda:8080/engine-rest';

// Cliente para comunicarse con Camunda
const camundaClient = axios.create({
  baseURL: CAMUNDA_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente para comunicarse con el backend
const backendClient = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://backend:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ya tenemos logger importado arriba

// ==================== ENDPOINTS REST ====================
// Estos endpoints permiten que el backend inicie procesos en Camunda

/**
 * Endpoint: POST /api/procesos/iniciar
 * Permite que el backend inicie un nuevo proceso en Camunda
 * 
 * Body:
 * {
 *   "processKey": "iniciarTramite",
 *   "variables": { ... }
 * }
 */
app.post('/api/procesos/iniciar', async (req: express.Request, res: express.Response) => {
  try {
    const { processKey, variables } = req.body;

    if (!processKey) {
      return res.status(400).json({ error: 'processKey es requerido' });
    }

    logger.info(`🚀 Iniciando proceso en Camunda: ${processKey}`);

    // Convertir variables a formato Camunda
    const camundaVariables: any = {};
    for (const [key, value] of Object.entries(variables || {})) {
      camundaVariables[key] = {
        value: value,
        type: typeof value === 'boolean' ? 'Boolean' : 
              typeof value === 'number' ? 'Integer' : 'String'
      };
    }

    logger.info('Variables en formato Camunda:', camundaVariables);

    // Llamar a Camunda REST API para iniciar el proceso
    const response = await camundaClient.post(
      `/process-definition/key/${processKey}/start`,
      {
        variables: camundaVariables,
      }
    );

    logger.info(`✅ Proceso iniciado exitosamente. Instance ID: ${response.data.id}`);

    res.json({
      success: true,
      instanceId: response.data.id,
      processDefinitionId: response.data.definitionId,
    });
  } catch (error: any) {
    logger.error('❌ Error al iniciar proceso en Camunda:', error.message);
    logger.error('Error details:', error.response?.data || error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Error al iniciar proceso en Camunda',
      details: error.response?.data,
    });
  }
});

/**
 * Endpoint: GET /api/procesos/:instanceId
 * Obtiene información de una instancia de proceso
 */
app.get('/api/procesos/:instanceId', async (req: express.Request, res: express.Response) => {
  try {
    const { instanceId } = req.params;

    const response = await camundaClient.get(`/process-instance/${instanceId}`);

    res.json(response.data);
  } catch (error: any) {
    logger.error('❌ Error al obtener proceso:', error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Error al obtener proceso',
    });
  }
});

/**
 * Endpoint: POST /api/procesos/:instanceId/completar-tarea
 * Completa una tarea manual (User Task) en Camunda
 */
app.post('/api/procesos/:instanceId/completar-tarea', async (req: express.Request, res: express.Response) => {
  try {
    const { instanceId } = req.params;
    const { variables } = req.body;

    logger.info(`🔄 Completando tarea para proceso: ${instanceId}`);

    // Obtener las tareas activas del proceso
    const tasksResponse = await camundaClient.get('/task', {
      params: {
        processInstanceId: instanceId,
      },
    });

    const tasks = tasksResponse.data;

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'No hay tareas activas para este proceso' });
    }

    // Completar la primera tarea (User Task)
    const taskId = tasks[0].id;
    logger.info(`📝 Completando tarea: ${taskId}`);

    // Convertir variables a formato Camunda si es necesario
    const camundaVariables: any = {};
    for (const [key, value] of Object.entries(variables || {})) {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        // Ya está en formato Camunda
        camundaVariables[key] = value;
      } else {
        // Convertir a formato Camunda
        camundaVariables[key] = {
          value: value,
          type: typeof value === 'boolean' ? 'Boolean' : 
                typeof value === 'number' ? 'Integer' : 'String'
        };
      }
    }

    // Completar la tarea
    await camundaClient.post(`/task/${taskId}/complete`, {
      variables: camundaVariables,
    });

    logger.info(`✅ Tarea ${taskId} completada exitosamente`);

    res.json({
      success: true,
      taskId,
      message: 'Tarea completada exitosamente',
    });
  } catch (error: any) {
    logger.error('❌ Error al completar tarea:', error.message);
    logger.error('Error details:', error.response?.data || error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Error al completar tarea',
      details: error.response?.data,
    });
  }
});

// ==================== EXTERNAL TASKS HANDLERS ====================
// Estos handlers ejecutan las tareas externas que Camunda asigna

/**
 * Verifica periodicamente por nuevas tareas externas de Camunda
 */
async function checkExternalTasks(): Promise<void> {
  try {
    // Obtener tareas externas sin completar
    // fetchAndLock requiere POST con body con topics
    const response = await camundaClient.post('/external-task/fetchAndLock', {
      workerId: 'sgst-orchestrator',
      maxTasks: 10,
      usePriority: true,
      topics: [
        { topicName: 'actualizar-estado', lockDuration: 60000 },
        { topicName: 'enviar-notificacion', lockDuration: 60000 },
      ],
    });

    const tasks = response.data || [];

    if (tasks && tasks.length > 0) {
      logger.info(`📋 Encontradas ${tasks.length} tareas externas pendientes`);
    }

    // Procesar cada tarea
    for (const task of tasks) {
      await processExternalTask(task);
    }
  } catch (error: any) {
    if (error.response?.status !== 404) {
      logger.error('❌ Error al verificar tareas externas:', error.message);
    }
  }
}

/**
 * Procesa una tarea externa individual
 */
async function processExternalTask(task: Record<string, any>): Promise<void> {
  const topicName = task.topicName;
  logger.info(`📝 Procesando tarea externa: ${topicName} (ID: ${task.id})`);

  try {
    switch (topicName) {
      case 'crear-tramite':
        await handleCrearTramite(task);
        break;
      case 'actualizar-estado':
        await handleActualizarEstado(task);
        break;
      case 'enviar-notificacion':
        await handleEnviarNotificacion(task);
        break;
      default:
        logger.error(`❌ Tópico desconocido: ${topicName}`);
        await completeTask(task.id, {});
    }
  } catch (error: any) {
    logger.error(`❌ Error al procesar tarea ${task.id}:`, error.message);
    await handleTaskFailure(task, error);
  }
}

/**
 * Handler para crear trámite
 * Esta tarea viene DESPUÉS de que el backend ya guardó el trámite
 */
async function handleCrearTramite(task: Record<string, any>): Promise<void> {
  logger.info('📝 Procesando handler: crear-tramite');
  
  // Extraer variables de la tarea
  const variables = extractVariables(task.variables);
  
  logger.info('📤 Datos de la tarea:', variables);

  // Aquí podrías hacer lógica adicional si es necesaria
  // Por ejemplo, validar o enriquecer datos
  
  // Completar la tarea
  await completeTask(task.id, {});
}

/**
 * Handler para actualizar estado
 */
async function handleActualizarEstado(task: Record<string, any>): Promise<void> {
  logger.info('🔄 Procesando handler: actualizar-estado');

  const variables = extractVariables(task.variables);
  const { id_tramite, estado, observaciones } = variables;

  logger.info('📤 Actualizando trámite:', { id_tramite, estado });

  // Llamar al backend para actualizar el estado
  await backendClient.patch(`/api/tramites/${id_tramite}`, {
    estado: estado || 'en_revision', // Por defecto en revisión si no se especifica
    observaciones,
  });

  logger.info('✅ Trámite actualizado exitosamente');

  // Completar la tarea
  await completeTask(task.id, {});
}

/**
 * Handler para enviar notificación
 */
async function handleEnviarNotificacion(task: Record<string, any>): Promise<void> {
  logger.info('📧 Procesando handler: enviar-notificacion');

  const variables = extractVariables(task.variables);
  const { id_tramite, decision, aprobado } = variables;

  // Determinar tipo de notificación y mensaje según la decisión
  const tipo_notificacion = aprobado ? 'aprobacion' : 'rechazo';
  const mensaje = aprobado 
    ? `Tu trámite #${id_tramite} ha sido aprobado exitosamente.` 
    : `Tu trámite #${id_tramite} ha sido rechazado.`;

  logger.info('📤 Enviando notificación:', {
    id_tramite,
    tipo: tipo_notificacion,
    mensaje,
  });

  try {
    // Llamar al backend para enviar notificación
    await backendClient.post('/api/tramites/notificar', {
      id_tramite,
      tipo_notificacion,
      mensaje,
    });
    logger.info('✅ Notificación enviada exitosamente');
  } catch (error) {
    logger.warn('⚠️  No se pudo enviar notificación (puede ser normal):', error);
  }

  // Completar la tarea
  await completeTask(task.id, {});
}

/**
 * Extrae variables de formato Camunda
 */
function extractVariables(camundaVariables: any) {
  const result: any = {};
  
  for (const key in camundaVariables) {
    result[key] = camundaVariables[key].value;
  }
  
  return result;
}

/**
 * Completa una tarea externa en Camunda
 */
async function completeTask(taskId: string, result: any) {
  try {
    await camundaClient.post(`/external-task/${taskId}/complete`, {
      workerId: 'sgst-orchestrator',
      variables: result,
    });
    
    logger.info(`✅ Tarea ${taskId} completada exitosamente`);
  } catch (error: any) {
    logger.error(`❌ Error al completar tarea ${taskId}:`, error);
    throw error;
  }
}

/**
 * Maneja errores en tareas
 */
async function handleTaskFailure(task: Record<string, any>, error: any): Promise<void> {
  try {
    await camundaClient.post(`/external-task/${task.id}/failure`, {
      workerId: 'sgst-orchestrator',
      errorMessage: error.message,
      errorDetails: JSON.stringify(error),
    });
    
    logger.info(`❌ Tarea ${task.id} marcada como fallida`);
  } catch (err: any) {
    logger.error(`❌ Error al marcar tarea como fallida:`, err);
  }
}

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'orchestrator',
    timestamp: new Date().toISOString(),
    camundaUrl: CAMUNDA_URL,
    backendUrl: process.env.BACKEND_URL,
  });
});

// Iniciar polling de external tasks cada 5 segundos (se inicia después del listen)

// Iniciar servidor
app.listen(PORT, async () => {
  logger.info(`🚀 Orchestrator iniciado en puerto ${PORT}`);
  logger.info(`📡 Conectado a Camunda: ${CAMUNDA_URL}`);
  logger.info(`🔗 Backend URL: ${process.env.BACKEND_URL || 'http://backend:3001'}`);
  
  // Desplegar procesos BPMN automáticamente
  await deployProcesses();
  
  // Iniciar polling de external tasks cada 5 segundos
  checkExternalTasks();
  setInterval(checkExternalTasks, 5000);
  
  logger.info(`🔄 Polling de external tasks cada 5 segundos`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error: any) => {
  logger.error('❌ Error no manejado:', error);
});