import { ZBClient } from 'zeebe-node';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
app.use(express.json({ limit: '2mb' }));
const PORT = process.env.ORCHESTRATOR_PORT || 3002;

// Configuración del cliente de Zeebe (Camunda 8)
const zeebeAddress = process.env.ZEEBE_ADDRESS || 'localhost:26500';
const zbc = new ZBClient(zeebeAddress, {
  loglevel: 'INFO',
  retry: true,
  maxRetries: 3,
  maxRetryTimeout: 5000,
  onReady: () => {
    console.log('✅ Cliente Zeebe conectado y listo');
  },
  onConnectionError: () => {
    // El cliente Zeebe se conecta de forma lazy, este error puede aparecer al inicio
    // La conexión real se establece cuando se usa el cliente (crear workers, iniciar procesos, etc.)
    console.warn('⚠️  Advertencia de conexión con Zeebe (esto es normal al inicio)');
    console.warn('⚠️  La conexión se establecerá cuando se use el cliente');
  },
});

console.log(`🔌 Configurando cliente Zeebe para: ${zeebeAddress}`);
console.log(`ℹ️  La conexión se establecerá automáticamente cuando se use el cliente`);

// Servicio para comunicación con el backend
// Si estamos en desarrollo local, usar localhost, sino usar el nombre del servicio Docker
const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'http://backend:3001');
const backendService = axios.create({
  baseURL: backendUrl,
  timeout: 5000, // Reducido a 5 segundos para respuesta más rápida
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`🔗 Backend URL configurada: ${backendUrl}`);

const orchestratorToken = process.env.ORCHESTRATOR_TOKEN;
if (orchestratorToken) {
  backendService.defaults.headers.common['x-orchestrator-token'] = orchestratorToken;
}

function formatError(error: AxiosError | Error) {
  if ('isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };
  }

  return {
    message: error.message,
  };
}

// Endpoint para iniciar procesos
app.post('/api/procesos/iniciar', async (req, res) => {
  try {
    const { processKey, messageName, businessKey, variables } = req.body || {};

    if (!processKey && !messageName) {
      return res.status(400).json({
        error: 'Debe proporcionar processKey o messageName para iniciar el proceso',
      });
    }

    if (processKey) {
      console.log(`🚀 Iniciando proceso ${processKey} en Zeebe...`);
      console.log('Variables:', JSON.stringify(variables, null, 2).substring(0, 500));
      console.log(`🔗 Conectando a Zeebe en: ${zeebeAddress}`);

      // Incluir businessKey en las variables para que esté disponible en expresiones FEEL
      const processVariables = {
        ...(variables || {}),
        ...(businessKey && { businessKey }),
      };

      const result = await zbc.createProcessInstance({
        bpmnProcessId: processKey,
        variables: processVariables,
        ...(businessKey && { businessKey }),
      });

      console.log(`✅ Proceso iniciado exitosamente. ProcessInstanceKey: ${result.processInstanceKey}`);

      return res.json({
        processInstanceKey: result.processInstanceKey,
        businessKey: businessKey || undefined,
        processDefinitionKey: result.processDefinitionKey,
        bpmnProcessId: result.bpmnProcessId,
        version: result.version,
      });
    } else if (messageName) {
      // En Zeebe, los mensajes se correlacionan de manera diferente
      // Necesitamos usar publishMessage
      console.log(`📨 Publicando mensaje ${messageName} en Zeebe...`);

      const result = await zbc.publishMessage({
        name: messageName,
        variables: variables || {},
        ...(businessKey && { correlationKey: businessKey }),
      });

      return res.json({
        messagePublished: true,
        raw: result,
      });
    }
  } catch (error: any) {
    console.error('❌ Error al iniciar proceso en Zeebe:', error.message);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: 'Error al iniciar proceso en Zeebe',
      details: formatError(error),
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

// Endpoint para publicar mensajes
app.post('/api/procesos/:instanceId/mensajes/:messageName', async (req, res) => {
  try {
    const { instanceId, messageName } = req.params;
    const { correlationKey, variables } = req.body || {};

    console.log(`📨 Publicando mensaje ${messageName} para instancia ${instanceId}...`);
    console.log(`🔑 CorrelationKey proporcionado: ${correlationKey || 'no proporcionado'}`);

    // Si se proporciona correlationKey, usarlo (es el businessKey)
    // Si no, usar instanceId como fallback (aunque esto puede no funcionar si el BPMN espera businessKey)
    const finalCorrelationKey = correlationKey || instanceId;
    
    console.log(`🔑 Usando correlationKey: ${finalCorrelationKey}`);
    console.log(`📋 Variables del mensaje:`, JSON.stringify(variables, null, 2));

    // Publicar el mensaje con timeToLive para que esté disponible por un tiempo
    // Reducido a 30 segundos para optimizar la latencia
    const result = await zbc.publishMessage({
      name: messageName,
      variables: variables || {},
      correlationKey: finalCorrelationKey,
      timeToLive: 30000, // 30 segundos - suficiente para que el proceso reciba el mensaje
    });

    console.log(`✅ Mensaje ${messageName} publicado exitosamente con correlationKey: ${finalCorrelationKey}`);
    console.log(`📊 Resultado:`, JSON.stringify(result, null, 2));

    return res.json({
      messagePublished: true,
      correlationKey: finalCorrelationKey,
      messageName: messageName,
      raw: result,
    });
  } catch (error: any) {
    console.error(
      `❌ Error al publicar mensaje ${req.params.messageName} para instancia ${req.params.instanceId}:`,
      error.message
    );
    if (error.response) {
      console.error('❌ Detalles del error:', error.response.data);
    }
    if (error.stack) {
      console.error('❌ Stack trace:', error.stack);
    }
    return res.status(500).json({
      error: 'Error al publicar mensaje en Zeebe',
      details: formatError(error),
      message: error.message,
    });
  }
});

// Job Worker: crear-tramite
console.log('📡 Creando job worker: crear-tramite');
zbc.createWorker({
  taskType: 'crear-tramite',
  maxJobsToActivate: 10, // Procesar hasta 10 jobs en paralelo
  timeout: 30000, // 30 segundos de timeout por job
  pollInterval: 500, // Poll cada 500ms para reducir latencia
  taskHandler: async (job) => {
    try {
      console.log('📝 Procesando creación de trámite...');
      console.log('Variables del job:', JSON.stringify(job.variables, null, 2));

      const { id_consultante, id_grupo, num_carpeta, observaciones, id_tramite } = job.variables;

      if (!id_consultante || !id_grupo || !num_carpeta) {
        throw new Error('Variables requeridas faltantes: id_consultante, id_grupo, num_carpeta');
      }

      let tramite;

      // Si ya existe un id_tramite, obtenerlo del backend
      if (id_tramite) {
        console.log(`📋 Trámite ya existe (id: ${id_tramite}), obteniendo del backend...`);
        try {
          const response = await backendService.get(`/api/tramites/${id_tramite}`);
          tramite = response.data;
          console.log('✅ Trámite obtenido del backend:', tramite);
        } catch (error: any) {
          console.warn('⚠️ No se pudo obtener el trámite existente, intentando crearlo...');
          const tramiteData = {
            id_consultante,
            id_grupo,
            num_carpeta,
            observaciones: observaciones ?? undefined,
            process_instance_id: job.processInstanceKey?.toString(),
          };
          const response = await backendService.post('/api/tramites', tramiteData);
          tramite = response.data;
          console.log('✅ Trámite creado exitosamente:', tramite);
        }
      } else {
        // El trámite no existe, crearlo
        const tramiteData = {
          id_consultante,
          id_grupo,
          num_carpeta,
          observaciones: observaciones ?? undefined,
          process_instance_id: job.processInstanceKey?.toString(),
        };

        console.log('📤 Enviando datos al backend:', tramiteData);

        try {
          const response = await backendService.post('/api/tramites', tramiteData);
          tramite = response.data;
          console.log('✅ Trámite creado exitosamente:', tramite);
        } catch (error: any) {
          // Si el trámite ya existe (error 409), intentar obtenerlo por num_carpeta
          if (error.response?.status === 409) {
            console.warn('⚠️ Trámite ya existe, obteniendo por num_carpeta...');
            const response = await backendService.get('/api/tramites', {
              params: { search: num_carpeta },
            });
            const tramites = response.data;
            tramite = Array.isArray(tramites) ? tramites.find((t: any) => t.num_carpeta === num_carpeta) : tramites;
            if (!tramite) {
              throw new Error('Trámite ya existe pero no se pudo obtener');
            }
            console.log('✅ Trámite obtenido del backend:', tramite);
          } else {
            throw error;
          }
        }
      }

      // Completar el job con las variables actualizadas
      return job.complete({
        id_tramite: tramite.id_tramite,
        process_instance_id: tramite.process_instance_id || job.processInstanceKey?.toString(),
      });
    } catch (error: any) {
      console.error('❌ Error al crear trámite:', error.message);
      console.error('Error completo:', error);

      return job.error(error.response?.data?.error || error.message || 'Error al crear trámite');
    }
  },
});

// Job Worker: actualizar-estado
console.log('📡 Creando job worker: actualizar-estado');
zbc.createWorker({
  taskType: 'actualizar-estado',
  maxJobsToActivate: 10, // Procesar hasta 10 jobs en paralelo
  timeout: 30000, // 30 segundos de timeout por job
  pollInterval: 500, // Poll cada 500ms para reducir latencia (más agresivo)
  taskHandler: async (job) => {
    try {
      console.log('🔄 Procesando actualización de estado...');
      console.log('Variables del job:', JSON.stringify(job.variables, null, 2));

      const { id_tramite, estado, observaciones, motivo_cierre } = job.variables;

      if (!id_tramite) {
        throw new Error('Variables requeridas faltantes: id_tramite es requerido');
      }

      // Si no hay estado en las variables, usar 'en_tramite' por defecto
      const estadoFinal = estado || 'en_tramite';

      const updateData: Record<string, any> = {
        estado: estadoFinal,
      };

      if (observaciones !== null && observaciones !== undefined) {
        updateData.observaciones = observaciones;
      }

      if (motivo_cierre !== null && motivo_cierre !== undefined) {
        updateData.motivo_cierre = motivo_cierre;
      }

      console.log('📤 Actualizando trámite:', { id_tramite, ...updateData });
      console.log(`🔗 Llamando a: ${backendUrl}/api/tramites/${id_tramite}`);

      try {
        const tokenToSend = orchestratorToken || 'dev-orchestrator-token';
        console.log(`🔑 Enviando token del orchestrator: ${tokenToSend.substring(0, 10)}...`);
        const response = await backendService.patch(`/api/tramites/${id_tramite}`, updateData, {
          headers: {
            'x-orchestrator-token': tokenToSend,
          },
        });
        console.log('✅ Trámite actualizado exitosamente. Respuesta:', response.status);
      } catch (backendError: any) {
        console.error('❌ Error del backend:', backendError.message);
        if (backendError.response) {
          console.error('❌ Respuesta del backend:', backendError.response.status, backendError.response.data);
        }
        throw backendError;
      }

      console.log('✅ Completando job de actualizar-estado...');
      const result = await job.complete();
      console.log('✅ Job completado exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ Error al actualizar trámite:', error.message);
      console.error('Stack trace:', error.stack);

      return job.error(error.response?.data?.error || error.message || 'Error al actualizar trámite');
    }
  },
});

// Job Worker: enviar-notificacion
console.log('📡 Creando job worker: enviar-notificacion');
zbc.createWorker({
  taskType: 'enviar-notificacion',
  maxJobsToActivate: 10,
  timeout: 30000,
  pollInterval: 500, // Reducido de 1000ms a 500ms para reducir latencia
  taskHandler: async (job) => {
    try {
      console.log('📧 Procesando notificación...');
      console.log('Variables del job:', JSON.stringify(job.variables, null, 2));

      const { id_tramite, tipo_notificacion, mensaje, destinatarios } = job.variables;

      if (!id_tramite) {
        throw new Error('Variables requeridas faltantes: id_tramite es requerido');
      }

      // Si no hay tipo_notificacion, usar 'tramite_iniciado' por defecto
      const tipoFinal = tipo_notificacion || 'tramite_iniciado';
      // Si no hay mensaje, usar un mensaje por defecto
      const mensajeFinal = mensaje || 'Trámite en estado en_tramite';

      const payload: Record<string, any> = {
        id_tramite,
        tipo_notificacion: tipoFinal,
        mensaje: mensajeFinal,
      };

      if (destinatarios) {
        payload.destinatarios = destinatarios;
      }

      console.log('📤 Enviando notificación:', payload);
      console.log(`🔗 Llamando a: ${backendUrl}/api/tramites/notificar`);

      const tokenToSend = orchestratorToken || 'dev-orchestrator-token';
      console.log(`🔑 Enviando token del orchestrator: ${tokenToSend.substring(0, 10)}...`);

      try {
        const response = await backendService.post('/api/tramites/notificar', payload, {
          headers: {
            'x-orchestrator-token': tokenToSend,
          },
        });
        console.log('✅ Notificación enviada exitosamente. Respuesta:', response.status);
      } catch (backendError: any) {
        console.error('❌ Error del backend al enviar notificación:', backendError.message);
        if (backendError.response) {
          console.error('❌ Respuesta del backend:', backendError.response.status, backendError.response.data);
        }
        throw backendError;
      }
      console.log('✅ Completando job de enviar-notificacion...');
      const result = await job.complete();
      console.log('✅ Job de notificación completado exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ Error al enviar notificación:', error.message);
      console.error('Stack trace:', error.stack);

      return job.error(error.response?.data?.error || error.message || 'Error al enviar notificación');
    }
  },
});

// Endpoint para desplegar diagrama BPMN
app.post('/api/procesos/desplegar', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // La ruta relativa desde dist/index.js a la raíz del proyecto
    // __dirname será: C:\Users\taba\Desktop\Proyectos\SGST\orchestrator\dist
    // Necesitamos: C:\Users\taba\Desktop\Proyectos\SGST\camunda\diagrams\
    // Desde dist/ subimos a orchestrator/ y luego a SGST/
    const projectRoot = path.resolve(__dirname, '../..');
    const diagramPath = path.join(projectRoot, 'camunda', 'diagrams', 'procesoTramiteGrupos_COMPLETO_LAYOUT_V3.bpmn');
    
    if (!fs.existsSync(diagramPath)) {
      return res.status(404).json({
        error: 'Diagrama BPMN no encontrado',
        path: diagramPath,
      });
    }

    const bpmnContent = fs.readFileSync(diagramPath, 'utf8');
    
    console.log('📤 Desplegando diagrama BPMN en Zeebe...');
    
    const result = await zbc.deployProcess({
      definition: Buffer.from(bpmnContent),
      name: 'procesoTramiteGrupos_COMPLETO_LAYOUT_V3.bpmn',
    });

    console.log('✅ Diagrama desplegado exitosamente:', result);

    return res.json({
      deployed: true,
      processes: result.processes,
      raw: result,
    });
  } catch (error: any) {
    console.error('❌ Error al desplegar diagrama:', error.message);
    return res.status(500).json({
      error: 'Error al desplegar diagrama en Zeebe',
      details: formatError(error),
    });
  }
});

// Servidor Express para health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'orchestrator',
    timestamp: new Date().toISOString(),
    zeebeAddress,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Orchestrator iniciado en puerto ${PORT}`);
  console.log(`📡 Conectado a Zeebe: ${zeebeAddress}`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || 'http://backend:3001'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
});
