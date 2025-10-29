const { ref, computed, watchEffect, watch } = Vue;
import { getGmt8Timestamp } from "./utils.js";
import { auth, db } from "./firebase.js";
import { encrypt, decrypt } from "./crypto.js";

// --- 核心狀態定義 ---
const user = ref(null);
const isLoading = ref(true);
const isLocked = ref(true);
let sessionMasterPassword = null;
const autoLockTime = ref(localStorage.getItem("passvault-autolock-time") || "300");
let autoLockTimer = null;
const isSyncing = ref(false);
const categories = ref([]);
const tags = ref([]);
const passwordItems = ref([]);
const isEditModalVisible = ref(false);
const isExportModalVisible = ref(false);
const isImportModalVisible = ref(false);
const isNameEditModalVisible = ref(false);
const isChangeMasterPasswordModalVisible = ref(false);
const isChangeLoginPasswordModalVisible = ref(false);
const nameEditModalConfig = ref({ type: "", item: null, callback: null });
const selectedItem = ref(null);
const activeTagFilter = ref(null);
const activeCategoryFilter = ref(null);
const theme = ref(localStorage.getItem("passvault-theme") || "light");
const clipboardClearTime = ref(localStorage.getItem("passvault-clipboard-time") || "15");
const currentPage = ref("home");
const transitionName = ref("page-cross-fade");
const notification = ref({
  visible: false,
  type: "toast",
  title: "",
  message: "",
  confirmText: "確認",
  cancelText: "取消",
  isDanger: false,
  showClearButton: false,
  onConfirm: null,
  onCancel: null,
});
let notificationTimer = null;
let firestoreListener = null;

// --- 通知系統方法 ---
const hideNotification = () => {
  notification.value.visible = false;
};

const showToast = (message, showClearButton = false, textToCopy = "") => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (showClearButton && textToCopy) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        notification.value = {
          visible: true,
          type: "toast",
          message,
          showClearButton: true,
        };
        notificationTimer = setTimeout(hideNotification, 5000);
      })
      .catch((err) => {
        console.error("複製失敗：", err);
        notification.value = {
          visible: true,
          type: "toast",
          message: "複製失敗！",
          showClearButton: false,
        };
        notificationTimer = setTimeout(hideNotification, 3000);
      });
  } else {
    notification.value = {
      visible: true,
      type: "toast",
      message,
      showClearButton: false,
    };
    notificationTimer = setTimeout(hideNotification, 3000);
  }
};

const showAlert = ({ title = "提示", message }) => {
  notification.value = {
    visible: true,
    type: "alert",
    title,
    message,
    confirmText: "確認",
    onConfirm: hideNotification,
  };
};

const showConfirm = ({ title = "請確認", message, confirmText = "確認", cancelText = "取消", isDanger = false, onConfirm, onCancel }) => {
  notification.value = {
    visible: true,
    type: "confirm",
    title,
    message,
    confirmText,
    cancelText,
    isDanger,
    onConfirm,
    onCancel,
  };
};

const executeConfirm = () => {
  if (typeof notification.value.onConfirm === "function") {
    notification.value.onConfirm();
  }
  // 不再自動關閉，由 onConfirm 決定
};

const executeCancel = () => {
  if (typeof notification.value.onCancel === "function") {
    notification.value.onCancel();
  }
  hideNotification();
};

