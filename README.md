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


![Captura de pantalla 2025-06-07 150555](https://github.com/user-attachments/assets/6f8387ec-f66b-4bdb-9f40-dfebfe8f8419)
![Captura de pantalla 2025-06-07 150547](https://github.com/user-attachments/assets/05df63d2-be77-4100-9d80-c7a2859a2172)
![Captura de pantalla 2025-06-07 150538](https://github.com/user-attachments/assets/d14500ca-d0ed-4b69-b482-61e96bc8f78a)
![Captura de pantalla 2025-06-07 150524](https://github.com/user-attachments/assets/7df3f655-e6f1-4191-afd0-0f197d771869)
![Captura de pantalla 2025-06-07 150514](https://github.com/user-attachments/assets/77818e99-3e92-4058-9184-21345fabe653)
![Captura de pantalla 2025-06-07 150503](https://github.com/user-attachments/assets/481d3582-e822-4b87-8844-f2a28087197c)
![Captura de pantalla 2025-06-07 150308](https://github.com/user-attachments/assets/bf076bac-ec70-457f-96fa-f53f1bb51880)
![Captura de pantalla 2025-06-07 150255](https://github.com/user-attachments/assets/7af60cc7-aa19-405e-9241-46dd58afd20d)
![Captura de pantalla 2025-06-07 150243](https://github.com/user-attachments/assets/5f1c1d02-3c26-4b04-90f2-0c0941918092)
![Captura de pantalla 2025-06-07 150216](https://github.com/user-attachments/assets/8439b883-dcfb-449c-a915-4b44f4b14227)
![Captura de pantalla 2025-06-07 150202](https://github.com/user-attachments/assets/64c66123-392a-44b5-8cce-a9404effb442)

   
