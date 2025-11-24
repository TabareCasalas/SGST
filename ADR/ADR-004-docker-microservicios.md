# ADR-004: Arquitectura de microservicios con Docker

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

El sistema SGST tiene múltiples componentes que necesitan:
- Desplegarse de forma consistente
- Comunicarse entre sí
- Escalarse independientemente
- Aislarse unos de otros
- Gestionarse fácilmente en diferentes entornos (desarrollo, producción)

Los componentes principales son:
- Frontend (React)
- Backend API (Node.js)
- Orchestrator (Node.js)
- Camunda Zeebe
- PostgreSQL
- Elasticsearch
- PgAdmin

## Opciones Consideradas

### Opción 1: Docker Compose (ELEGIDA)
- **Pros**:
  - Fácil de configurar y usar
  - Ideal para desarrollo local
  - Orquestación simple de múltiples servicios
  - Networking automático entre contenedores
  - Volúmenes para persistencia
  - Health checks integrados
  - Variables de entorno centralizadas
- **Contras**:
  - No es ideal para producción a gran escala
  - Un solo host (no distribuido)
  - Menos características avanzadas que Kubernetes

### Opción 2: Kubernetes
- **Pros**:
  - Escalabilidad horizontal
  - Auto-scaling
  - Alta disponibilidad
  - Distribuido
  - Ideal para producción a gran escala
- **Contras**:
  - Complejidad significativa
  - Overhead para proyectos pequeños/medianos
  - Curva de aprendizaje pronunciada
  - Requiere infraestructura adicional

### Opción 3: Despliegue manual
- **Pros**:
  - Control total
  - Sin dependencias adicionales
- **Contras**:
  - Difícil de reproducir
  - Propenso a errores
  - Difícil de mantener
  - No escalable

### Opción 4: Servicios gestionados (AWS ECS, Google Cloud Run)
- **Pros**:
  - Gestión simplificada
  - Auto-scaling
  - Alta disponibilidad
- **Contras**:
  - Vendor lock-in
  - Costos adicionales
  - Menos control

## Decisión

Se eligió **Docker Compose** para orquestar los servicios del sistema.

### Razones principales:

1. **Simplicidad**: Fácil de configurar y usar, especialmente para desarrollo
2. **Reproducibilidad**: Entornos consistentes entre desarrollo y producción
3. **Aislamiento**: Cada servicio en su propio contenedor
4. **Networking**: Comunicación automática entre servicios
5. **Volúmenes**: Persistencia de datos fácil de gestionar
6. **Health Checks**: Monitoreo básico integrado
7. **Suficiente para el caso de uso**: El sistema no requiere la complejidad de Kubernetes inicialmente

## Consecuencias

### Positivas

- ✅ Despliegue consistente en todos los entornos
- ✅ Fácil desarrollo local (un solo comando: `docker-compose up`)
- ✅ Aislamiento de servicios
- ✅ Networking automático entre contenedores
- ✅ Volúmenes para persistencia de datos
- ✅ Health checks para monitoreo básico
- ✅ Variables de entorno centralizadas
- ✅ Fácil agregar nuevos servicios

### Negativas

- ⚠️ Limitado a un solo host (no distribuido)
- ⚠️ No tiene auto-scaling automático
- ⚠️ Menos robusto que Kubernetes para alta disponibilidad
- ⚠️ Requiere Docker instalado en el servidor

### Mitigaciones

- Scripts de despliegue para facilitar operaciones
- Documentación clara de despliegue
- Posibilidad de migrar a Kubernetes en el futuro si es necesario
- Health checks para detectar problemas temprano

## Implementación

El `docker-compose.yml` define:
- **Servicios**: frontend, backend, orchestrator, postgres, zeebe, operate, tasklist, identity, elasticsearch, pgadmin
- **Networks**: `sgst_network` (bridge) para comunicación entre servicios
- **Volumes**: Persistencia para postgres, elasticsearch, zeebe, pgadmin
- **Health Checks**: Para todos los servicios críticos
- **Dependencies**: Orden de inicio correcto (postgres antes de backend, etc.)
- **Environment Variables**: Configuración centralizada

## Migración Futura

Si el sistema crece y requiere:
- Escalabilidad horizontal automática
- Alta disponibilidad distribuida
- Auto-scaling basado en carga

Se puede considerar migrar a Kubernetes manteniendo los mismos Dockerfiles.

## Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)


