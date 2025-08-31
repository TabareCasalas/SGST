# SGST - Sistema de Gestión Notarial

Una aplicación web moderna para la gestión notarial de la Facultad de Derecho, construida con React, TypeScript y Vite.

## 🎯 Propósito

Este frontend forma parte de una aplicación de gestión notarial para la Facultad de Derecho. El sistema permite a distintos tipos de usuarios (consultantes, estudiantes, docentes, administradores) realizar acciones como:

- **Crear trámites** notariales
- **Subir documentos** y gestionar expedientes
- **Comunicarse** entre usuarios del sistema
- **Recibir notificaciones** sobre el estado de trámites
- **Generar reportes** y estadísticas
- **Gestionar usuarios** y permisos por roles

## 🏗️ Arquitectura del Proyecto

```
/src
├── assets/                → Imágenes, íconos, estilos globales
├── components/            → Componentes reutilizables
│   ├── UI/                → Átomos visuales (Button, Input, etc.)
│   ├── Layout/            → Estructura de páginas (Navbar, Footer)
│   └── Forms/             → Formularios específicos (TrámiteForm, etc.)
├── screens/               → Páginas o vistas principales
│   ├── auth/              → Autenticación (Login, Register)
│   ├── dashboard/         → Paneles de control por rol
│   ├── tramites/          → Gestión de trámites
│   ├── documentos/        → Gestión de documentos
│   ├── usuarios/          → Gestión de usuarios
│   └── reportes/          → Generación de reportes
├── hooks/                 → Custom hooks (useAuth, useTramites, etc.)
├── contexts/              → React Context (AuthContext, ThemeContext)
├── services/              → Llamadas a API (authService, tramitesService, etc.)
├── utils/                 → Funciones auxiliares (validators, helpers)
├── config/                → Configuraciones globales (env, rutas)
├── routes/                → Rutas y navegación
├── types/                 → Tipos TypeScript específicos del dominio
├── constants/             → Constantes del sistema (roles, estados, etc.)
├── App.tsx                → Componente raíz
└── main.tsx               → Punto de entrada
```

## 👥 Tipos de Usuarios

### 🔍 **Consultantes**
- Crear y gestionar trámites notariales
- Subir documentos requeridos
- Consultar estado de trámites
- Recibir notificaciones

### 🎓 **Estudiantes**
- Acceso a trámites académicos
- Consulta de expedientes
- Comunicación con docentes
- Gestión de documentos estudiantiles

### 👨‍🏫 **Docentes**
- Gestión de trámites académicos
- Revisión de expedientes estudiantiles
- Generación de reportes académicos
- Comunicación con estudiantes

### ⚙️ **Administradores**
- Gestión completa del sistema
- Administración de usuarios
- Configuración del sistema
- Generación de reportes globales
- Gestión de roles y permisos

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS v3.4.0** - Framework de CSS
- **ESLint** - Linter de código
- **PostCSS** - Procesador de CSS

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd SGST
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## ✨ Funcionalidades Implementadas

### 🔐 **Sistema de Autenticación**
- Login con simulación de diferentes roles de usuario
- Context API para gestión de estado de autenticación
- Protección de rutas basada en roles
- Logout funcional

### 🏠 **Pantalla de Inicio (Home)**
- Dashboard personalizado por rol de usuario
- Navegación a diferentes secciones del sistema
- Información específica según el tipo de usuario
- Interfaz responsive y moderna

### 👥 **Gestión de Usuarios**
- Lista de usuarios con filtros por rol y estado
- Búsqueda de usuarios
- Activación/desactivación de usuarios
- Interfaz de tabla con badges de estado

### 📋 **Gestión de Trámites**
- Lista de trámites con filtros avanzados
- Búsqueda por título, tipo, estado y prioridad
- Badges de estado y prioridad
- Acciones según permisos del usuario

### ⚙️ **Panel de Administración**
- Dashboard con estadísticas del sistema
- Actividad reciente
- Acciones rápidas
- Navegación por pestañas

### 🎨 **Componentes UI**
- Botones con variantes (primary, secondary, outline)
- Inputs con validación y manejo de errores
- Formularios para trámites y documentos
- Componentes de carga de archivos

### 🔧 **Sistema de Navegación**
- Navegación entre pantallas sin recargar la página
- Barra de navegación con estado actual
- Navegación contextual según el rol del usuario

## 🧪 Usuarios de Prueba

Para probar el sistema, puedes usar estos emails:

