# Taller No 2: Nova Plata - Plataforma Financiera y Asistente de IA

Este documento contiene la documentación completa del proyecto **Nova Plata**, desarrollado como entrega para la asignatura **Contexto de la Ing. de Software**.

---

## 1. Datos del Estudiante
- **Proyecto:** Nova Plata (Aplicación Web Financiera)

---

## 2. Enlaces de Revisión

- **Página Web Desplegada (Vercel):** [PEGA AQUÍ EL LINK DE TU PROYECTO EN VERCEL, ej: https://nova-plata.vercel.app]
- **Repositorio de GitHub:** [PEGA AQUÍ EL LINK DE TU REPOSITORIO DE GITHUB]

> **Nota:** La aplicación cuenta con un entorno de Frontend interactivo y un Backend funcional conectado a Supabase para la autenticación y persistencia de datos.

---

## 3. Rutina de Despliegue de la Página Web

El despliegue de **Nova Plata** está automatizado utilizando **Vercel** para el Frontend y está conectado a un Backend en Node.js y a una base de datos PostgreSQL alojada en **Supabase**.

### Pasos para realizar el despliegue:

1. **Preparación del Entorno Local:**
   - Asegurarse de tener Node.js instalado (v18+).
   - Clonar el repositorio.
   - Instalar dependencias del frontend: `npm install` en la carpeta raíz.
   - Instalar dependencias del backend: `npm install` dentro de la carpeta `/server`.

2. **Configuración de Variables de Entorno (`.env`):**
   - El proyecto requiere configuración para comunicarse con Supabase y Google Gemini AI.
   - En la carpeta `/server`, crear un archivo `.env` basado en `.env.example`:
     ```env
     PORT=3001
     SUPABASE_URL=https://[TU-PROYECTO].supabase.co
     SUPABASE_ANON_KEY=[TU-ANON-KEY]
     SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]
     GEMINI_API_KEY=[TU-API-KEY-DE-GEMINI]
     DEMO_MODE=false
     ```

3. **Ejecución Local (Desarrollo):**
   - Iniciar el servidor Frontend (React/Vite): `npm run dev` en la carpeta raíz.
   - Iniciar el servidor Backend (Express): `npm run dev` en la carpeta `/server`.

4. **Despliegue en Vercel (Producción):**
   - Subir el código a un repositorio en **GitHub**.
   - Entrar a [Vercel](https://vercel.com) y seleccionar "Add New Project".
   - Importar el repositorio de GitHub de `Nova Plata`.
   - Vercel detectará automáticamente que es un proyecto **Vite / React**.
   - Comando de Build por defecto que utiliza Vercel: `tsc -b && vite build`.
   - Directorio de salida (Output directory): `dist`.
   - Añadir las variables de entorno necesarias en la sección "Environment Variables" de Vercel.
   - Dar clic en **Deploy**. Tras ~60 segundos, el proyecto estará en línea.

5. **Configuración de la Base de Datos (Supabase):**
   - Crear un proyecto en Supabase.
   - Ir a la pestaña **SQL Editor** y ejecutar el script alojado en `server/supabase/schema.sql`.
   - Este script crea automáticamente las tablas de: `transactions`, `budgets`, `goals`, `profiles`, aplica todas las políticas de Seguridad de Nivel de Fila (RLS) y los Triggers de fechas.

---

## 4. Herramientas y Prompts Utilizados

### Herramienta Principal
Este proyecto fue desarrollado íntegramente aplicando los principios de la **Ingeniería de Software Asistida por IA**. La herramienta principal de desarrollo y agente lógico fue **Google Antigravity (Gemini 3.1 Pro / Claude Opus 4.6)**, utilizado directamente dentro del IDE a través de su capacidad de **agentes basados en LLM**.

### Historial de Prompts Utilizados (Ingeniería de Prompts)

A continuación, se documenta la evolución cronológica de las peticiones (prompts) realizadas a la IA para guiar la construcción, estructuración y despliegue del software:

1. *"revisa bien el proyecto por que me dejaste errores en varios archivos"*
2. *"perfectp me gusta ahora es momento de agregarle interactividad en botones animacienes y demas ya que mas adelante vamos a implementar un backend y mnecesito que el front este lo mas completo posible no quiero errores de colores ni de textos ni errores de sintaxis"*
3. *"revisa bein por que aun hay errores"*
4. *"Perfecto. Ahora vamos a evolucionar el proyecto de **Nova Plata**. A partir de este punto, **NO quiero que la aplicación siga dependiendo estructuralmente del HTML proporcionado anteriormente**. El HTML anterior debe utilizarse únicamente como **referencia visual y conceptual** para conservar la identidad de Nova Plata, pero quiero construir ahora un frontend real, modular, escalable y profesional. OBJETIVO PRINCIPAL: Construye **Nova Plata como una aplicación web financiera responsive completa**, utilizando React + TypeScript + Vite + Tailwind CSS. La página principal será un **Dashboard público**... Las funcionalidades que requieran una cuenta deberán estar protegidas mediante autenticación."*
5. *"perfecto agregemos un footer con y demosle mas animacion al dashboard principal animaciones tipo apple y corrige los errores de app.tsx"*
6. *"arregla el modo dark y ligth no esta funcionando correctamente"*
7. *"demosle una animación tipo apple a esta parte"*
8. *"quita la funcion de ese icono de desktop esta interfirinedo con la accion del modo claro y oscuro es decir toca dar 3 clic para cambiar a modo claro y eso no es amigable con el usuario solo es necesario un clic y ya admeas las animaciones anteriores no se notan mucho la idea es que uses ne las animaciones tipo Animojis para que se mas amigable con el usuartio"*
9. *"Ahora vamos a desarrollar el backend de Nova Plata. Utiliza Node.js + TypeScript + Express y Supabase como base de datos y sistema de autenticación. Objetivo: Implementar un backend seguro y escalable que permita: Registro, Login, 2FA, Protección de rutas, API para movimientos... Chat de asistencia mediante Google Gemini. Seguridad — prioridad máxima."*
10. *"ejecuata el proyecto y testealo"*
11. *"continua y configura la base de detos"*
12. *"haz todo lo anterior tu mismo"*
13. *"dame el comando para ejcutar el .env"*
14. *(Prompt por nota de voz/Audio)* *"Perfecto, pero necesito que ejecutes la configuración aparte, es decir, ingreses a Google, entres a Supabase, hagas la configuración, yo me logueo, igual con la API Key de Gemini."* - **Nota:** En este punto el agente utilizó la herramienta `browser_subagent` para operar el navegador de forma autónoma.
15. *"listo inicio de seion listo"*
16. *"intenti hacer el despliegue y no me deja esto es lo que me sale en build logs... [Se anexa log de tsc -b && vite build]"*

---

## 5. Parámetros en General Utilizados

Para garantizar escalabilidad, buenas prácticas de ingeniería de software y una arquitectura sólida, se definieron los siguientes parámetros tecnológicos y de diseño:

### Arquitectura y Stack Tecnológico
- **Frontend:** Single Page Application (SPA) construida con **React.js (v18)** y **TypeScript**.
- **Empaquetador:** **Vite** para una compilación ultra rápida y HMR (Hot Module Replacement).
- **Estilos:** **Tailwind CSS** para un enfoque utility-first, variables nativas en CSS para control total de colores y tema, combinado con `lucide-react` para iconografía.
- **Gestor de Estado Global:** **Zustand** (para almacenar la sesión del usuario, el tema visual Dark/Light y tokens de autenticación).
- **Backend:** API RESTful modular construida con **Node.js** y **Express.js**, fuertemente tipada con **TypeScript**.
- **Validación de Datos:** Uso de **Zod** para parsear, validar y sanitizar estrictamente todo el input recibido desde el cliente (Prevención de inyecciones).
- **Seguridad Backend:** Implementación de encabezados seguros mediante **Helmet**, configuración estricta de **CORS**, y límite de peticiones (Rate Limiting) para prevenir ataques de fuerza bruta.
- **Base de Datos y Autenticación:** **Supabase** (PostgreSQL). Implementación de autenticación con doble factor (MFA/2FA) y reglas de Seguridad a Nivel de Fila (RLS) impuestas directamente sobre el motor de la base de datos SQL.
- **IA y NLP:** Integración de la API de **Google Gemini** como asistente virtual (Nova IA), con prompts de sistema fuertemente tipados que evitan que la IA filtre datos o altere la base de datos maliciosamente.

### Patrones y Principios de Ingeniería Aplicados
- **Modularidad:** Separación de componentes visuales (`ui/`), componentes de páginas (`pages/`), lógica de estado (`store/`) y utilidades en el frontend. En el backend se implementó un patrón Controlador-Servicio-Ruta.
- **Dry (Don't Repeat Yourself):** Reutilización de componentes atómicos como botones y modales.
- **Experiencia de Usuario (UX) Premium:** Implementación de animaciones fluidas con físicas de "resorte" (Spring) inspiradas en la estética de Apple y Animojis, haciendo uso de la librería `framer-motion`.
- **Modo Oscuro Dinámico:** Construcción de un sistema de variables de entorno CSS puro intercambiable con un solo click sin latencia de renderizado.
