const { ref } = Vue;
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { changeLoginPassword, showAlert } = useStore();
    const currentLoginPassword = ref("");
    const newLoginPassword = ref("");
    const confirmNewLoginPassword = ref("");

    const closeModal = () => {
      currentLoginPassword.value = "";
      newLoginPassword.value = "";
      confirmNewLoginPassword.value = "";
      emit("close");
    };

    const handleSubmit = async () => {
      if (!currentLoginPassword.value || !newLoginPassword.value) {
        showAlert({ title: "輸入錯誤", message: "請填寫所有欄位。" });
        return;
      }
      if (newLoginPassword.value !== confirmNewLoginPassword.value) {
        showAlert({ title: "輸入錯誤", message: "新的登入密碼兩次輸入不一致。" });
        return;
      }
      if (newLoginPassword.value.length < 6) {
        showAlert({
          title: "輸入錯誤",
          message: "新的登入密碼長度至少需要 6 個字元。",
        });
        return;
      }

      const success = await changeLoginPassword(currentLoginPassword.value, newLoginPassword.value);
      if (success) {
        closeModal();
      }
    };

    return {
      currentLoginPassword,
      newLoginPassword,
      confirmNewLoginPassword,
      closeModal,
      handleSubmit,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>變更登入密碼</h2>
                    </div>
                    <div class="modal-body change-lp-modal-body">
                         <div class="form-group">
                            <label>目前登入密碼</label>
                            <input type="password" v-model="currentLoginPassword" placeholder="請輸入目前使用的登入密碼">
                        </div>
                        <div class="form-group">
                            <label>新的登入密碼</label>
                            <input type="password" v-model="newLoginPassword" placeholder="請輸入新的登入密碼">
                        </div>
                        <div class="form-group">
                            <label>確認新的登入密碼</label>
                            <input type="password" v-model="confirmNewLoginPassword" placeholder="請再次輸入新的登入密碼" @keyup.enter="handleSubmit">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" @click="closeModal">取消</button>
                        <button class="save-button" @click="handleSubmit">變更</button>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