- **Administrador**: `admin@test.com`
- **Docente**: `docente@test.com`
- **Estudiante**: `estudiante@test.com`
- **Consultante**: `consultante@test.com`

Cualquier contraseña de 6 o más caracteres funcionará.

## 🔧 Solución de Problemas

### Error de Tailwind CSS con PostCSS
Si encuentras el error:
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```

**Solución:**
1. Desinstalar versiones conflictivas:
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss
   ```

2. Instalar versión estable:
   ```bash
   npm install -D tailwindcss@^3.4.0 postcss autoprefixer
   ```

3. Verificar que `postcss.config.js` contenga:
   ```javascript
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

### Pantalla en Blanco
Si ves una pantalla en blanco:
1. Verificar que el servidor esté ejecutándose en http://localhost:5173
2. Refrescar la página (Ctrl+F5)
3. Verificar la consola del navegador (F12) para errores
4. Probar en modo incógnito

5. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🎨 Componentes UI

### Button
Componente de botón reutilizable con múltiples variantes:
- `primary` - Botón principal (azul)
- `secondary` - Botón secundario (gris)
- `outline` - Botón con borde
- `danger` - Botón de acción peligrosa (rojo)

### Input
Componente de entrada de texto con validación:
- Soporte para diferentes tipos (text, email, password, file, etc.)
- Validación de errores
- Labels opcionales
- Estados disabled y required

### Form Components
- `TramiteForm` - Formulario para crear/editar trámites
- `DocumentUpload` - Componente para subir documentos
- `UserForm` - Formulario para gestión de usuarios

## 🔐 Autenticación y Autorización

El sistema incluye un sistema de autenticación y autorización completo:

- **useAuth Hook** - Manejo del estado de autenticación
- **AuthContext** - Contexto global para autenticación
- **Role-based Access Control** - Control de acceso basado en roles
- **Protected Routes** - Rutas protegidas por rol
- **authService** - Servicios para llamadas al API

## 📁 Estructura de Archivos

### Components
- `src/components/UI/` - Componentes atómicos reutilizables
- `src/components/Layout/` - Componentes de estructura
- `src/components/Forms/` - Formularios específicos del dominio

### Screens
- `src/screens/auth/` - Pantallas de autenticación
- `src/screens/dashboard/` - Paneles de control por rol
- `src/screens/tramites/` - Gestión de trámites
- `src/screens/documentos/` - Gestión de documentos
- `src/screens/usuarios/` - Gestión de usuarios
- `src/screens/reportes/` - Generación de reportes

### Types
- `src/types/auth.ts` - Tipos de autenticación
- `src/types/tramites.ts` - Tipos de trámites
- `src/types/users.ts` - Tipos de usuarios
- `src/types/documents.ts` - Tipos de documentos

### Constants
- `src/constants/roles.ts` - Definición de roles
- `src/constants/status.ts` - Estados de trámites
- `src/constants/permissions.ts` - Permisos por rol

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SGST - Sistema de Gestión Notarial
VITE_ENABLE_DEBUG=true
VITE_UPLOAD_URL=http://localhost:3000/upload
```

## 📋 Funcionalidades Principales

### 🏛️ Gestión de Trámites
- Crear, editar y eliminar trámites
- Asignar trámites a usuarios
- Seguimiento del estado de trámites
- Historial de cambios

### 📄 Gestión de Documentos
- Subir y descargar documentos
- Validación de tipos de archivo
- Organización por expedientes
- Control de versiones

### 👥 Gestión de Usuarios
- Crear y gestionar usuarios
- Asignar roles y permisos
- Historial de actividades
- Configuración de perfiles

### 📊 Reportes y Estadísticas
- Reportes por tipo de trámite
- Estadísticas de usuarios
- Métricas de rendimiento
- Exportación de datos

### 🔔 Sistema de Notificaciones
- Notificaciones en tiempo real
- Notificaciones por email
- Configuración de preferencias
- Historial de notificaciones

## 📝 Próximos Pasos

- [ ] Implementar React Router para navegación
- [ ] Crear pantallas específicas por rol
- [ ] Implementar sistema de permisos granular
- [ ] Agregar sistema de notificaciones
- [ ] Implementar carga de documentos
- [ ] Crear sistema de reportes
- [ ] Agregar tests unitarios
- [ ] Configurar CI/CD
- [ ] Implementar tema oscuro
- [ ] Agregar internacionalización (i18n)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
