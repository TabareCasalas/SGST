# ADR-005: Autenticación basada en JWT

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos un sistema de autenticación para el Sistema SGST que:
- Permita a usuarios iniciar sesión de forma segura
- Mantenga sesiones entre requests
- Funcione bien con arquitectura de microservicios
- Sea stateless (sin necesidad de sesiones en servidor)
- Permita renovación de tokens
- Sea seguro y resistente a ataques comunes

## Opciones Consideradas

### Opción 1: JWT (JSON Web Tokens) (ELEGIDA)
- **Pros**:
  - Stateless (no requiere almacenamiento en servidor)
  - Funciona bien con microservicios
  - Fácil de implementar
  - Estándar ampliamente adoptado
  - Incluye información del usuario en el token
  - Escalable (no requiere sesiones compartidas)
- **Contras**:
  - Tokens no pueden revocarse fácilmente (sin blacklist)
  - Tamaño del token (puede ser grande si incluye mucha información)
  - Tokens expirados requieren refresh token

### Opción 2: Sessions (cookies + servidor)
- **Pros**:
  - Fácil de revocar (eliminar sesión)
  - Más seguro (tokens no expuestos en localStorage)
  - Control total sobre sesiones
- **Contras**:
  - Requiere almacenamiento en servidor (Redis, base de datos)
  - No funciona bien con microservicios (necesita sesiones compartidas)
  - Más complejo de implementar
  - Problemas con CORS

### Opción 3: OAuth 2.0 / OpenID Connect
- **Pros**:
  - Estándar robusto
  - Delegación de autenticación
  - Soporte para SSO
- **Contras**:
  - Complejidad significativa
  - Overkill para nuestro caso de uso
  - Requiere servidor de autorización separado

### Opción 4: API Keys
- **Pros**:
  - Muy simple
- **Contras**:
  - No adecuado para usuarios finales
  - Sin expiración automática
  - Menos seguro

## Decisión

Se eligió **JWT (JSON Web Tokens)** para autenticación.

### Razones principales:

1. **Stateless**: No requiere almacenamiento de sesiones en servidor
2. **Microservicios**: Funciona perfectamente con arquitectura de microservicios
3. **Simplicidad**: Fácil de implementar y mantener
4. **Escalabilidad**: No requiere sesiones compartidas entre instancias
5. **Estándar**: Ampliamente adoptado y bien documentado
6. **Rendimiento**: Sin consultas a base de datos en cada request

## Consecuencias

### Positivas

- ✅ Stateless: No requiere almacenamiento de sesiones
- ✅ Escalable: Funciona con múltiples instancias del backend
- ✅ Simple: Fácil de implementar y mantener
- ✅ Información en token: Incluye id, CI y rol del usuario
- ✅ Refresh tokens: Permite renovación sin re-login
- ✅ Seguro: Tokens firmados con secreto

### Negativas

- ⚠️ No se pueden revocar fácilmente (requeriría blacklist)
- ⚠️ Tokens almacenados en localStorage (vulnerable a XSS)
- ⚠️ Tamaño del token (aunque pequeño en nuestro caso)
- ⚠️ Tokens expirados requieren refresh token

### Mitigaciones

- **Refresh Tokens**: Tokens de acceso cortos (8 horas) + refresh tokens largos (7 días)
- **HTTPS**: Todos los tokens se transmiten por HTTPS
- **Validación estricta**: Validación de tokens en cada request
- **Expiración**: Tokens con expiración para limitar ventana de ataque
- **Logout**: Invalidación de refresh tokens al hacer logout

## Implementación

### Tokens
- **Access Token**: 
  - Expiración: 8 horas
  - Contiene: id_usuario, ci, rol
  - Almacenado en: localStorage
  - Usado en: Header `Authorization: Bearer <token>`

- **Refresh Token**:
  - Expiración: 7 días
  - Almacenado en: localStorage
  - Usado para: Renovar access token sin re-login

### Seguridad
- Tokens firmados con `JWT_SECRET` y `REFRESH_SECRET`
- Validación en middleware de autenticación
- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens no incluyen información sensible

### Flujo
1. Usuario hace login → Backend valida credenciales
2. Backend genera access token + refresh token
3. Tokens se envían al frontend
4. Frontend almacena tokens en localStorage
5. Cada request incluye access token en header
6. Si access token expira, frontend usa refresh token para obtener uno nuevo
7. Si refresh token expira, usuario debe hacer login nuevamente

## Alternativa Futura

Si se requiere revocación de tokens, se puede implementar:
- Blacklist de tokens en Redis
- Verificación de blacklist en middleware
- Invalidación de tokens al hacer logout

## Referencias

- [JWT.io](https://jwt.io/)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)


