import axios from 'axios';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://orchestrator:3002';

const orchestratorClient = axios.create({
  baseURL: ORCHESTRATOR_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Inicia un proceso en Camunda mediante el orchestrator
 */
export async function iniciarProcesoEnCamunda(
  processKey: string,
  variables: Record<string, any>
) {
  try {
    console.log(`🚀 Iniciando proceso en Camunda: ${processKey}`);
    console.log('Variables:', variables);

    const response = await orchestratorClient.post('/api/procesos/iniciar', {
      processKey,
      variables,
    });

    console.log('✅ Proceso iniciado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al iniciar proceso en Camunda:', error.message);
    throw new Error(`Error al iniciar proceso en Camunda: ${error.message}`);
  }
}

/**
 * Obtiene información de una instancia de proceso
 */
export async function obtenerInstanciaProceso(instanceId: string) {
  try {
    const response = await orchestratorClient.get(`/api/procesos/${instanceId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener instancia de proceso:', error.message);
    throw error;
  }
}

export default { iniciarProcesoEnCamunda, obtenerInstanciaProceso };


