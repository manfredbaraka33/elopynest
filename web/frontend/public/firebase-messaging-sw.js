importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCPVQur0qA3bbizfOnuUM78b4YLjZtOg4E",
  authDomain: "elopynest-test.firebaseapp.com",
  projectId: "elopynest-test",
  storageBucket: "elopynest-test.firebasestorage.app",
  messagingSenderId: "655769127896",
  appId: "1:655769127896:web:6f6c6fcdd39b35f4a8c0ad"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
