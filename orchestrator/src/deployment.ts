/**
 * Servicio de despliegue automático de procesos BPMN
 */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from './logger';

const logger = createLogger();
const CAMUNDA_URL = process.env.CAMUNDA_URL || 'http://camunda:8080/engine-rest';

/**
 * Espera a que Camunda esté listo
 */
async function waitForCamunda(maxRetries: number = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${CAMUNDA_URL}/engine`);
      logger.info('✅ Camunda está listo');
      return true;
    } catch (error) {
      if (i % 5 === 0) {
        logger.info(`⏳ Esperando a que Camunda esté listo... (intento ${i + 1}/${maxRetries})`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  logger.error('❌ Camunda no respondió en el tiempo esperado');
  return false;
}

/**
 * Despliega un archivo BPMN en Camunda
 */
async function deployBpmnFile(filePath: string): Promise<boolean> {
  try {
    const filename = path.basename(filePath);
    logger.info(`📄 Desplegando: ${filename}`);

    const bpmnContent = fs.readFileSync(filePath, 'utf-8');

    // Crear FormData usando form-data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('deployment-name', filename);
    form.append('enable-duplicate-filtering', 'true');
    form.append('deploy-changed-only', 'true');
    form.append('files', bpmnContent, {
      filename: filename,
      contentType: 'application/xml',
    });

    const response = await axios.post(
      `${CAMUNDA_URL}/deployment/create`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    logger.info(`✅ ${filename} desplegado. ID: ${response.data.id}`);
    return true;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('duplicate')) {
      logger.info(`ℹ️  ${path.basename(filePath)} ya estaba desplegado`);
      return true;
    }
    logger.error(`❌ Error al desplegar ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

/**
 * Despliega automáticamente todos los procesos BPMN
 */
export async function deployProcesses(): Promise<void> {
  logger.info('🚀 Iniciando despliegue automático de procesos BPMN...');

  // Esperar a que Camunda esté listo
  const camundaReady = await waitForCamunda();
  if (!camundaReady) {
    logger.warn('⚠️  No se pudo conectar a Camunda, saltando despliegue');
    return;
  }

  // Buscar archivos BPMN en /camunda/diagrams
  const diagramsPath = '/camunda/diagrams';
  
  if (!fs.existsSync(diagramsPath)) {
    logger.warn(`⚠️  No se encontró el directorio ${diagramsPath}`);
    return;
  }

  const files = fs.readdirSync(diagramsPath)
    .filter(file => file.endsWith('.bpmn'))
    .map(file => path.join(diagramsPath, file));

  if (files.length === 0) {
    logger.warn('⚠️  No se encontraron archivos BPMN para desplegar');
    return;
  }

  logger.info(`📁 Encontrados ${files.length} archivo(s) BPMN`);

  // Desplegar cada archivo
  for (const file of files) {
    await deployBpmnFile(file);
  }

  logger.info('🎉 Despliegue automático completado');
}

