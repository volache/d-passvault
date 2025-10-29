const { ref, onMounted } = Vue;
import { useStore } from "../store.js";
import { LockIcon } from "../icons.js";

export default {
  components: {
    LockIcon,
  },
  setup() {
    const { user, unlock, showAlert } = useStore();
    const masterPasswordInput = ref("");
    const inputField = ref(null); // 建立模板引用

    // 當元件被掛載到畫面上時，自動設置焦點
    onMounted(() => {
      if (inputField.value) {
        inputField.value.focus();
      }
    });

    const handleUnlock = () => {
      if (!masterPasswordInput.value) {
        showAlert({ title: "輸入錯誤", message: "請輸入您的金鑰。" });
        return;
      }
      unlock(masterPasswordInput.value);
    };

    return {
      user,
      masterPasswordInput,
      inputField, // 需要返回給模板
      handleUnlock,
    };
  },
  template: `
        <div class="unlock-container">
            <div class="unlock-card">
                <LockIcon />
                <h1>保險庫已鎖定</h1>
                <p>請輸入您的金鑰以解鎖 {{ user?.email }} 的資料</p>
                <div class="form-group">
                    <input 
                        type="password" 
                        v-model="masterPasswordInput" 
                        placeholder="請輸入金鑰" 
                        @keyup.enter="handleUnlock"
                        ref="inputField"
                    >
                </div>
                <button class="unlock-button" @click="handleUnlock">解鎖</button>
            </div>
        </div>
    `,
};
