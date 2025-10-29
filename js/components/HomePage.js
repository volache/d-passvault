import PasswordItem from "./PasswordItem.js";
import { XCircleIcon } from "../icons.js";
const { ref, computed } = Vue;
const draggable = vuedraggable;

export default {
  props: {
    items: { type: Array, required: true },
    categories: { type: Array, required: true },
    activeTagFilter: { type: String, default: null },
    activeCategoryFilter: { type: Number, default: null },
  },
  emits: ["select-item", "filter-by-tag", "filter-by-category", "clear-all-filters", "update-order"],
  components: {
    PasswordItem,
    XCircleIcon,
    draggable,
  },
  setup(props, { emit }) {
    const searchTerm = ref("");
    const categoryMap = computed(() => new Map(props.categories.map((cat) => [cat.id, cat.name])));

    const filteredAndSortedItems = computed(() => {
      let result = [...props.items];

      if (props.activeTagFilter) {
        result = result.filter((item) => item.tags && item.tags.includes(props.activeTagFilter));
      } else if (props.activeCategoryFilter) {
        result = result.filter((item) => item.categoryId === props.activeCategoryFilter);
      }

      const lowerCaseSearch = searchTerm.value.toLowerCase().trim();
      if (lowerCaseSearch) {
        result = result.filter((item) => {
          const categoryName = categoryMap.value.get(item.categoryId) || (item.categoryId === null ? "未分類" : "");
          const tagsString = item.tags ? item.tags.join(" ") : "";
          const searchableString = [item.title, item.username, item.url, categoryName, tagsString, item.notes].join(" ").toLowerCase();
          return searchableString.includes(lowerCaseSearch);
        });
      }

      result.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return b.isPinned - a.isPinned;
        }
        return a.order - b.order;
      });

      return result;
    });

    const showClearFilterButton = computed(() => props.activeTagFilter || props.activeCategoryFilter);

    const handleDragEnd = (event) => {
      // 獲取 VueDraggable 拖曳後產生的新列表順序
      const newOrderInView = filteredAndSortedItems.value;

      // 獲取當前所有不在視圖中（被篩選掉）的項目，並保持它們的順序
      const allItemIds = new Set(props.items.map((i) => i.id));
      const viewItemIds = new Set(newOrderInView.map((i) => i.id));
      const hiddenItems = props.items.filter((item) => !viewItemIds.has(item.id)).sort((a, b) => a.order - b.order);

      // 將視圖中的新順序與隱藏的項目合併，產生一個完整的全局順序
      const finalOrderedItems = [...newOrderInView, ...hiddenItems];

      // 從這個最終順序中提取 ID 列表
      const finalOrderedIds = finalOrderedItems.map((item) => item.id);

      emit("update-order", finalOrderedIds);
    };

    const handleTagFilter = (tag) => {
      emit("filter-by-tag", tag);
    };

    const handleCategoryFilter = (categoryId) => {
      emit("filter-by-category", categoryId);
    };

    const clearFilters = () => {
      searchTerm.value = "";
      emit("clear-all-filters");
    };

    return {
      searchTerm,
      filteredAndSortedItems,
      categoryMap,
      showClearFilterButton,
      handleDragEnd,
      handleTagFilter,
      handleCategoryFilter,
      clearFilters,
    };
  },
  template: `
        <div>
            <div class="search-bar-wrapper">
                <input type="text" v-model="searchTerm" placeholder="搜尋標題、帳號、網址、分類、標籤、備註⋯⋯" class="search-input">
                <button v-if="showClearFilterButton" @click="clearFilters" class="clear-filter-button">
                    <XCircleIcon />
                </button>
            </div>
            
            <draggable 
                :list="filteredAndSortedItems"
                item-key="id"
                class="list-group"
                ghost-class="ghost"
                animation="200"
                handle=".drag-handle"
                @end="handleDragEnd"
            >
                <template #item="{ element }">
                    <PasswordItem 
                        :item="element"
                        :category-name="categoryMap.get(element.categoryId)"
                        @click-item="item => $emit('select-item', item)"
                        @filter-by-tag="handleTagFilter"
                        @filter-by-category="handleCategoryFilter"
                    />
                </template>
            </draggable>
            
            <div v-if="!filteredAndSortedItems.length" class="empty-state">
                <p>找不到任何項目。</p>
            </div>
        </div>
    `,
};