const lockApp = () => {
  if (!isLocked.value) {
    console.log("App has been locked due to inactivity.");
    isLocked.value = true;
    sessionMasterPassword = null;
    unsubscribeFirestoreListener();
    passwordItems.value = [];
    categories.value = [];
    tags.value = [];
    showToast("應用程式已自動鎖定");
  }
};
const resetAutoLockTimer = () => {
  if (autoLockTimer) clearTimeout(autoLockTimer);
  const timeInSeconds = parseInt(autoLockTime.value, 10);
  if (!isLocked.value && timeInSeconds > 0) {
    autoLockTimer = setTimeout(lockApp, timeInSeconds * 1000);
  }
};
const updateAutoLockTime = (time) => {
  autoLockTime.value = time;
  localStorage.setItem("passvault-autolock-time", time);
  resetAutoLockTimer();
};
const setupFirestoreListener = (uid) => {
  if (!sessionMasterPassword) {
    console.error("無法設定監聽器：金鑰不存在。");
    isLocked.value = true;
    return;
  }
  isLoading.value = true;
  const userDocRef = db.collection("userData").doc(uid);
  firestoreListener = userDocRef.onSnapshot(
    (doc) => {
      isSyncing.value = true;
      if (doc.exists) {
        const data = doc.data();
        if (data.passwordItems && data.passwordItems.length > 0) {
          try {
            decrypt(data.passwordItems[0].username, sessionMasterPassword);
            const decryptedItems = data.passwordItems.map((item) => ({
              ...item,
              username: decrypt(item.username, sessionMasterPassword),
              password: decrypt(item.password, sessionMasterPassword),
              notes: decrypt(item.notes, sessionMasterPassword),
              url: decrypt(item.url, sessionMasterPassword),
            }));
            passwordItems.value = decryptedItems;
            categories.value = data.categories || [];
            tags.value = data.tags || [];
            console.log("雲端資料已解密並同步至本地。");
          } catch (e) {
            console.warn("偵測到解密失敗，可能金鑰已在其他裝置上變更。");
            unsubscribeFirestoreListener();
            isLocked.value = true;
            sessionMasterPassword = null;
            showToast("請重新輸入金鑰以同步更新。");
          }
        } else {
          passwordItems.value = [];
          categories.value = data.categories || [];
          tags.value = data.tags || [];
        }
      }
      isLoading.value = false;
      setTimeout(() => {
        isSyncing.value = false;
      }, 200);
    },
    (error) => {
      console.error("Firestore 監聽失敗：", error);
      showAlert({
        title: "連線錯誤",
        message: "無法連接到雲端資料庫，請檢查您的網路連線。",
      });
      isLoading.value = false;
    }
  );
};
const unsubscribeFirestoreListener = () => {
  if (firestoreListener) {
    firestoreListener();
    firestoreListener = null;
    console.log("已取消 Firestore 監聽。");
  }
};
const saveDataToFirestore = async () => {
  if (isSyncing.value || !user.value || !sessionMasterPassword) return;
  try {
    const itemsToEncrypt = JSON.parse(JSON.stringify(passwordItems.value));
    const encryptedItems = itemsToEncrypt.map((item) => ({
      ...item,
      username: encrypt(item.username, sessionMasterPassword),
      password: encrypt(item.password, sessionMasterPassword),
      notes: encrypt(item.notes, sessionMasterPassword),
      url: encrypt(item.url, sessionMasterPassword),
    }));
    const userDocRef = db.collection("userData").doc(user.value.uid);
    await userDocRef.update({
      passwordItems: encryptedItems,
      categories: categories.value,
      tags: tags.value,
    });
    console.log("本地資料已加密並同步到雲端。");
  } catch (error) {
    console.error("寫入 Firestore 失敗：", error);
    showToast("雲端同步失敗！");
  }
};

watch([passwordItems, categories, tags], saveDataToFirestore, { deep: true });

auth.onAuthStateChanged((firebaseUser) => {
  unsubscribeFirestoreListener();
  if (firebaseUser) {
    user.value = { uid: firebaseUser.uid, email: firebaseUser.email };
    isLocked.value = true;
  } else {
    user.value = null;
    isLocked.value = true;
    sessionMasterPassword = null;
    passwordItems.value = [];
    categories.value = [];
    tags.value = [];
    currentPage.value = "home";
  }
  isLoading.value = false;
});

const pageComponents = {
  home: "HomePage",
  "tags-and-categories": "TagsAndCategoriesPage",
  pinned: "PinnedPage",
  settings: "SettingsPage",
};
const pageTitles = {
  home: "所有項目",
  "tags-and-categories": "分類與標籤",
  pinned: "釘選項目",
  settings: "帳號設定",
};
const currentPageComponent = computed(() => pageComponents[currentPage.value]);
const currentPageTitle = computed(() => {
  if (activeTagFilter.value) {
    return `標籤：${activeTagFilter.value}`;
  }
  if (activeCategoryFilter.value) {
    const category = categories.value.find((c) => c.id === activeCategoryFilter.value);
    return category ? `分類：${category.name}` : "所有項目";
  }
  return pageTitles[currentPage.value];
});

