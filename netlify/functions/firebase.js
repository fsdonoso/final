const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyA76pMVJ4mRBDI6WWvwTLvdYeUOsyUfs_o",
  authDomain: "kiei-451-7a78f.firebaseapp.com",
  projectId: "kiei-451-7a78f",
  storageBucket: "kiei-451-7a78f.appspot.com",
  messagingSenderId: "501165029056",
  appId: "1:501165029056:web:bc1447b00e3fe441381f25"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase