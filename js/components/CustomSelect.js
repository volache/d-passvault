const { ref, onMounted, onUnmounted, computed, nextTick } = Vue;
import { ChevronDownIcon } from "../icons.js";

export default {
  props: {
    modelValue: [String, Number, null],
    options: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: "請選擇",
    },
  },
  emits: ["update:modelValue", "add-new-option"],
  components: {
    ChevronDownIcon,
  },
  setup(props, { emit }) {
    const isOpen = ref(false);
    const selectRef = ref(null);
    const itemsRef = ref(null);

    const selectedText = computed(() => {
      const selectedOption = props.options.find((opt) => opt.value === props.modelValue);
      return selectedOption ? selectedOption.text : props.placeholder;
    });

    const itemsStyle = ref({});
    const updatePosition = () => {
      if (!selectRef.value) return;
      const rect = selectRef.value.getBoundingClientRect();
      itemsStyle.value = {
        width: `${rect.width}px`,
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
      };
    };

    const toggleDropdown = async () => {
      isOpen.value = !isOpen.value;
      if (isOpen.value) {
        await nextTick();
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
      } else {
        window.removeEventListener("scroll", updatePosition, true);
      }
    };

    const selectOption = (option) => {
      if (option.value === "__ADD_NEW__") {
        emit("add-new-option");
        isOpen.value = false;
        return;
      }
      emit("update:modelValue", option.value);
      isOpen.value = false;
    };

    const handleClickOutside = (event) => {
      if (selectRef.value && !selectRef.value.contains(event.target) && itemsRef.value && !itemsRef.value.contains(event.target)) {
        isOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
    });

    return {
      isOpen,
      selectedText,
      selectRef,
      itemsRef,
      itemsStyle,
      toggleDropdown,
      selectOption,
    };
  },
  template: `
        <div class="custom-select" ref="selectRef">
            <div class="select-selected" @click="toggleDropdown" :class="{ 'open': isOpen }">
                <span>{{ selectedText }}</span>
                <ChevronDownIcon :class="{ 'rotate-180': isOpen }" style="width: 20px; color: var(--text-color-secondary);" />
            </div>

            <teleport to="body">
                <div 
                    class="select-items-container" 
                    v-if="isOpen" 
                    :style="itemsStyle" 
                    ref="itemsRef"
                >
                    <div @click="selectOption({ value: null, text: placeholder })">{{ placeholder }}</div>
                    <div 
                        v-for="option in options" 
                        :key="option.value" 
                        @click="selectOption(option)"
                    >
                        {{ option.text }}
                    </div>
                </div>
            </teleport>
        </div>
    `,
};
