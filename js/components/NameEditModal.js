const { ref, watch, computed, nextTick } = Vue; // 引入 nextTick
import { useStore } from "../store.js";

export default {
  props: {
    isVisible: Boolean,
    item: Object,
    title: String,
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const { showAlert } = useStore();
    const localName = ref("");
    const inputField = ref(null); // 建立模板引用

    const isEditMode = computed(() => props.item && props.item.id);
    const headerTitle = computed(() => {
      return (isEditMode.value ? "編輯" : "新增") + props.title;
    });

    watch(
      () => props.isVisible,
      async (newVal) => {
        if (newVal) {
          // Modal 變為可見
          localName.value = props.item ? props.item.name : "";
          // 等待下一個 DOM 更新週期，確保 input 元素已存在
          await nextTick();
          // 設置焦點
          if (inputField.value) {
            inputField.value.focus();
          }
        }
      }
    );

    const closeModal = () => emit("close");

    const save = () => {
      if (!localName.value.trim()) {
        showAlert({ title: "輸入錯誤", message: "名稱不能為空！" });
        return;
      }
      const dataToSave = {
        ...props.item,
        name: localName.value.trim(),
      };
      emit("save", dataToSave);
    };

    return { localName, headerTitle, inputField, closeModal, save };
  },
  template: `
        <Transition name="modal-fade">
            <div class="modal-overlay name-edit-modal" v-if="isVisible" @click.self="closeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>{{ headerTitle }}</h2>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>名稱</label>
                            <input 
                                type="text" 
                                v-model="localName" 
                                @keyup.enter="save"
                                ref="inputField"
                            >
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" @click="closeModal">取消</button>
                        <button class="save-button" @click="save">儲存</button>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