const signup = async (email, loginPassword, masterPassword) => {
  isLoading.value = true;
  try {
    const verificationText = "PassVaultVerification";
    const encryptedVerification = encrypt(verificationText, masterPassword);
    const { user: firebaseUser } = await auth.createUserWithEmailAndPassword(email, loginPassword);
    await db.collection("userData").doc(firebaseUser.uid).set({
      masterPasswordVerification: encryptedVerification,
      passwordItems: [],
      categories: [],
      tags: [],
    });
    showToast("註冊成功！請使用您的帳號登入。");
    await auth.signOut();
  } catch (error) {
    let message = "註冊失敗，請稍後再試。";
    switch (error.code) {
      case "auth/email-already-in-use":
        message = "這個電子郵件地址已經被註冊了。";
        break;
      case "auth/invalid-email":
        message = "電子郵件地址格式不正確。";
        break;
      case "auth/weak-password":
        message = "登入密碼強度不足，至少需要 6 個字元。";
        break;
    }
    showAlert({ title: "註冊失敗", message });
  } finally {
    isLoading.value = false;
  }
};
const login = async (email, loginPassword) => {
  isLoading.value = true;
  try {
    await auth.signInWithEmailAndPassword(email, loginPassword);
  } catch (error) {
    let message = "登入失敗，請稍後再試。";
    if (error.code === "auth/invalid-login-credentials" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "電子郵件或密碼錯誤，請重新輸入。";
    } else if (error.code === "auth/invalid-email") {
      message = "電子郵件地址格式不正確。";
    }
    showAlert({ title: "登入失敗", message });
    isLoading.value = false;
  }
};
const logout = () => {
  showConfirm({
    title: "登出",
    message: "您確定要登出嗎？",
    confirmText: "登出",
    isDanger: true,
    onConfirm: async () => {
      try {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        await auth.signOut();
        hideNotification();
      } catch (error) {
        showAlert({ title: "登出失敗", message: error.message });
      }
    },
  });
};
const unlock = async (masterPassword) => {
  if (!user.value) return;
  isLoading.value = true;
  try {
    const userDocRef = db.collection("userData").doc(user.value.uid);
    const doc = await userDocRef.get();
    if (!doc.exists || !doc.data().masterPasswordVerification) {
      throw new Error("找不到金鑰驗證資料，您的帳號可能已損壞。");
    }
    const encryptedVerification = doc.data().masterPasswordVerification;
    const decryptedText = decrypt(encryptedVerification, masterPassword);
    if (decryptedText === "PassVaultVerification") {
      sessionMasterPassword = masterPassword;
      isLocked.value = false;
      currentPage.value = "home";
      setupFirestoreListener(user.value.uid);
      resetAutoLockTimer();
      showToast("解鎖成功！");
    } else {
      throw new Error("金鑰錯誤。");
    }
  } catch (error) {
    showAlert({ title: "解鎖失敗", message: "金鑰錯誤或資料損壞。" });
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
const changeLoginPassword = async (currentLoginPassword, newLoginPassword) => {
  isLoading.value = true;
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("使用者未登入。");
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentLoginPassword);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(newLoginPassword);
    showToast("登入密碼變更成功！");
    return true;
  } catch (error) {
    console.error("變更登入密碼失敗：", error);
    let message = "變更登入密碼失敗，請稍後再試。";
    if (error.code === "auth/wrong-password") {
      message = "目前的登入密碼輸入錯誤。";
    }
    showAlert({ title: "操作失敗", message });
    return false;
  } finally {
    isLoading.value = false;
  }
};
const changeMasterPassword = async (currentMasterPassword, newMasterPassword) => {
  if (!user.value || !sessionMasterPassword) return false;
  if (currentMasterPassword !== sessionMasterPassword) {
    showAlert({ title: "驗證失敗", message: "目前的金鑰輸入錯誤。" });
    return false;
  }
  isLoading.value = true;
  unsubscribeFirestoreListener();
  try {
    const itemsToReEncrypt = JSON.parse(JSON.stringify(passwordItems.value));
    const reEncryptedItems = itemsToReEncrypt.map((item) => ({
      ...item,
      username: encrypt(item.username, newMasterPassword),
      password: encrypt(item.password, newMasterPassword),
      notes: encrypt(item.notes, newMasterPassword),
      url: encrypt(item.url, newMasterPassword),
    }));
    const newEncryptedVerification = encrypt("PassVaultVerification", newMasterPassword);
    await db.collection("userData").doc(user.value.uid).update({
      passwordItems: reEncryptedItems,
      masterPasswordVerification: newEncryptedVerification,
      categories: categories.value,
      tags: tags.value,
    });
    sessionMasterPassword = newMasterPassword;
    showToast("金鑰變更成功！");
    return true;
  } catch (error) {
    console.error("變更金鑰失敗：", error);
    showAlert({ title: "操作失敗", message: "變更金鑰失敗，請稍後再試。" });
    return false;
  } finally {
    isLoading.value = false;
    if (user.value) {
      setupFirestoreListener(user.value.uid);
    }
  }
};
const clearClipboard = () => {
  navigator.clipboard
    .writeText("")
    .then(() => {
      showToast("剪貼簿已清除");
    })
    .catch((err) => {
      console.error("清除剪貼簿失敗：", err);
      showAlert({ title: "錯誤", message: "清除剪貼簿失敗。" });
    });
};
const navigateTo = (pageId) => {
  if (currentPage.value === pageId) return;
  activeTagFilter.value = null;
  activeCategoryFilter.value = null;
  currentPage.value = pageId;
};
const openModal = (item = null) => {
  isEditModalVisible.value = true;
  selectedItem.value = item;
};
const closeModal = () => {
  isEditModalVisible.value = false;
  selectedItem.value = null;
};
const handleSaveItem = (itemData) => {
  if (itemData.id) {
    const index = passwordItems.value.findIndex((i) => i.id === itemData.id);
    if (index !== -1) {
      passwordItems.value[index] = itemData;
    }
  } else {
    const newItem = {
      ...itemData,
      id: Date.now(),
      order: passwordItems.value.length + 1,
    };
    passwordItems.value.push(newItem);
  }
  itemData.tags.forEach((tagName) => {
    const tagExists = tags.value.some((t) => t.name === tagName);
    if (!tagExists) {
      tags.value.push({ id: Date.now() + Math.random(), name: tagName });
    }
  });
  closeModal();
};
const handleDeleteItem = (item) => {
  showConfirm({
    title: "刪除項目",
    message: `您確定要刪除「${item.title}」嗎？此操作無法復原。`,
    confirmText: "刪除",
    isDanger: true,
    onConfirm: () => {
      passwordItems.value = passwordItems.value.filter((i) => i.id !== item.id);
      closeModal();
      showToast(`項目「${item.title}」已刪除`);
      hideNotification();
    },
  });
};
const handleUpdateOrder = (newOrderedIds) => {
  const orderMap = new Map(newOrderedIds.map((id, index) => [id, index]));
  passwordItems.value.forEach((item) => {
    if (orderMap.has(item.id)) {
      item.order = orderMap.get(item.id);
    }
  });
};
const handleUpdateDimensionsOrder = (type, newOrderedItems) => {
  const targetArray = type === "category" ? categories.value : tags.value;
  const orderMap = new Map(newOrderedItems.map((item, index) => [item.id, index]));
  targetArray.forEach((item) => {
    if (orderMap.has(item.id)) {
      item.order = orderMap.get(item.id);
    }
  });
  if (type === "category") categories.value = [...targetArray];
  else tags.value = [...targetArray];
};
const handleSetTagFilter = (tagName) => {
  activeTagFilter.value = tagName;
  activeCategoryFilter.value = null;
  currentPage.value = "home";
};
const handleSetCategoryFilter = (categoryId) => {
  activeCategoryFilter.value = categoryId;
  activeTagFilter.value = null;
  currentPage.value = "home";
};
const clearAllFilters = () => {
  activeTagFilter.value = null;
  activeCategoryFilter.value = null;
};
const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};
const updateClipboardTime = (time) => {
  clipboardClearTime.value = time;
  localStorage.setItem("passvault-clipboard-time", time);
};
const handleExportData = (backupPassword) => {
  const dataToExport = {
    passwordItems: passwordItems.value,
    categories: categories.value,
    tags: tags.value,
  };
  const dataStr = JSON.stringify(dataToExport);
  const encryptedData = encrypt(dataStr, backupPassword);
  const blob = new Blob([encryptedData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `passvault_backup_${getGmt8Timestamp()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("加密的 JSON 資料已匯出！");
};
const handleExportCSV = () => {
  showConfirm({
    title: "即將匯出未加密的檔案",
    message: "警告：未加密的 CSV 檔案是純文字格式，任何擁有此檔案的人都能讀取您的所有密碼。確定要繼續嗎？",
    confirmText: "繼續匯出",
    isDanger: true,
    onConfirm: () => {
      const headers = ["標題", "使用者名稱／帳號", "密碼", "網址", "分類", "標籤", "備註"];
      const categoryMap = new Map(categories.value.map((cat) => [cat.id, cat.name]));
      const csvRows = [headers.join(",")];
      passwordItems.value.forEach((item) => {
        const escapeCsvCell = (cell) => {
          const strCell = String(cell || "");
          if (strCell.includes(",") || strCell.includes('"') || strCell.includes("\n")) {
            return `"${strCell.replace(/"/g, '""')}"`;
          }
          return strCell;
        };
        const row = [
          escapeCsvCell(item.title),
          escapeCsvCell(item.username),
          escapeCsvCell(item.password),
          escapeCsvCell(item.url),
          escapeCsvCell(categoryMap.get(item.categoryId) || ""),
          escapeCsvCell(item.tags.join("; ")),
          escapeCsvCell(item.notes),
        ];
        csvRows.push(row.join(","));
      });
      const csvString = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `passvault_export_${getGmt8Timestamp()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("CSV 檔案已匯出！");
      hideNotification();
    },
  });
};
const handleImportData = (importedData) => {
  try {
    if (!importedData.passwordItems || !importedData.categories || !importedData.tags) {
      throw new Error("無效的備份檔案格式。");
    }
    showConfirm({
      title: "匯入備份檔案",
      message: "警告：匯入備份檔案將會覆蓋所有現有資料，此操作無法復原。您確定要繼續嗎？",
      confirmText: "匯入並覆蓋",
      isDanger: true,
      onConfirm: async () => {
        isLoading.value = true;
        isSyncing.value = true;
        try {
          const itemsToEncrypt = importedData.passwordItems || [];
          const encryptedItems = itemsToEncrypt.map((item) => ({
            ...item,
            username: encrypt(item.username, sessionMasterPassword),
            password: encrypt(item.password, sessionMasterPassword),
            notes: encrypt(item.notes, sessionMasterPassword),
            url: encrypt(item.url, sessionMasterPassword),
          }));
          const userDocRef = db.collection("userData").doc(user.value.uid);
          await userDocRef.update({
            passwordItems: encryptedItems,
            categories: importedData.categories || [],
            tags: importedData.tags || [],
          });
          console.log("匯入的備份檔案已成功加密並上傳到雲端。");
          passwordItems.value = importedData.passwordItems;
          categories.value = importedData.categories;
          tags.value = importedData.tags;
          showToast("備份檔案匯入成功！");
        } catch (e) {
          console.error("匯入並上傳時發生錯誤：", e);
          showAlert({
            title: "匯入失敗",
            message: "處理或上傳備份檔案時發生錯誤，請稍後再試。",
          });
        } finally {
          isLoading.value = false;
          isSyncing.value = false;
          hideNotification();
        }
      },
    });
  } catch (error) {
    showAlert({ title: "匯入失敗", message: error.message });
  }
};
const handleClearAllData = () => {
  showConfirm({
    title: "清除所有資料",
    message: "警告：您即將清除所有已儲存的密碼項目、分類和標籤。此操作無法復原！您確定要繼續嗎？",
    confirmText: "全部清除",
    isDanger: true,
    onConfirm: () => {
      showConfirm({
        title: "最後確認",
        message: "真的要清除所有資料嗎？",
        confirmText: "是的，清除",
        isDanger: true,
        onConfirm: () => {
          passwordItems.value = [];
          categories.value = [];
          tags.value = [];
          showToast("所有資料已清除。");
          hideNotification();
        },
      });
    },
  });
};
const handleAddItem = (type, callback = null, itemData = null) => {
  nameEditModalConfig.value = { type, item: itemData, callback };
  isNameEditModalVisible.value = true;
};
const handleEditItem = (type, item) => {
  nameEditModalConfig.value = { type, item, callback: null };
  isNameEditModalVisible.value = true;
};
const closeNameEditModal = () => {
  isNameEditModalVisible.value = false;
};
const handleSaveName = (itemData) => {
  const { type, callback } = nameEditModalConfig.value;
  let targetArray = null;
  if (type === "category") {
    targetArray = categories.value;
  } else if (type === "tag" || type === "new-tag") {
    targetArray = tags.value;
  }
  if (!targetArray) return;
  if (itemData.id) {
    const index = targetArray.findIndex((i) => i.id === itemData.id);
    if (index !== -1) {
      const oldName = targetArray[index].name;
      targetArray[index] = itemData;
      if (type === "tag") {
        passwordItems.value.forEach((pItem) => {
          const tagIndex = pItem.tags.indexOf(oldName);
          if (tagIndex !== -1) {
            pItem.tags[tagIndex] = itemData.name;
          }
        });
      }
    }
  } else {
    const newItem = {
      id: Date.now(),
      name: itemData.name,
      order: targetArray.length,
    };
    targetArray.push(newItem);
    if (callback) {
      callback(newItem);
    }
  }
  closeNameEditModal();
};
const handleDeleteDimensionItem = (type, item) => {
  showConfirm({
    title: `刪除${type === "category" ? "分類" : "標籤"}`,
    message: `確定要刪除「${item.name}」嗎？所有關聯的密碼項目將會失去此標記。`,
    confirmText: "刪除",
    isDanger: true,
    onConfirm: () => {
      if (type === "category") {
        categories.value = categories.value.filter((c) => c.id !== item.id);
        passwordItems.value.forEach((pItem) => {
          if (pItem.categoryId === item.id) {
            pItem.categoryId = null;
          }
        });
      } else if (type === "tag") {
        tags.value = tags.value.filter((t) => t.id !== item.id);
        passwordItems.value.forEach((pItem) => {
          pItem.tags = pItem.tags.filter((t) => t !== item.name);
        });
      }
      hideNotification();
    },
  });
};

watchEffect(() => {
  document.documentElement.className = theme.value;
  localStorage.setItem("passvault-theme", theme.value);
});

export function useStore() {
  return {
    user,
    isLoading,
    isLocked,
    categories,
    tags,
    passwordItems,
    isEditModalVisible,
    isExportModalVisible,
    isImportModalVisible,
    isNameEditModalVisible,
    isChangeMasterPasswordModalVisible,
    isChangeLoginPasswordModalVisible,
    nameEditModalConfig,
    selectedItem,
    activeTagFilter,
    activeCategoryFilter,
    theme,
    clipboardClearTime,
    autoLockTime,
    notification,
    currentPage,
    transitionName,
    currentPageComponent,
    currentPageTitle,
    signup,
    login,
    logout,
    unlock,
    changeMasterPassword,
    changeLoginPassword,
    lockApp,
    resetAutoLockTimer,
    showToast,
    showAlert,
    showConfirm,
    hideNotification,
    executeConfirm,
    executeCancel,
    clearClipboard,
    navigateTo,
    openModal,
    closeModal,
    handleSaveItem,
    handleDeleteItem,
    handleUpdateOrder,
    handleUpdateDimensionsOrder,
    handleSetTagFilter,
    handleSetCategoryFilter,
    clearAllFilters,
    toggleTheme,
    updateAutoLockTime,
    updateClipboardTime,
    handleExportData,
    handleExportCSV,
    handleImportData,
    handleClearAllData,
    handleAddItem,
    handleEditItem,
    closeNameEditModal,
    handleSaveName,
    handleDeleteDimensionItem,
  };
}
