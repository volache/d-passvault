const { ref, computed } = Vue;
import { PlusIcon, EditIcon, Trash2Icon, GripVerticalIcon } from "../icons.js";
import { useStore } from "../store.js";
const draggable = vuedraggable;

export default {
  props: {
    categories: Array,
    tags: Array,
    items: Array,
  },
  emits: ["edit-item", "delete-item", "add-item", "filter-by-category", "filter-by-tag", "update-dimensions-order"],
  components: {
    PlusIcon,
    EditIcon,
    Trash2Icon,
    GripVerticalIcon,
    draggable,
  },
  setup(props, { emit }) {
    const { showConfirm } = useStore();
    const activeTab = ref("categories");

    const categoriesWithCount = computed(() => {
      return [...props.categories]
        .sort((a, b) => a.order - b.order)
        .map((category) => {
          const count = props.items.filter((item) => item.categoryId === category.id).length;
          return { ...category, count };
        });
    });

    const tagsWithCount = computed(() => {
      return [...props.tags]
        .sort((a, b) => a.order - b.order)
        .map((tag) => {
          const count = props.items.filter((item) => item.tags && item.tags.includes(tag.name)).length;
          return { ...tag, count };
        });
    });

    const switchTab = (tabName) => {
      activeTab.value = tabName;
    };
    const addItem = (type) => {
      emit("add-item", type);
    };
    const editItem = (type, item) => {
      emit("edit-item", type, item);
    };
    const deleteItem = (type, item) => {
      emit("delete-item", type, item);
    };
    const filterByCategory = (category) => {
      emit("filter-by-category", category.id);
    };
    const filterByTag = (tag) => {
      emit("filter-by-tag", tag.name);
    };

    const handleDragEnd = (event, type) => {
      const newOrderedItems = type === "category" ? categoriesWithCount.value : tagsWithCount.value;
      emit("update-dimensions-order", type, newOrderedItems);
    };

    return {
      activeTab,
      categoriesWithCount,
      tagsWithCount,
      switchTab,
      addItem,
      editItem,
      deleteItem,
      filterByCategory,
      filterByTag,
      handleDragEnd,
    };
  },
  template: `
        <div class="tac-page-container">
            <div class="tac-tabs">
                <button 
                    class="tac-tab" 
                    :class="{ active: activeTab === 'categories' }"
                    @click="switchTab('categories')"
                >分類</button>
                <button 
                    class="tac-tab" 
                    :class="{ active: activeTab === 'tags' }"
                    @click="switchTab('tags')"
                >標籤</button>
            </div>

            <Transition name="tab-content-fade" mode="out-in">
                <div :key="activeTab">
                    <div v-if="activeTab === 'categories'" class="tac-list-container">
                        <div class="list-header">
                            <h2>所有分類</h2>
                            <button class="tac-add-button" @click="addItem('category')">
                                <PlusIcon /> 新增
                            </button>
                        </div>
                        <draggable
                            :list="categoriesWithCount"
                            item-key="id"
                            class="tac-list"
                            handle=".drag-handle"
                            @end="(event) => handleDragEnd(event, 'category')"
                        >
                            <template #item="{ element: cat }">
                                <div class="tac-list-item" @click="filterByCategory(cat)">
                                    <div class="drag-handle" @click.stop>
                                        <GripVerticalIcon />
                                    </div>
                                    <div class="tac-item-name">
                                       <span>{{ cat.name }}</span>
                                       <span class="item-count">{{ cat.count }}</span>
                                    </div>
                                    <div class="tac-item-actions">
                                        <button @click.stop="editItem('category', cat)"><EditIcon /></button>
                                        <button @click.stop="deleteItem('category', cat)"><Trash2Icon /></button>
                                    </div>
                                </div>
                            </template>
                        </draggable>
                        <div v-if="!categories.length" class="empty-state">
                            <p>尚未建立任何分類。</p>
                        </div>
                    </div>
    
                    <div v-if="activeTab === 'tags'" class="tac-list-container">
                        <div class="list-header">
                            <h2>所有標籤</h2>
                             <button class="tac-add-button" @click="addItem('tag')">
                                <PlusIcon /> 新增
                            </button>
                        </div>
                         <draggable
                            :list="tagsWithCount"
                            item-key="id"
                            class="tac-list"
                            handle=".drag-handle"
                            @end="(event) => handleDragEnd(event, 'tag')"
                        >
                            <template #item="{ element: tag }">
                                <div class="tac-list-item" @click="filterByTag(tag)">
                                    <div class="drag-handle" @click.stop>
                                        <GripVerticalIcon />
                                    </div>
                                    <div class="tac-item-name">
                                        <span>{{ tag.name }}</span>
                                        <span class="item-count">{{ tag.count }}</span>
                                    </div>
                                    <div class="tac-item-actions">
                                        <button @click.stop="editItem('tag', tag)"><EditIcon /></button>
                                        <button @click.stop="deleteItem('tag', tag)"><Trash2Icon /></button>
                                    </div>
                                </div>
                            </template>
                        </draggable>
                         <div v-if="!tags.length" class="empty-state">
                            <p>尚未建立任何標籤。</p>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    `,
};
