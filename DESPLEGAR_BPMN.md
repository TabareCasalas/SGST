# 📋 Cómo Desplegar el Diagrama BPMN en Camunda

## 🎯 Pasos para Desplegar

### 1. Acceder a Camunda

- **URL**: http://localhost:8081
- **Usuario**: admin
- **Contraseña**: admin

### 2. Desplegar el Diagrama

1. En el menú lateral, ve a **"Deployments"** (o **"Camunda Modeler"** si está disponible)
2. Haz clic en **"Upload"** o **"Deploy"**
3. Selecciona el archivo `camunda/diagrams/flujo-tramite.bpmn`
4. Haz clic en **"Deploy"**

### 3. Verificar el Proceso

1. Ve a **"Processes"** → **"Definitions"**
2. Deberías ver el proceso **"Proceso de Trámite"** (id: `procesoTramite`)
3. Puedes ver el diagrama haciendo clic en el proceso

### 4. Probar Crear un Trámite

1. Regresa a http://localhost:3000
2. Clic en **"➕ Crear Trámite"**
3. Completa el formulario
4. Clic en **"📝 Crear Trámite"**
5. Ve a Camunda → **"Processes"** → **"Running"**
6. Deberías ver una instancia del proceso ejecutándose

## 📊 Flujo del Diagrama BPMN

```
Start Event
    ↓
Gateway: Validar Trámite
    ↓
  ├─ Válido → External Task: Enviar Notificación
  │             ↓
  │             External Task: Actualizar Estado
  │             ↓
  │             End Event (Éxito)
  │
  └─ Inválido → User Task: Revisar Trámite
                  ↓
                  End Event (Rechazado)
```

## 🔧 Troubleshooting

### El proceso no aparece en Camunda
- Verifica que el archivo BPMN es válido
- Revisa los logs de Camunda: `docker-compose logs camunda`

### El processo no se inicia
- Verifica que el `processKey` es correcto en el código (`procesoTramite`)
- Revisa los logs del backend: `docker-compose logs backend`
- Revisa los logs del orchestrator: `docker-compose logs orchestrator`

### External Tasks no se ejecutan
- Verifica que el orchestrator está corriendo: `docker-compose ps orchestrator`
- Revisa los logs: `docker-compose logs orchestrator`

