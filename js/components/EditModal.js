const { ref, watch, computed } = Vue;
import { PinIcon, Trash2Icon, EyeIcon, EyeOffIcon, CopyIcon, RefreshCwIcon, Wand2Icon, XIcon, PlusIcon, CheckIcon, ExternalLinkIcon, ChevronDownIcon } from "../icons.js";
import CustomSelect from "./CustomSelect.js";
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
    item: Object,
    availableCategories: Array,
    availableTags: Array,
  },
  emits: ["close", "save", "delete", "copy-text", "add-item"],
  components: {
    PinIcon,
    Trash2Icon,
    EyeIcon,
    EyeOffIcon,
    CopyIcon,
    RefreshCwIcon,
    Wand2Icon,
    XIcon,
    PlusIcon,
    CheckIcon,
    ExternalLinkIcon,
    ChevronDownIcon,
    CustomSelect,
  },
  setup(props, { emit }) {
    const { showAlert } = useStore();
    const localItem = ref({ tags: [], password: "" });
    const tagInput = ref("");
    const isPasswordVisible = ref(false);
    const isGeneratorVisible = ref(false);
    const copiedField = ref(null);
    let copyTimeout = null;

    const passwordFieldType = computed(() => (isPasswordVisible.value ? "text" : "password"));

    const showTagSuggestions = ref(false);

    const availableTagsForSelection = computed(() => {
      return [...props.availableTags].sort((a, b) => a.order - b.order).filter((tag) => !localItem.value.tags.includes(tag.name));
    });

    const tagSuggestions = computed(() => {
      if (!tagInput.value) return [];
      const search = tagInput.value.toLowerCase();
      return availableTagsForSelection.value.filter((tag) => tag.name.toLowerCase().includes(search)).map((tag) => tag.name);
    });

    const shouldShowSuggestionsPanel = computed(() => {
      return showTagSuggestions.value || tagInput.value.length > 0;
    });

    const displayedTagSuggestions = computed(() => {
      return tagInput.value ? tagSuggestions.value : availableTagsForSelection.value.map((t) => t.name);
    });

    const toggleShowAllTags = () => {
      showTagSuggestions.value = !showTagSuggestions.value;
    };

    const addTag = (tagName) => {
      const trimmedTag = tagName.trim();
      if (trimmedTag && !localItem.value.tags.includes(trimmedTag)) {
        localItem.value.tags.push(trimmedTag);
      }
      tagInput.value = "";
      showTagSuggestions.value = false;
    };

    const handleTagInput = () => {
      addTag(tagInput.value);
    };

    const removeTag = (tagToRemove) => {
      localItem.value.tags = localItem.value.tags.filter((tag) => tag !== tagToRemove);
    };

    const handleTagInputBlur = () => {
      window.setTimeout(() => {
        showTagSuggestions.value = false;
      }, 200);
    };

    const generator = ref({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });

    const categoryOptions = computed(() => {
      const options = [...props.availableCategories].sort((a, b) => a.order - b.order).map((cat) => ({ value: cat.id, text: cat.name }));
      options.push({ value: "__ADD_NEW__", text: "＋ 新增分類" });
      return options;
    });

    const formattedUrl = computed(() => {
      if (!localItem.value.url) {
        return "#";
      }
      if (localItem.value.url.startsWith("http://") || localItem.value.url.startsWith("https://")) {
        return localItem.value.url;
      }
      return `https://${localItem.value.url}`;
    });

    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          isPasswordVisible.value = false;
          isGeneratorVisible.value = false;
          copiedField.value = null;
          if (copyTimeout) clearTimeout(copyTimeout);

          if (props.item) {
            localItem.value = { ...props.item, tags: [...(props.item.tags || [])] };
          } else {
            localItem.value = { title: "", username: "", password: "", url: "", categoryId: null, tags: [], notes: "", isPinned: false };
          }
          tagInput.value = "";
        }
      }
    );

    const handleAddNewCategory = () => {
      emit("add-item", "category", (newCategory) => {
        localItem.value.categoryId = newCategory.id;
      });
    };

    const saveItem = () => {
      if (!localItem.value.title || !localItem.value.username) {
        showAlert({ title: "輸入錯誤", message: "標題和使用者名稱為必填欄位！" });
        return;
      }
      handleTagInput();
      emit("save", localItem.value);
    };

    const generatePassword = () => {
      const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = generator.value;
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
      let charSet = "";
      if (includeUppercase) charSet += upper;
      if (includeLowercase) charSet += lower;
      if (includeNumbers) charSet += numbers;
      if (includeSymbols) charSet += symbols;
      if (charSet === "") {
        showAlert({ title: "產生失敗", message: "請至少選擇一種字元類型！" });
        return;
      }
      let newPassword = "";
      for (let i = 0; i < length; i++) {
        newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
      }
      localItem.value.password = newPassword;
      isPasswordVisible.value = true;
    };

    const copyField = (fieldName, fieldKey, textToCopy) => {
      if (!textToCopy) return;
      if (copyTimeout) clearTimeout(copyTimeout);
      emit("copy-text", fieldName, textToCopy);
      copiedField.value = fieldKey;
      window.setTimeout(() => {
        copiedField.value = null;
      }, 1500);
    };

    const closeModal = () => emit("close");

    const deleteItem = () => {
      emit("delete", localItem.value);
    };
    const togglePin = () => {
      localItem.value.isPinned = !localItem.value.isPinned;
    };
    const isEditMode = computed(() => props.item && props.item.id);

    return {
      localItem,
      tagInput,
      isPasswordVisible,
      isGeneratorVisible,
      copiedField,
      generator,
      categoryOptions,
      passwordFieldType,
      formattedUrl,
      tagSuggestions,
      showTagSuggestions,
      shouldShowSuggestionsPanel,
      displayedTagSuggestions,
      toggleShowAllTags,
      handleTagInputBlur,
      togglePasswordVisibility: () => (isPasswordVisible.value = !isPasswordVisible.value),
      toggleGeneratorVisibility: () => (isGeneratorVisible.value = !isGeneratorVisible.value),
      generatePassword,
      copyField,
      closeModal,
      saveItem,
      deleteItem,
      togglePin,
      isEditMode,
      handleAddNewCategory,
      addTag,
      handleTagInput,
      removeTag,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>{{ isEditMode ? '編輯項目' : '新增項目' }}</h2>
                        <button @click="togglePin" class="pin-button" :class="{ 'is-pinned': localItem.isPinned }"><PinIcon /></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>標題</label>
                            <input type="text" v-model="localItem.title" placeholder="例如：Google">
                        </div>
                        <div class="form-group has-single-button-flex">
                            <label>使用者名稱／帳號</label>
                            <input type="text" v-model="localItem.username" placeholder="例如：example@gmail.com">
                            <div class="field-buttons-container">
                                <button class="field-button" @click="copyField('使用者名稱／帳號', 'username', localItem.username)">
                                    <CheckIcon v-if="copiedField === 'username'" />
                                    <CopyIcon v-else />
                                </button>
                            </div>
                        </div>
                        <div class="form-group has-button-flex">
                            <label>密碼</label>
                            <input 
                                :type="passwordFieldType"
                                v-model="localItem.password"
                                placeholder="請輸入或產生密碼"
                                autocomplete="off"
                                autocapitalize="off"
                                spellcheck="false"
                            >
                            <div class="field-buttons-container">
                                <button class="field-button" @click="togglePasswordVisibility">
                                    <component :is="isPasswordVisible ? 'EyeOffIcon' : 'EyeIcon'" />
                                </button>
                                <button class="field-button" @click="toggleGeneratorVisibility"><Wand2Icon /></button>
                                <button class="field-button" @click="copyField('密碼', 'password', localItem.password)">
                                    <CheckIcon v-if="copiedField === 'password'" />
                                    <CopyIcon v-else />
                                </button>
                            </div>
                        </div>

                        <div v-if="isGeneratorVisible" class="password-generator">
                            <div class="generator-header">
                                <span>密碼產生器</span>
                                <button @click="generatePassword"><RefreshCwIcon /> 重新產生</button>
                            </div>
                            <div class="generator-slider">
                                <span>長度：{{ generator.length }}</span>
                                <input type="range" min="8" max="32" v-model="generator.length">
                            </div>
                            <div class="generator-options">
                                <label><input type="checkbox" v-model="generator.includeUppercase"> 大寫（A-Z）</label>
                                <label><input type="checkbox" v-model="generator.includeLowercase"> 小寫（a-z）</label>
                                <label><input type="checkbox" v-model="generator.includeNumbers"> 數字（0-9）</label>
                                <label><input type="checkbox" v-model="generator.includeSymbols"> 符號（!@#）</label>
                            </div>
                        </div>

                        <div class="form-group has-two-buttons-flex">
                            <label>網址</label>
                            <input type="url" v-model="localItem.url" placeholder="https://example.com">
                            <div class="field-buttons-container">
                                <a :href="formattedUrl" target="_blank" rel="noopener noreferrer" class="field-button" v-if="localItem.url">
                                    <ExternalLinkIcon />
                                </a>
                                <button class="field-button" @click="copyField('網址', 'url', localItem.url)">
                                     <CheckIcon v-if="copiedField === 'url'" />
                                    <CopyIcon v-else />
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>分類</label>
                            <CustomSelect 
                                v-model="localItem.categoryId" 
                                :options="categoryOptions" 
                                placeholder="未分類"
                                @add-new-option="handleAddNewCategory"
                            />
                        </div>
                        <div class="form-group has-single-button-flex">
                            <label>標籤</label>
                            <div class="tag-input-wrapper" @click="$refs.tagInputField.focus()">
                                <div v-for="tag in localItem.tags" :key="tag" class="tag-pill">
                                    <span>{{ tag }}</span>
                                    <button @click.stop="removeTag(tag)"><XIcon /></button>
                                </div>
                                <div class="tag-input-field-wrapper">
                                    <input 
                                        type="text" 
                                        class="tag-input-field"
                                        ref="tagInputField"
                                        v-model="tagInput"
                                        placeholder="輸入或選擇標籤"
                                        @keydown.enter.prevent="handleTagInput"
                                        @focus="showTagSuggestions = true"
                                        @blur="handleTagInputBlur"
                                    >
                                    <button class="tag-input-chevron-btn" @mousedown.prevent="toggleShowAllTags">
                                        <ChevronDownIcon :class="{ 'rotate-180': shouldShowSuggestionsPanel }" />
                                    </button>
                                </div>
                            </div>
                            
                            <div v-if="shouldShowSuggestionsPanel && displayedTagSuggestions.length > 0" class="tag-suggestions">
                                <button 
                                    v-for="suggestion in displayedTagSuggestions" 
                                    :key="suggestion"
                                    class="suggestion-pill"
                                    @mousedown.prevent="addTag(suggestion)"
                                >
                                    <PlusIcon size="14"/> {{ suggestion }}
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>備註</label>
                            <textarea v-model="localItem.notes" rows="3" placeholder="請輸入備註內容⋯⋯"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button v-if="isEditMode" class="delete-button" @click="deleteItem"><Trash2Icon /></button>
                        <div v-else class="delete-button-placeholder" style="visibility: hidden;">
                             <Trash2Icon />
                        </div>
                        <div class="actions">
                            <button class="cancel-button" @click="closeModal">取消</button>
                            <button class="save-button" @click="saveItem">儲存</button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
