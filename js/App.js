const { onMounted, onUnmounted } = Vue;
import { useStore } from "./store.js";

import LoginPage from "./components/LoginPage.js";
import UnlockPage from "./components/UnlockPage.js";
import HomePage from "./components/HomePage.js";
import TagsAndCategoriesPage from "./components/TagsAndCategoriesPage.js";
import PinnedPage from "./components/PinnedPage.js";
import SettingsPage from "./components/SettingsPage.js";
import ChangeMasterPasswordModal from "./components/ChangeMasterPasswordModal.js";
import ChangeLoginPasswordModal from "./components/ChangeLoginPasswordModal.js";
// （NotificationCenter 在 main.js 中全域註冊）

export default {
  components: {
    LoginPage,
    UnlockPage,
    HomePage,
    TagsAndCategoriesPage,
    PinnedPage,
    SettingsPage,
    ChangeMasterPasswordModal,
    ChangeLoginPasswordModal,
  },
  setup() {
    const store = useStore();

    const activityEvents = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];

    onMounted(() => {
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, store.resetAutoLockTimer, true);
      });
    });

    onUnmounted(() => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, store.resetAutoLockTimer, true);
      });
    });

    return {
      ...store,
    };
  },
  template: `
        <!-- NotificationCenter 必須放在最外層 -->
        <NotificationCenter />
        
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
        <LoginPage v-else-if="!user" />
        <UnlockPage v-else-if="user && isLocked" />
        <div v-else class="app-wrapper">
            <header class="page-header">
                <h1>{{ currentPageTitle }}</h1>
            </header>

            <main class="main-content">
                <Transition :name="transitionName">
                    <component 
                        :key="currentPage"
                        :is="currentPageComponent" 
                        :items="passwordItems"
                        :categories="categories"
                        :tags="tags"
                        :active-tag-filter="activeTagFilter"
                        :active-category-filter="activeCategoryFilter"
                        :current-theme="theme"
                        :clipboard-time="clipboardClearTime"
                        :auto-lock-time="autoLockTime"
                        :current-user="user"
                        @select-item="openModal"
                        @filter-by-tag="handleSetTagFilter"
                        @filter-by-category="handleSetCategoryFilter"
                        @clear-all-filters="clearAllFilters"
                        @update-order="handleUpdateOrder" 
                        @update-dimensions-order="handleUpdateDimensionsOrder"
                        @toggle-theme="toggleTheme"
                        @open-export-modal="isExportModalVisible = true"
                        @open-import-modal="isImportModalVisible = true"
                        @update-clipboard-time="updateClipboardTime"
                        @update-autolock-time="updateAutoLockTime"
                        @clear-all-data="handleClearAllData"
                        @add-item="handleAddItem"
                        @edit-item="handleEditItem"
                        @delete-item="handleDeleteDimensionItem"
                        @logout="logout"
                        @open-change-mp-modal="isChangeMasterPasswordModalVisible = true"
                        @open-change-lp-modal="isChangeLoginPasswordModalVisible = true"
                    ></component>
                </Transition>
            </main>
            
            <BottomNavBar 
                :current-page="currentPage" 
                @navigate="navigateTo"
                @add-item="openModal(null)"
            />
            
            <EditModal 
                :is-visible="isEditModalVisible"
                :item="selectedItem"
                :available-categories="categories"
                :available-tags="tags"
                @close="closeModal"
                @save="handleSaveItem"
                @delete="handleDeleteItem"
                @copy-text="(...args) => showToast(args[0], true, args[1])"
                @add-item="handleAddItem"
            />

            <ExportModal 
                :is-visible="isExportModalVisible"
                @close="isExportModalVisible = false"
                @export-json="handleExportData"
                @export-csv="handleExportCSV"
            />

            <ImportModal 
                :is-visible="isImportModalVisible"
                @close="isImportModalVisible = false"
                @import-data="handleImportData"
            />

            <NameEditModal
                :is-visible="isNameEditModalVisible"
                :item="nameEditModalConfig.item"
                :title="nameEditModalConfig.type === 'category' ? '分類' : (nameEditModalConfig.type === 'tag' ? '標籤' : '新標籤')"
                @close="closeNameEditModal"
                @save="handleSaveName"
            />

            <ChangeMasterPasswordModal
                :is-visible="isChangeMasterPasswordModalVisible"
                @close="isChangeMasterPasswordModalVisible = false"
            />

            <ChangeLoginPasswordModal
                :is-visible="isChangeLoginPasswordModalVisible"
                @close="isChangeLoginPasswordModalVisible = false"
            />
        </div>
    `,
};
