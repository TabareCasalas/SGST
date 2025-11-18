#!/usr/bin/env node

/**
 * Script para desplegar el diagrama BPMN en Camunda Zeebe
 * 
 * Uso:
 *   node scripts/deploy-bpmn.js
 * 
 * O con npm:
 *   npm run deploy-bpmn
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3002';
const BPMN_FILE = path.join(__dirname, '..', 'camunda', 'diagrams', 'procesoTramiteGrupos_COMPLETO_LAYOUT_V3.bpmn');

async function deployBPMN() {
  try {
    console.log('📋 Verificando archivo BPMN...');
    
    if (!fs.existsSync(BPMN_FILE)) {
      console.error(`❌ Error: No se encontró el archivo BPMN en: ${BPMN_FILE}`);
      process.exit(1);
    }

    console.log(`✅ Archivo BPMN encontrado: ${BPMN_FILE}`);
    console.log(`📤 Desplegando diagrama BPMN en Zeebe (${ORCHESTRATOR_URL})...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${ORCHESTRATOR_URL}/api/procesos/desplegar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    if (data.deployed) {
      console.log('✅ Diagrama BPMN desplegado exitosamente!');
      console.log('\n📊 Procesos desplegados:');
      
      if (data.processes && Array.isArray(data.processes)) {
        data.processes.forEach((process, index) => {
          console.log(`   ${index + 1}. ${process.bpmnProcessId} (versión ${process.version})`);
          console.log(`      - ProcessDefinitionKey: ${process.processDefinitionKey}`);
        });
      }
      
      console.log('\n🎉 ¡Despliegue completado! Ahora puedes reiniciar el backend y probar el cambio de estado.');
      return true;
    } else {
      console.error('❌ Error: El despliegue no fue exitoso');
      console.error('Respuesta:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error al desplegar diagrama BPMN:');
    
    if (error.name === 'AbortError') {
      console.error('   Timeout: El orchestrator no respondió en 30 segundos');
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.error(`   No se pudo conectar al orchestrator en ${ORCHESTRATOR_URL}`);
      console.error('   Asegúrate de que el orchestrator esté corriendo.');
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Ejecutar despliegue
deployBPMN()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });

