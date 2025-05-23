# CallConnect 📞

Aplicación de videollamadas desarrollada con Ionic Angular y Firebase.

# Video de parcial 
https://drive.google.com/drive/folders/12x0eoSTAIdx9Fz5js-ZQ7f1nDmQk8hd9

![CallConnect Logo](https://ravishing-courtesy-production.up.railway.app/assets/logo.png)

## Características ✨

- Autenticación segura con Firebase
- Videollamadas en tiempo real
- Gestión de contactos
- Notificaciones push
- Interfaz intuitiva y responsive
- Configuración personalizable

## Tecnologías 🛠️

- **Frontend**: 
  - Ionic 7
  - Angular 16
  - Capacitor 5
- **Backend**:
  - Firebase Authentication
  - Firestore Database
  - Firebase Cloud Messaging
  - Firebase Storage

## Pasos de Instalación 💻

Para instalar y ejecutar CallConnect, sigue estos pasos:

1. Clonar el repositorio:
```bash
git clone https://github.com/Naiker12/CallConnect-Ionic-Angular.git
cd CallConnect-Ionic-Angular
```
2. Instalar dependencias:
```bash
npm install
```
3.  Configurar Firebase (ver sección de configuración).

## Configuración ⚙️

1. Crea un proyecto en Firebase Console
2. Configura los archivos de entorno:
3.src/environments/environment.ts

```bash
  export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```
4. Configura Capacitor para plataformas nativas:
```bash
npx cap add android
```

5. Ejecutar la aplicación:
```bash
ionic serve
```

6. Documentación API 📚
   
La documentación completa de la API está disponible en:
https://ravishing-courtesy-production.up.railway.app/documentation

7. Despliegue
