const { ref } = Vue;
import { DownloadIcon, KeyRoundIcon } from "../icons.js";
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
  },
  emits: ["close", "export-json", "export-csv"],
  components: {
    DownloadIcon,
    KeyRoundIcon,
  },
  setup(props, { emit }) {
    const { showAlert, showConfirm } = useStore();
    const backupPassword = ref("");

    const closeModal = () => {
      backupPassword.value = "";
      emit("close");
    };

    const handleExportJson = () => {
      if (!backupPassword.value) {
        showAlert({ title: "輸入錯誤", message: "請設定一個備份密碼！" });
        return;
      }
      emit("export-json", backupPassword.value);
      closeModal();
    };

    const handleExportCsv = () => {
      showConfirm({
        title: "即將匯出未加密的檔案",
        message: "警告：未加密的 CSV 檔案是純文字格式，任何擁有此檔案的人都能讀取您的所有密碼。確定要繼續嗎？",
        confirmText: "繼續匯出",
        isDanger: true,
        onConfirm: () => {
          emit("export-csv");
          closeModal();
        },
      });
    };

    return {
      backupPassword,
      closeModal,
      handleExportJson,
      handleExportCsv,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>選擇匯出格式</h2>
                    </div>
                    <div class="export-modal-body">
                        <div class="export-option">
                            <div class="export-option-header json">
                                <DownloadIcon />
                                <span>匯出加密的 JSON</span>
                            </div>
                            <div class="export-password-section">
                                <div class="form-group">
                                    <label class="decrypt-header">
                                        <KeyRoundIcon />
                                        <span>設定備份密碼</span>
                                    </label>
                                    <input type="password" v-model="backupPassword" placeholder="用於解密此備份檔案的密碼" @keyup.enter="handleExportJson">
                                </div>
                                <button class="save-button" @click="handleExportJson">
                                    <DownloadIcon />
                                    確認匯出
                                </button>
                            </div>
                        </div>

                        <div class="export-option" @click="handleExportCsv" style="cursor: pointer;">
                            <div class="export-option-header csv">
                                <DownloadIcon />
                                <span>匯出未加密的 CSV</span>
                            </div>
                            <p class="export-warning" style="margin-top: 0;">
                                警告：此格式為純文字，不包含任何加密功能，適用於遷移至其他密碼管理工具；請妥善保管檔案。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
