# ETH News - CRYPTO_NEWS_APP TODO

## Arquitectura y Diseño
- [x] Definir paleta de colores elegante (tema oscuro/claro)
- [x] Configurar tipografía y fuentes
- [x] Diseñar layout principal y componentes

## Base de Datos
- [x] Crear tabla `news` para cachear noticias
- [x] Crear tabla `favorites` para noticias favoritas del usuario
- [x] Crear tabla `categories` para categorías de noticias
- [x] Ejecutar migraciones SQL

## APIs y Integración Externa
- [x] Investigar y seleccionar API de noticias crypto (CoinGecko, CryptoNews, etc)
- [x] Configurar credenciales de API
- [x] Crear helper para obtener noticias de API externa
- [x] Implementar caché de noticias

## Backend (tRPC)
- [x] Crear procedimiento para obtener feed de noticias
- [x] Crear procedimiento para buscar noticias
- [x] Crear procedimiento para filtrar por categoría
- [x] Crear procedimiento para agregar noticia a favoritos
- [x] Crear procedimiento para eliminar noticia de favoritos
- [x] Crear procedimiento para obtener favoritos del usuario
- [x] Crear procedimiento para obtener detalles de noticia

## Frontend - Componentes
- [x] Crear componente NewsCard para mostrar noticias
- [x] Crear componente SearchBar para búsqueda
- [x] Crear componente CategoryFilter para filtros
- [x] Crear componente NewsDetail para detalles completos
- [ ] Crear componente UserPanel para gestión de favoritos

## Frontend - Páginas
- [x] Actualizar Home.tsx con feed principal
- [x] Crear página NewsDetail.tsx
- [x] Crear página UserProfile.tsx
- [x] Crear página Favorites.tsx

## Frontend - Funcionalidades
- [x] Implementar búsqueda de noticias
- [x] Implementar filtrado por categorías
- [x] Implementar agregar/eliminar favoritos
- [x] Implementar visualización de detalles
- [ ] Implementar paginación o infinite scroll

## Actualización en Tiempo Real
- [x] Implementar polling automático del feed
- [x] Configurar intervalo de actualización
- [x] Mostrar indicador de actualización

## Pruebas y Optimización
- [x] Escribir tests unitarios (vitest)
- [x] Probar flujo completo de usuario
- [x] Optimizar rendimiento
- [x] Verificar responsive design

## Entrega
- [ ] Crear checkpoint final
- [x] Documentar instrucciones de uso
- [ ] Preparar para publicación
