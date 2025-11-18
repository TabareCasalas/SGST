import axios from 'axios';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3002';

interface ProcessVariables {
  [key: string]: any;
}

interface ProcessResult {
  instanceId: string;
  businessKey?: string;
  raw?: any;
}

interface StartProcessOptions {
  processKey?: string;
  messageName?: string;
  businessKey?: string;
  variables?: ProcessVariables;
}

export async function iniciarProcesoEnCamunda(options: StartProcessOptions): Promise<ProcessResult> {
  const { processKey, messageName, businessKey, variables } = options;

  if (!processKey && !messageName) {
    throw new Error('Debe proporcionar processKey o messageName para iniciar un proceso en Camunda');
  }

  try {
    const response = await axios.post(
      `${ORCHESTRATOR_URL}/api/procesos/iniciar`,
      {
        processKey,
        messageName,
        businessKey,
        variables,
      },
      {
        timeout: 5000, // Reducido a 5 segundos para respuesta más rápida
      }
    );

    // Zeebe retorna processInstanceKey en lugar de instanceId
    return {
      instanceId: response.data.processInstanceKey?.toString() || response.data.instanceId || response.data.id,
      businessKey: response.data.businessKey || businessKey,
      raw: response.data,
    };
  } catch (error: any) {
    console.error('Error al iniciar proceso en Camunda:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error completo:', JSON.stringify(error.response?.data || error.message, null, 2));
    throw new Error(
      `Error al iniciar proceso ${processKey || messageName} en Camunda: ${
        error.response?.data?.error || error.response?.data?.message || error.message
      }`
    );
  }
}

export async function correlacionarMensajeEnCamunda(
  processInstanceId: string,
  messageName: string,
  variables?: ProcessVariables,
  correlationKey?: string
): Promise<void> {
  try {
    const url = `${ORCHESTRATOR_URL}/api/procesos/${processInstanceId}/mensajes/${messageName}`;
    const payload = {
      variables,
      correlationKey,
    };
    
    console.log(`📨 [OrchestratorService] Enviando mensaje a Camunda:`);
    console.log(`   URL: ${url}`);
    console.log(`   MessageName: ${messageName}`);
    console.log(`   ProcessInstanceId: ${processInstanceId}`);
    console.log(`   CorrelationKey: ${correlationKey || 'no proporcionado'}`);
    console.log(`   Variables:`, JSON.stringify(variables, null, 2));
    
    const response = await axios.post(url, payload, {
      timeout: 5000, // Reducido a 5 segundos para respuesta más rápida
    });
    
    console.log(`✅ [OrchestratorService] Mensaje enviado exitosamente:`, response.status, response.data);
  } catch (error: any) {
    console.error(`❌ [OrchestratorService] Error al correlacionar mensaje ${messageName}:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
    if (error.request) {
      console.error(`   Request:`, error.request);
      console.error(`   No se recibió respuesta del orchestrator en ${ORCHESTRATOR_URL}`);
    }
    throw new Error(
      `Error al correlacionar mensaje ${messageName} en Camunda: ${error.response?.data?.error || error.message}`
    );
  }
}

export async function actualizarVariablesEnCamunda(
  processInstanceId: string,
  variables: ProcessVariables
): Promise<void> {
  try {
    await axios.post(
      `${ORCHESTRATOR_URL}/api/procesos/${processInstanceId}/variables`,
      {
        variables,
      },
      {
        timeout: 10000,
      }
    );
  } catch (error: any) {
    console.error('Error al actualizar variables en Camunda:', error.message);
    throw new Error(
      `Error al actualizar variables en Camunda: ${error.response?.data?.error || error.message}`
    );
  }
}

export async function completarTareaEnCamunda(
  processInstanceId: string,
  taskId: string,
  variables?: ProcessVariables
): Promise<void> {
  try {
    await axios.post(
      `${ORCHESTRATOR_URL}/api/procesos/${processInstanceId}/tareas/${taskId}/completar`,
      {
        variables,
      },
      {
        timeout: 15000,
      }
    );
  } catch (error: any) {
    console.error('Error al completar tarea en Camunda:', error.message);
    throw new Error(
      `Error al completar tarea en Camunda: ${error.response?.data?.error || error.message}`
    );
  }
}






