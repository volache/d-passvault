const { computed } = Vue;
import { useStore } from "../store.js";
import { CheckCircleIcon, AlertTriangleIcon } from "../icons.js";

export default {
  components: {
    CheckCircleIcon,
    AlertTriangleIcon,
  },
  setup() {
    const { notification, hideNotification, executeConfirm, executeCancel, clearClipboard } = useStore();
    return {
      notification,
      hideNotification,
      executeConfirm,
      executeCancel,
      clearClipboard,
    };
  },
  template: `
        <Transition name="modal-fade">
            <div class="notification-container" v-if="notification.visible">
                <!-- Toast -->
                <div v-if="notification.type === 'toast'" class="toast-notification">
                     <span>{{ notification.message }}</span>
                     <button 
                         v-if="notification.showClearButton" 
                         class="toast-clear-button"
                         @click="clearClipboard"
                     >
                         立即清除
                     </button>
                </div>

                <!-- Alert / Confirm -->
                <div v-else class="dialog-overlay" @click="hideNotification">
                    <div class="dialog-content" @click.stop>
                        <AlertTriangleIcon v-if="notification.isDanger" style="color: #dc3545; width: 36px; height: 36px; margin: 0 auto;" />
                        <h2 v-if="notification.title">{{ notification.title }}</h2>
                        <p v-if="notification.message">{{ notification.message }}</p>
                        <div class="dialog-actions">
                            <button v-if="notification.type === 'confirm'" class="cancel-button" @click="executeCancel">
                                {{ notification.cancelText || '取消' }}
                            </button>
                            <button 
                                class="confirm-button" 
                                :class="{ 'danger': notification.isDanger }"
                                @click="executeConfirm"
                            >
                                {{ notification.confirmText || '確認' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    `,
};
