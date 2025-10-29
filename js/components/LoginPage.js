const { ref, computed } = Vue;
import { useStore } from "../store.js";

export default {
  setup() {
    const { signup, login, showAlert } = useStore();

    const isRegisterMode = ref(false);
    const email = ref("");
    const loginPassword = ref("");
    const confirmLoginPassword = ref("");
    const masterPasswordInput = ref("");
    const confirmMasterPasswordInput = ref("");

    const formTitle = computed(() => (isRegisterMode.value ? "註冊新帳號" : "登入 PassVault"));

    const handleSubmit = () => {
      if (isRegisterMode.value) {
        handleSignup();
      } else {
        handleLogin();
      }
    };

    const handleLogin = () => {
      if (!email.value || !loginPassword.value) {
        showAlert({ title: "輸入錯誤", message: "請輸入電子郵件和登入密碼。" });
        return;
      }
      login(email.value, loginPassword.value);
    };

    const handleSignup = () => {
      if (!email.value || !loginPassword.value || !masterPasswordInput.value) {
        showAlert({ title: "輸入錯誤", message: "電子郵件、登入密碼和金鑰為必填欄位！" });
        return;
      }
      if (loginPassword.value.length < 6) {
        showAlert({ title: "登入密碼強度不足", message: "登入密碼長度至少需要 6 個字元。" });
        return;
      }
      if (loginPassword.value !== confirmLoginPassword.value) {
        showAlert({ title: "輸入錯誤", message: "兩次輸入的登入密碼不一致！" });
        return;
      }
      if (masterPasswordInput.value.length < 6) {
        showAlert({ title: "金鑰強度不足", message: "金鑰長度至少需要 6 個字元。" });
        return;
      }
      if (masterPasswordInput.value !== confirmMasterPasswordInput.value) {
        showAlert({ title: "輸入錯誤", message: "兩次輸入的金鑰不一致！" });
        return;
      }
      signup(email.value, loginPassword.value, masterPasswordInput.value);
    };

    const toggleMode = () => {
      isRegisterMode.value = !isRegisterMode.value;
    };

    return {
      isRegisterMode,
      email,
      loginPassword,
      confirmLoginPassword,
      masterPasswordInput,
      confirmMasterPasswordInput,
      formTitle,
      handleSubmit,
      toggleMode,
    };
  },
  template: `
        <div class="login-container">
            <div class="login-card">
                <h1>{{ formTitle }}</h1>
                <div class="form-group">
                    <label>電子郵件</label>
                    <input type="email" v-model="email" placeholder="you@example.com" @keyup.enter="handleSubmit">
                </div>
                <div class="form-group">
                    <label>登入密碼</label>
                    <input type="password" v-model="loginPassword" placeholder="至少 6 個字元" @keyup.enter="handleSubmit">
                </div>

                <template v-if="isRegisterMode">
                    <div class="form-group">
                        <label>確認登入密碼</label>
                        <input type="password" v-model="confirmLoginPassword" placeholder="再次輸入登入密碼" @keyup.enter="handleSubmit">
                    </div>
                     <div class="form-group">
                        <label>金鑰（Master Password）</label>
                        <input type="password" v-model="masterPasswordInput" placeholder="至少 6 個字元" @keyup.enter="handleSubmit">
                    </div>
                     <div class="form-group">
                        <label>確認金鑰</label>
                        <input type="password" v-model="confirmMasterPasswordInput" placeholder="再次輸入金鑰" @keyup.enter="handleSubmit">
                    </div>
                </template>

                <div class="login-actions">
                    <button class="login-button" @click="handleSubmit">
                        {{ isRegisterMode ? '註冊' : '登入' }}
                    </button>
                    <button class="register-button" @click="toggleMode">
                        {{ isRegisterMode ? '已有帳號？前往登入' : '沒有帳號？立即註冊' }}
                    </button>
                </div>
            </div>
        </div>
    `,
};
