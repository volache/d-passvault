const { ref } = Vue;
import { HomeIcon, LayoutGridIcon, StarIcon, SettingsIcon, PlusIcon } from "../icons.js";

export default {
  props: ["currentPage"],
  emits: ["navigate", "add-item"],
  components: {
    HomeIcon,
    LayoutGridIcon,
    StarIcon,
    SettingsIcon,
    PlusIcon,
  },
  setup(props, { emit }) {
    const navItems = ref([
      { id: "home", icon: "HomeIcon", text: "所有項目", type: "link" },
      {
        id: "tags-and-categories",
        icon: "LayoutGridIcon",
        text: "分類與標籤",
        type: "link",
      },
      { id: "add", icon: "PlusIcon", text: "新增", type: "button" },
      { id: "pinned", icon: "StarIcon", text: "釘選項目", type: "link" },
      { id: "settings", icon: "SettingsIcon", text: "帳號設定", type: "link" },
    ]);

    const handleAction = (item) => {
      if (item.type === "link") {
        emit("navigate", item.id);
      } else if (item.type === "button") {
        emit("add-item");
      }
    };

    return {
      navItems,
      handleAction,
    };
  },
  template: `
        <nav class="bottom-nav">
            <div 
                v-for="item in navItems" 
                :key="item.id" 
                :class="[
                    item.type === 'link' ? 'nav-item' : 'nav-item-add',
                    { 'active': currentPage === item.id }
                ]"
                @click="handleAction(item)"
            >
                <template v-if="item.type === 'link'">
                    <component 
                        :is="item.icon" 
                        :stroke-width="currentPage === item.id ? 2.5 : 2"
                    ></component>
                    <span>{{ item.text }}</span>
                </template>
                <template v-else>
                    <button class="add-button">
                        <component :is="item.icon" size="32" stroke-width="2.5"></component>
                    </button>
                </template>
            </div>
        </nav>
    `,
};
