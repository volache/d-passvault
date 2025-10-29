const { computed } = Vue;
import { SunIcon, MoonIcon, DownloadIcon, UploadIcon, ClockIcon, TimerIcon, LogInIcon, ChevronRightIcon, Trash2Icon, KeyRoundIcon, UserCogIcon } from "../icons.js";
import CustomSelect from "./CustomSelect.js";
import { useStore } from "../store.js";

export default {
  props: {
    currentTheme: { type: String, required: true },
    // 允許多種類型
    clipboardTime: { type: [String, null], required: true },
    autoLockTime: { type: [String, null], required: true },
    currentUser: { type: Object, default: () => null },
  },
  emits: [
    "toggle-theme",
    "open-export-modal",
    "open-import-modal",
    "update-clipboard-time",
    "update-autolock-time",
    "clear-all-data",
    "logout",
    "open-change-mp-modal",
    "open-change-lp-modal",
  ],
  components: {
    SunIcon,
    MoonIcon,
    DownloadIcon,
    UploadIcon,
    ClockIcon,
    TimerIcon,
    LogInIcon,
    ChevronRightIcon,
    Trash2Icon,
    KeyRoundIcon,
    UserCogIcon,
    CustomSelect,
  },
  setup(props, { emit }) {
    const { showConfirm } = useStore();
    const isDarkMode = computed(() => props.currentTheme === "dark");

    const clipboardTimeOptions = [
      { value: "15", text: "15 秒" },
      { value: "30", text: "30 秒" },
      { value: "60", text: "60 秒" },
      { value: "0", text: "永不" },
    ];

    const selectedClipboardTime = computed({
      get: () => props.clipboardTime,
      set: (value) => {
        emit("update-clipboard-time", value);
      },
    });

    const autoLockTimeOptions = [
      { value: "60", text: "1 分鐘" },
      { value: "300", text: "5 分鐘" },
      { value: "900", text: "15 分鐘" },
      { value: "1800", text: "30 分鐘" },
      { value: "0", text: "永不" },
    ];

    const selectedAutoLockTime = computed({
      get: () => props.autoLockTime,
      set: (value) => {
        emit("update-autolock-time", value);
      },
    });

    const toggleTheme = () => {
      emit("toggle-theme");
    };
    const openExportModal = () => {
      emit("open-export-modal");
    };
    const openImportModal = () => {
      emit("open-import-modal");
    };
    const clearAllData = () => {
      emit("clear-all-data");
    };
    const handleLogout = () => {
      emit("logout");
    };
    const openChangeMasterPasswordModal = () => {
      emit("open-change-mp-modal");
    };
    const openChangeLoginPasswordModal = () => {
      emit("open-change-lp-modal");
    };

    return {
      isDarkMode,
      clipboardTimeOptions,
      selectedClipboardTime,
      autoLockTimeOptions,
      selectedAutoLockTime,
      toggleTheme,
      openExportModal,
      openImportModal,
      clearAllData,
      handleLogout,
      openChangeMasterPasswordModal,
      openChangeLoginPasswordModal,
    };
  },
  template: `
        <div>
            <!-- 雲端同步 -->
            <div class="settings-section">
                <div class="section-header">雲端同步</div>
                <div class="settings-card">
                    <div v-if="currentUser" class="settings-item">
                        <div class="settings-item-content">
                            <span class="settings-item-title">已同步</span>
                            <span class="settings-item-subtitle">{{ currentUser.email }}</span>
                        </div>
                        <div class="settings-item-action">
                             <button class="logout-button" @click="handleLogout">登出</button>
                        </div>
                    </div>
                    <div v-else class="settings-item" data-interactive="true">
                        <div class="settings-item-content">
                            <span class="settings-item-title">登入以啟用同步</span>
                            <span class="settings-item-subtitle">在您的所有裝置間安全地同步密碼</span>
                        </div>
                        <div class="settings-item-action">
                            <ChevronRightIcon />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 安全性 -->
            <div class="settings-section">
                <div class="section-header">安全性</div>
                <div class="settings-card">
                    <div class="settings-item" data-interactive="true" @click="openChangeLoginPasswordModal">
                        <div class="settings-item-content">
                            <span class="settings-item-title">變更登入密碼</span>
                        </div>
                        <div class="settings-item-action"><UserCogIcon style="width: 18px;" /><ChevronRightIcon /></div>
                    </div>
                    <div class="settings-item" data-interactive="true" @click="openChangeMasterPasswordModal">
                        <div class="settings-item-content">
                            <span class="settings-item-title">變更金鑰</span>
                        </div>
                        <div class="settings-item-action"><KeyRoundIcon style="width: 18px;" /><ChevronRightIcon /></div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-content">
                            <span class="settings-item-title">自動鎖定</span>
                        </div>
                        <div class="settings-item-action">
                             <CustomSelect 
                                v-model="selectedAutoLockTime"
                                :options="autoLockTimeOptions"
                                placeholder="請選擇"
                            />
                        </div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-content">
                            <span class="settings-item-title">剪貼簿清除</span>
                        </div>
                        <div class="settings-item-action">
                             <CustomSelect 
                                v-model="selectedClipboardTime"
                                :options="clipboardTimeOptions"
                                placeholder="請選擇"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 外觀 -->
            <div class="settings-section">
                <div class="section-header">外觀</div>
                <div class="settings-card">
                    <div class="settings-item" data-interactive="true" @click="toggleTheme">
                         <div class="settings-item-content">
                            <span class="settings-item-title">夜間模式</span>
                        </div>
                        <div class="settings-item-action">
                             <label class="theme-switch" @click.stop>
                                <input type="checkbox" :checked="isDarkMode" @change.stop="toggleTheme">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 資料管理 -->
            <div class="settings-section">
                <div class="section-header">資料管理</div>
                <div class="settings-card">
                    <div class="settings-item" data-interactive="true" @click="openExportModal">
                        <div class="settings-item-content">
                            <span class="settings-item-title">匯出資料</span>
                        </div>
                        <div class="settings-item-action"><ChevronRightIcon /></div>
                    </div>
                    <div class="settings-item" data-interactive="true" @click="openImportModal">
                        <div class="settings-item-content">
                            <span class="settings-item-title">匯入資料</span>
                        </div>
                        <div class="settings-item-action"><ChevronRightIcon /></div>
                    </div>
                </div>
            </div>

            <!-- 危險區域 -->
            <div class="settings-section danger-zone">
                <div class="section-header">危險區域</div>
                <div class="settings-card">
                     <div class="settings-item" data-interactive="true" @click="clearAllData">
                        <div class="settings-item-content">
                            <span class="settings-item-title">清除所有資料</span>
                        </div>
                        <div class="settings-item-action"><Trash2Icon /></div>
                    </div>
                </div>
            </div>
        </div>
    `,
};
