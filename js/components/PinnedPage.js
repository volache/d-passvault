const { ref, computed, watchEffect } = Vue;
const draggable = vuedraggable;
import PasswordItem from "./PasswordItem.js";
import { XCircleIcon } from "../icons.js";

export default {
  props: {
    items: { type: Array, required: true },
    categories: { type: Array, required: true },
  },
  emits: ["select-item", "filter-by-tag", "filter-by-category", "update-order"],
  components: {
    PasswordItem,
    XCircleIcon,
    draggable,
  },
  setup(props, { emit }) {
    const searchTerm = ref("");
    const categoryMap = computed(() => new Map(props.categories.map((cat) => [cat.id, cat.name])));
    const filteredPinnedItems = ref([]);

    watchEffect(() => {
      let result = props.items.filter((item) => item.isPinned);
      const lowerCaseSearch = searchTerm.value.toLowerCase().trim();
      if (lowerCaseSearch) {
        result = result.filter((item) => {
          const categoryName = categoryMap.value.get(item.categoryId) || (item.categoryId === null ? "未分類" : "");
          const tagsString = item.tags ? item.tags.join(" ") : "";

          const searchableString = [item.title, item.username, item.url, categoryName, tagsString, item.notes].join(" ").toLowerCase();

          return searchableString.includes(lowerCaseSearch);
        });
      }
      result.sort((a, b) => a.order - b.order);
      filteredPinnedItems.value = result;
    });

    const handleDragEnd = () => {
      const newPinnedOrder = filteredPinnedItems.value;
      const unpinnedItems = props.items.filter((item) => !item.isPinned).sort((a, b) => a.order - b.order);
      const combinedItems = [...newPinnedOrder, ...unpinnedItems];
      const newOrderedIds = combinedItems.map((item) => item.id);
      emit("update-order", newOrderedIds);
    };

    const handleCategoryFilter = (categoryId) => {
      emit("filter-by-category", categoryId);
    };

    return {
      searchTerm,
      filteredPinnedItems,
      categoryMap,
      handleDragEnd,
      handleCategoryFilter,
    };
  },
  template: `
        <div>
            <div class="search-bar-wrapper">
                <input type="text" v-model="searchTerm" placeholder="從釘選項目中搜尋⋯⋯" class="search-input">
                <button v-if="searchTerm" @click="searchTerm = ''" class="clear-filter-button">
                    <XCircleIcon />
                </button>
            </div>

            <draggable
                :list="filteredPinnedItems"
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
                        @filter-by-tag="tag => $emit('filter-by-tag', tag)"
                        @filter-by-category="handleCategoryFilter"
                    />
                </template>
            </draggable>

            <div v-if="!filteredPinnedItems.length" class="empty-state">
                <p>找不到任何釘選項目。</p>
            </div>
        </div>
    `,
};
