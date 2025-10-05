import axios from "axios";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCPVQur0qA3bbizfOnuUM78b4YLjZtOg4E",
  authDomain: "elopynest-test.firebaseapp.com",
  projectId: "elopynest-test",
  storageBucket: "elopynest-test.firebasestorage.app",
  messagingSenderId: "655769127896",
  appId: "1:655769127896:web:6f6c6fcdd39b35f4a8c0ad"
};


const token = localStorage.getItem("token");
console.log("here is the token",token);

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);


export const requestForToken = async () => {
  try {
    // Ask for permission first
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      const currentToken = await getToken(messaging, {
        vapidKey: "BFnOnquZbhSV-1tkz65F0TKi9Fc4YhChUMJaS7lwJh9bSudP45RfW5egAgIw8Rf71BlxAMYSw1EvX3UpuLhVKCM",
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        const res = await axios.post(
          "https://elopynest.onrender.com/api/notifications/save-token/",
          { fcm_token: currentToken }, // match backend param
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );
        console.log("Token saved successfully:", res.data);
      } else {
        console.log("No registration token available.");
      }
    } else {
      console.log("Service Worker not supported in this browser.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
  }
};
