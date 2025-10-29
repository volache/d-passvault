import { firebaseConfig } from "./firebase-config.js";

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 匯出需要的 Firebase 服務實例
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
