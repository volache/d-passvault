const { createApp } = Vue;

// 引入根元件
import App from "./App.js";

// 引入所有需要全域註冊的元件
import BottomNavBar from "./components/BottomNavBar.js";
import CustomSelect from "./components/CustomSelect.js";
import EditModal from "./components/EditModal.js";
import ExportModal from "./components/ExportModal.js";
import ImportModal from "./components/ImportModal.js";
import NameEditModal from "./components/NameEditModal.js";
import NotificationCenter from "./components/NotificationCenter.js";
import ChangeMasterPasswordModal from "./components/ChangeMasterPasswordModal.js";
import ChangeLoginPasswordModal from "./components/ChangeLoginPasswordModal.js";

// 建立 Vue App 實例
const app = createApp(App);

// 全域註冊所有需要直接在 App 模板中使用的元件
app.component("BottomNavBar", BottomNavBar);
app.component("CustomSelect", CustomSelect);
app.component("EditModal", EditModal);
app.component("ExportModal", ExportModal);
app.component("ImportModal", ImportModal);
app.component("NameEditModal", NameEditModal);
app.component("NotificationCenter", NotificationCenter);
app.component("ChangeMasterPasswordModal", ChangeMasterPasswordModal);
app.component("ChangeLoginPasswordModal", ChangeLoginPasswordModal);

// 將 App 掛載到 HTML 中的 #app 元素上
app.mount("#app");

// --- 註冊 Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker 註冊成功，作用域為：", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker 註冊失敗：", error);
      });
  });
}
