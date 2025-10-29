const { ref } = Vue;
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { changeMasterPassword, showAlert } = useStore();
    const currentMasterPassword = ref("");
    const newMasterPassword = ref("");
    const confirmNewMasterPassword = ref("");

    const closeModal = () => {
      currentMasterPassword.value = "";
      newMasterPassword.value = "";
      confirmNewMasterPassword.value = "";
      emit("close");
    };

    const handleSubmit = async () => {
      if (!currentMasterPassword.value || !newMasterPassword.value) {
        showAlert({ title: "輸入錯誤", message: "請填寫所有欄位。" });
        return;
      }
      if (newMasterPassword.value !== confirmNewMasterPassword.value) {
        showAlert({ title: "輸入錯誤", message: "新的金鑰兩次輸入不一致。" });
        return;
      }
      if (newMasterPassword.value.length < 6) {
        showAlert({
          title: "輸入錯誤",
          message: "新的金鑰長度至少需要 6 個字元。",
        });
        return;
      }

      const success = await changeMasterPassword(currentMasterPassword.value, newMasterPassword.value);
      if (success) {
        closeModal();
      }
    };

    return {
      currentMasterPassword,
      newMasterPassword,
      confirmNewMasterPassword,
      closeModal,
      handleSubmit,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>變更金鑰</h2>
                    </div>
                    <div class="modal-body change-mp-modal-body">
                        <p style="color: var(--text-color-secondary); font-size: 14px; line-height: 1.5;">
                            警告：變更金鑰會將您的所有資料重新加密。請務必牢記您的新金鑰，一旦遺失將無法復原資料。
                        </p>
                        <div class="form-group">
                            <label>目前金鑰</label>
                            <input type="password" v-model="currentMasterPassword" placeholder="請輸入目前使用的金鑰">
                        </div>
                        <div class="form-group">
                            <label>新的金鑰</label>
                            <input type="password" v-model="newMasterPassword" placeholder="請輸入新的金鑰">
                        </div>
                        <div class="form-group">
                            <label>確認新的金鑰</label>
                            <input type="password" v-model="confirmNewMasterPassword" placeholder="請再次輸入新的金鑰" @keyup.enter="handleSubmit">
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
