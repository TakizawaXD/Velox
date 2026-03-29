# ⚡ VELOX — Plataforma SaaS de Logística Supreme v4

<div align="center">

![Velox Supreme v4](https://img.shields.io/badge/Velox-Supreme%20v4-000000?style=for-the-badge&logo=lightning&logoColor=3b82f6)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=fff)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=fff)

**Sistema de gestión logística empresarial con arquitectura multi-tenant, tiempo real y diseño premium.**

[Ver Demo](#) · [Documentación](#tabla-de-contenidos) · [Precios](#-precios-comerciales)

</div>

---

## 📋 Tabla de Contenidos

- [¿Qué es Velox?](#-qué-es-velox)
- [Características](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Instalación](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue](#-despliegue-en-producción)
- [Precios Comerciales](#-precios-comerciales)
- [Licencia](#-licencia)

---

## 🚀 ¿Qué es Velox?

**Velox** es una plataforma SaaS de gestión logística empresarial lista para producción, diseñada para empresas de mensajería, courier y distribución en Colombia y Latinoamérica.

Construida con tecnología de punta (React 19, Firebase, Framer Motion), ofrece un panel de control en **tiempo real**, gestión completa de pedidos, repartidores, clientes y un sistema de facturación profesional con exportación a PDF y Excel — todo bajo una identidad visual premium **Supreme v4**.

> 💡 **Multi-tenant**: Cada negocio tiene sus propios datos completamente aislados. Un solo despliegue sirve a múltiples clientes empresariales.

---

## ✨ Características Principales

### 📦 Gestión Operativa
- **Dashboard en tiempo real** con KPIs operativos y gráfica de flujo por hora
- **Pedidos**: CRUD completo con asignación de repartidor, estados, seguimiento y link de rastreo público
- **Mapa operacional** interactivo con posición de repartidores en vivo (Leaflet)
- **Repartidores**: perfiles, vehículos, calificaciones, estado online/offline
- **Clientes**: directorio corporativo con historial de pedidos y marcado VIP

### 💰 Módulo Financiero
- **Facturación manual** con ítems de línea dinámicos y cálculo automático de totales
- **Generación de número de factura** automático (`FAC-XXXXXX`)
- **Estados de factura**: Pendiente, Pagada, Vencida
- **Exportación profesional**: PDF con diseño Velox + Excel (SpreadsheetML nativo)

### 🎨 Diseño & UX
- Identidad visual **"Absolute Black"** con tipografía Inter 900, glassmorphism y micro-animaciones
- **Skeleton Loaders** premium en todos los módulos para eliminar la percepción de latencia
- **Responsive** completo: sidebar adaptable, layouts móvil/desktop
- **SEO** integrado en todas las páginas

### 🔐 Seguridad & Arquitectura
- **Autenticación** con Firebase Auth (registro, login, recuperación de contraseña)
- **Multi-tenant** con `tenantId` por usuario — datos 100% aislados
- Consultas optimizadas con ordenamiento cliente-side para menor consumo de índices
- Variables de entorno separadas del código fuente

### 📤 Exportación de Datos
- **PDF Branded**: diseño oscuro con logo Velox, tabla con filas alternadas, footer corporativo
- **Excel nativo**: formato SpreadsheetML con encabezados coloridos, abre directamente en Microsoft Excel
- Módulos con exportación: Facturas, Pedidos, Clientes, Repartidores

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Estilos | Tailwind CSS 3 |
| Animaciones | Framer Motion 12 |
| Backend / DB | Firebase Firestore (NoSQL) |
| Autenticación | Firebase Auth |
| Mapa | Leaflet + React-Leaflet |
| Gráficas | Recharts |
| Íconos | Lucide React |
| Notificaciones | React Hot Toast |
| Routing | React Router DOM 7 |

---

## 📱 Módulos del Sistema

```
velox/
├── 🏠  Dashboard           — KPIs, gráfica 24h, actividad reciente
├── 📦  Pedidos             — CRUD completo, filtros, tracking público
├── 🗺️  Mapa Operacional    — Vista en tiempo real de repartidores
├── 🚴  Repartidores        — Gestión de flota, calificaciones
├── 👥  Clientes            — CRM básico con historial
├── 📊  Analíticas          — Gráficas de rendimiento
├── 🧾  Facturación         — Creación, gestión y exportación de facturas
├── 💳  Pagos (Billing)     — Planes y pasarela de pago (Wompi/ePayco)
└── ⚙️  Configuración       — Perfil, logo, configuración del negocio
```

**Páginas públicas:**
```
velox/
├── 🌐  Landing Page        — Página de marketing para venta del SaaS
├── 🔍  Rastreo Público     — /track/:id accesible para clientes finales
├── 📝  Blog                — Contenido de marketing
└── 📄  Legales             — Términos, Privacidad, Cookies
```

---

## ⚙️ Instalación y Configuración

### Prerequisitos
- Node.js 18+
- npm o yarn
- Cuenta en [Firebase](https://firebase.google.com) (plan Spark gratuito funciona)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TakizawaXD/Velox.git
cd Velox
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales de Firebase
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará en `http://localhost:5173`

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Opcional: Pasarela de pagos Wompi (Colombia)
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxx
```

> ⚠️ **Nunca** subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita **Authentication** → Email/Password
3. Habilita **Firestore Database** en modo producción
4. Copia las credenciales en tu `.env`

---

## 🚀 Despliegue en Producción

### Firebase Hosting (Recomendado)
```bash
npm run build
npx firebase-tools deploy
```

### Vercel
```bash
npm run build
# Conecta el repositorio en vercel.com y configura las variables de entorno
```

### Nginx / VPS
```bash
npm run build
# Sirve la carpeta dist/ con tu servidor web
```

---

## 💰 Precios Comerciales

> **Velox está disponible para licenciamiento y personalización empresarial.**

| Plan | Precio | Incluye |
|---|---|---|
| 🥉 **Licencia Starter** | **$499.000 COP** | Código fuente, configuración básica |
| 🥈 **Licencia Business** | **$899.000 COP** | Código fuente + despliegue + 1 mes soporte |
| 🥇 **SaaS Mensual** | **$149.000 COP/mes** | Plataforma hosteada, actualizaciones, soporte |
| 💎 **Enterprise** | **A convenir** | Multi-dominio, marca blanca, integraciones custom |

### Lo que incluye cada licencia:
- ✅ Código fuente completo
- ✅ Documentación técnica
- ✅ 1 sesión de capacitación (plan Business+)
- ✅ Soporte por WhatsApp (plan Business+)
- ✅ Actualizaciones de seguridad (plan SaaS)

### Personalizaciones disponibles:
- 🎨 Cambio de marca (colores, logo, nombre)
- 🌐 Dominio personalizado
- 💳 Integración con pasarelas de pago colombianas (Wompi, ePayco, PSE)
- 📱 App móvil React Native (cotización aparte)
- 🔗 Integraciones con ERPs / sistemas existentes

---

## 📸 Capturas del Sistema

| Dashboard | Facturación | Pedidos |
|---|---|---|
| KPIs en tiempo real | Modal de creación | Mapa operacional |
| Gráfica de flujo 24H | Exportación PDF/Excel | Asignación de repartidor |

---

## 🗂️ Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # SEO, componentes compartidos
│   ├── layout/          # Sidebar, DashboardLayout
│   ├── marketing/       # Navbar, Footer de landing
│   └── ui/              # Button, Card, Modal, Badge, ExportMenu...
├── context/             # AuthContext (Firebase Auth)
├── lib/
│   ├── firebase.ts      # Configuración de Firebase
│   ├── exportUtils.ts   # Exportación PDF + Excel
│   └── seeds.ts         # Datos de prueba para Colombia
├── pages/               # Todas las páginas de la app
└── main.tsx             # Entry point
```

---

## 📄 Changelog

### v4.0.0 — Supreme Edition (Marzo 2026)
- ✨ Nuevo sistema de facturación con ítems dinámicos
- 📤 Exportación PDF con diseño Velox + Excel nativo
- 🎨 Identidad visual "Supreme v4" aplicada a todos los módulos
- 🦴 Skeleton Loaders premium en todos los módulos
- 🔒 Sistema multi-tenant robusto con aislamiento por `tenantId`
- 📱 UX mejorada con responsive completo
- 🌐 SEO integrado en todas las páginas
- 💳 Módulo de pagos / billing

### v3.0.0 — Platform Edition
- Sistema de rastreo público con QR
- Landing page comercial completa
- Blog de marketing

### v2.0.0 — Core Edition
- Dashboard con gráficas en tiempo real
- Mapa operacional con Leaflet
- CRUD completo de pedidos y repartidores

---

## 🤝 Contribuir

Este proyecto está bajo licencia comercial. Para reportar bugs o solicitar características:

1. Abre un **Issue** describiendo el problema
2. Para colaboraciones comerciales, contacta directamente

---

## 📞 Contacto y Ventas

¿Interesado en adquirir una licencia o personalización?

- 📧 **Email**: [tu-email@dominio.com]
- 📱 **WhatsApp**: [+57 XXX XXX XXXX]
- 🐙 **GitHub**: [@TakizawaXD](https://github.com/TakizawaXD)

---

## 📜 Licencia

**Licencia Comercial Propietaria** — Todos los derechos reservados.

El código fuente de este repositorio es para **evaluación y demostración únicamente**. El uso en producción, modificación o redistribución requiere la adquisición de una licencia comercial.

© 2026 Velox Technologies — Supreme v4

---

<div align="center">

**⚡ Velox Supreme v4 — Logística del futuro, disponible hoy.**

*Construido con React 19 · Firebase · Framer Motion · TypeScript*

</div>
