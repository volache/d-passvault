const { ref, watch } = Vue;
import { UploadIcon, KeyRoundIcon } from "../icons.js";
import { decrypt } from "../crypto.js";
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
  },
  emits: ["close", "import-data"],
  components: {
    UploadIcon,
    KeyRoundIcon,
  },
  setup(props, { emit }) {
    const { showAlert } = useStore();
    const isDragging = ref(false);
    const fileContent = ref(null);
    const needsDecryption = ref(false);
    const backupPassword = ref("");
    const fileInput = ref(null);

    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          isDragging.value = false;
          fileContent.value = null;
          needsDecryption.value = false;
          backupPassword.value = "";
        }
      }
    );

    const closeModal = () => emit("close");

    const processFile = (file) => {
      if (!file) return;
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          fileContent.value = content;
          try {
            const data = JSON.parse(content);
            handleImport(data);
          } catch (error) {
            needsDecryption.value = true;
          }
        };
        reader.readAsText(file);
      } else {
        showAlert({
          title: "格式錯誤",
          message: "檔案格式不符！請上傳 .json 備份檔案。",
        });
      }
    };

    const handleDecryptAndImport = () => {
      if (!backupPassword.value) {
        showAlert({ title: "輸入錯誤", message: "請輸入備份密碼！" });
        return;
      }
      try {
        const decryptedString = decrypt(fileContent.value, backupPassword.value);
        const data = JSON.parse(decryptedString);
        handleImport(data);
      } catch (error) {
        showAlert({ title: "解密失敗", message: "備份密碼錯誤或檔案損壞。" });
        backupPassword.value = "";
      }
    };

    const handleImport = (data) => {
      emit("import-data", data);
      closeModal();
    };

    const onDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer.files[0];
      processFile(file);
    };

    const onFileChange = (event) => {
      const file = event.target.files[0];
      processFile(file);
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    return {
      isDragging,
      fileContent,
      needsDecryption,
      backupPassword,
      fileInput,
      closeModal,
      onDrop,
      onFileChange,
      triggerFileInput,
      processFile,
      handleDecryptAndImport,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>匯入 JSON 資料</h2>
                    </div>
                    <div class="import-modal-body">
                        <div v-if="!needsDecryption"> 
                            <div 
                                class="drop-zone"
                                :class="{ 'is-dragging': isDragging }"
                                @dragover.prevent="isDragging = true"
                                @dragleave.prevent="isDragging = false"
                                @drop.prevent="onDrop"
                                @click="triggerFileInput"
                            >
                                <UploadIcon />
                                <p>將檔案拖曳至此，或點擊此處選擇檔案</p>
                                <input type="file" ref="fileInput" @change="onFileChange" accept=".json,application/json" hidden>
                            </div>
                        </div>

                        <div v-else class="import-decrypt-section">
                             <div class="form-group">
                                <label class="decrypt-header">
                                    <KeyRoundIcon />
                                    <span>檔案已加密</span>
                                </label>
                                <input type="password" v-model="backupPassword" placeholder="請輸入備份密碼以解密檔案" @keyup.enter="handleDecryptAndImport">
                            </div>
                            <button class="save-button" @click="handleDecryptAndImport">
                                <UploadIcon />
                                解密並匯入
                            </button>
                        </div>
                        <p class="import-notice">目前僅支援從 PassVault 匯出的 .json 備份檔案。</p>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
