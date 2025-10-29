const { ref, computed, watch, onMounted } = Vue;
import { PinIcon, ChevronRightIcon, GripVerticalIcon } from "../icons.js";

export default {
  props: {
    item: { type: Object, required: true },
    categoryName: { type: String, default: "" },
  },
  emits: ["click-item", "filter-by-tag", "filter-by-category"],
  components: {
    PinIcon,
    ChevronRightIcon,
    GripVerticalIcon,
  },
  setup(props) {
    const initial = computed(() => props.item.title.charAt(0).toUpperCase());

    const faviconSrc = ref("");

    const getDomain = (url) => {
      if (!url) return null;
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, "");
      } catch (e) {
        const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        return match ? match[1] : null;
      }
    };

    const loadFavicon = () => {
      faviconSrc.value = "";
      const domain = getDomain(props.item.url);
      if (domain) {
        const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

        const img = new Image();
        img.src = url;
        img.onload = () => {
          faviconSrc.value = url;
        };
        img.onerror = () => {
          faviconSrc.value = "";
        };
      }
    };

    onMounted(loadFavicon);
    watch(() => props.item.url, loadFavicon);

    const iconStyle = computed(() => {
      if (faviconSrc.value) {
        return {
          backgroundImage: `url(${faviconSrc.value})`,
          backgroundColor: "#ffffff",
        };
      }
      return {};
    });

    return {
      initial,
      faviconSrc,
      iconStyle,
    };
  },
  template: `
        <div class="password-item">
            <div class="drag-handle">
                <GripVerticalIcon />
            </div>
            <div class="item-icon" :style="iconStyle" @click="$emit('click-item', item)">
                <span v-if="!faviconSrc">{{ initial }}</span>
            </div>
            <div class="item-info" @click="$emit('click-item', item)">
                <div class="title">
                    {{ item.title }}
                    <PinIcon v-if="item.isPinned" />
                </div>
                <div class="username">{{ item.username }}</div>
                <div class="meta-container" v-if="categoryName || (item.tags && item.tags.length)">
                    <button v-if="categoryName" class="category-chip" @click.stop="$emit('filter-by-category', item.categoryId)">
                        {{ categoryName }}
                    </button>
                    <span v-if="categoryName && (item.tags && item.tags.length)" class="meta-divider">｜</span>
                    <div class="tags-list" v-if="item.tags && item.tags.length">
                        <button 
                            v-for="tag in item.tags" 
                            :key="tag" 
                            class="tag-chip"
                            @click.stop="$emit('filter-by-tag', tag)"
                        >
                            {{ tag }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="item-arrow" @click="$emit('click-item', item)">
                <ChevronRightIcon />
            </div>
        </div>
    `,
};
