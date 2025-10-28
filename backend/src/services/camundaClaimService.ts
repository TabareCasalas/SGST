import axios from 'axios';

const CAMUNDA_URL = process.env.CAMUNDA_URL || 'http://camunda:8080/engine-rest';

const camundaClient = axios.create({
  baseURL: CAMUNDA_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates a claim for a process instance with a candidate group
 */
export async function crearClaim(
  processInstanceId: string,
  grupoNombre: string
): Promise<void> {
  try {
    console.log(`🎫 Creando claim para proceso ${processInstanceId} con grupo: ${grupoNombre}`);

    // First, find all tasks for this process instance
    const tasksResponse = await camundaClient.get('/task', {
      params: {
        processInstanceId: processInstanceId,
      },
    });

    const tasks = tasksResponse.data;

    if (!tasks || tasks.length === 0) {
      console.log('⚠️  No hay tareas activas para este proceso');
      return;
    }

    // Assign all tasks to the group as candidate group
    for (const task of tasks) {
      try {
        // Set candidate groups
        await camundaClient.post(`/task/${task.id}/identity-links`, {
          type: 'candidate',
          groupId: grupoNombre,
        });

        console.log(`✅ Claim creado para tarea ${task.id} con grupo ${grupoNombre}`);
      } catch (error: any) {
        console.error(`❌ Error al asignar claim a tarea ${task.id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error('❌ Error al crear claim en Camunda:', error.message);
    throw error;
  }
}

/**
 * Claims a task for a specific user
 */
export async function claimTask(taskId: string, userId: string): Promise<void> {
  try {
    await camundaClient.post(`/task/${taskId}/claim`, {
      userId: userId,
    });
    console.log(`✅ Tarea ${taskId} reclamada por usuario ${userId}`);
  } catch (error: any) {
    console.error(`❌ Error al reclamar tarea ${taskId}:`, error.message);
    throw error;
  }
}

/**
 * Unclaims a task
 */
export async function unclaimTask(taskId: string): Promise<void> {
  try {
    await camundaClient.post(`/task/${taskId}/unclaim`);
    console.log(`✅ Tarea ${taskId} liberada`);
  } catch (error: any) {
    console.error(`❌ Error al liberar tarea ${taskId}:`, error.message);
    throw error;
  }
}

/**
 * Assigns a task to a specific user
 */
export async function assignTask(taskId: string, userId: string): Promise<void> {
  try {
    await camundaClient.post(`/task/${taskId}/assignee`, {
      userId: userId,
    });
    console.log(`✅ Tarea ${taskId} asignada a usuario ${userId}`);
  } catch (error: any) {
    console.error(`❌ Error al asignar tarea ${taskId}:`, error.message);
    throw error;
  }
}

export default {
  crearClaim,
  claimTask,
  unclaimTask,
  assignTask,
};

