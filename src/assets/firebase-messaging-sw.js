// firebase-messaging-sw.js (en la raíz de src/)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js');

firebaseConfig = {
    apiKey: "AIzaSyC-uxdFY7tkrXB3PVbJPTzURc-Fp2lXxi8",
    authDomain: "callconnect-49e3a.firebaseapp.com",
    projectId: "callconnect-49e3a",
    storageBucket: "callconnect-49e3a.firebasestorage.app",
    messagingSenderId: "43861760129",
    appId: "1:43861760129:web:49f59a28bd328b2e93d580",
    measurementId: "G-RRBWRD3PB3"
  };

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido:', payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-72x72.png'
  });
});
