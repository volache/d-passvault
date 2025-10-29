# PassVault 密碼管理工具？

PassVault 是一個基於 Vue 3 和 Firebase 的現代化、輕量級密碼管理工具。它採用純前端 CDN 開發模式，無需複雜的建構環境，並透過客戶端加密技術，確保您的所有敏感資料在雲端都是安全加密的。

---

## ✨ 功能亮點

- **端對端加密**：所有敏感資料（帳號、密碼、網址、備註）將在您的裝置上，使用您的個人**金鑰（主密碼）** 進行 AES 加密後，才會同步到雲端。
- **即時雲端同步**：採用 Firestore 即時資料庫，在多台已登入且解鎖的裝置之間無縫同步所有變更。
- **完整的 CRUD 操作**：提供流暢的新增、編輯、刪除和檢視密碼項目的體驗。
- **進階互動**：
  - 智慧搜尋框，可同時搜尋標題、使用者名稱、網址、分類、標籤和備註。
  - 支援拖曳排序所有項目、釘選項目、分類和標籤。
  - 釘選項目可以方便快速存取常用帳號。
- **安全工具集**：
  - 支援變更登入密碼和金鑰。
  - 內建強密碼產生器，支援自訂長度和字元類型。
  - 可自訂時長的自動鎖定功能。
  - 一鍵複製功能，並提供手動清除剪貼簿的安全選項。
- **個人化與資料管理**：
  - 支援日夜間模式，並自動儲存您的偏好。
  - 支援匯出為**加密的 JSON** 和 **未加密的 CSV**。
  - 支援從加密的 JSON 備份檔案中匯入資料。
- **支援 PWA**：可被「安裝」到手機主畫面，並具備基本的離線存取能力。

---

## 🚀 快速開始＆部署設定

本專案基於 CDN，無需 `npm install` 或任何建構步驟。

### 步驟 1：取得 Firebase 配置

若要自行架設此服務，您需要一個自己的 Firebase 專案作為後端。

1.  **建立 Firebase 專案**：

    - 前往 [Firebase 控制台](https://console.firebase.google.com/) 並登入您的 Google 帳號。
    - 點擊「新增專案」，為專案命名（例如 `my-passvault`），然後按照步驟完成建立（可以不用啟用 Google Analytics）。

2.  **啟用所需服務**：

    - 在專案儀表板的左側選單「建構」部分：
      - 點擊 **Authentication** →「開始使用」→ 選擇「**電子郵件／密碼**」作為登入方式並啟用它。
      - 點擊 **Firestore Database** →「建立資料庫」→ 選擇「**以測試模式啟動**」（稍後會更新安全規則）→ 選擇離您最近的 Cloud Firestore 位置並啟用。

3.  **獲取專案配置**：
    - 回到專案首頁（點擊左上角的齒輪圖示 → **專案設定**）。
    - 在「您的應用程式」區塊，點擊網頁圖示 `</>` 來註冊一個新的網頁應用。
    - 為您的應用取一個暱稱（例如 `passvault-web`），然後點擊「註冊應用程式」。
    - 註冊完成後，Firebase 會顯示一段程式碼，其中包含一個名為 `firebaseConfig` 的 JavaScript 物件。**請將這個物件完整地複製下來**，它看起來像這樣：
      ```javascript
      const firebaseConfig = {
        apiKey: "AIzaSyXXXXXXXXXXXXXXXXX",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:1234567890:web:xxxxxxxxxxxxxx",
      };
      ```

### 步驟 2：設定本地環境

1.  **下載專案**：將本儲存庫的所有檔案下載到您的本地電腦。

2.  **建立本地配置檔**：

    - 在 `js/` 資料夾中，將 `firebase-config.template.js` **複製**一份，並重新命名為 `firebase-config.js`。
    - 打開 `firebase-config.js`，將您在上一步複製的 `firebaseConfig` 物件**完整地貼上**進去，取代原有的佔位符內容。
    - （`.gitignore` 檔案已預設配置忽略 `firebase-config.js`，確保您的金鑰不會被意外上傳到公開儲存庫。）

3.  **設定授權網域（用於開發）**：

    - 回到 Firebase 控制台 → Authentication → Settings → **Authorized domains**。
    - 點擊「Add domain」，分別輸入 `localhost` 和 `127.0.0.1` 並新增。

4.  **安裝與啟動**：
    - 在您的程式碼編輯器（如 VS Code）中，安裝「Live Server」擴充功能。
    - 在 `index.html` 檔案上點擊右鍵，選擇「Open with Live Server」。
    - 瀏覽器將會自動打開本地網址，應用程式即可開始使用。

### 步驟 3：部署到 GitHub Pages（可選）

此方法利用 GitHub Actions 自動化部署，並透過 GitHub Secrets 安全地管理您的 Firebase 配置，**避免將金鑰暴露在公開程式碼中**。

1.  **準備 GitHub 儲存庫**：

    - 將您的專案程式碼上傳到一個新的 GitHub 儲存庫。
    - **確保 `.gitignore` 檔案存在**，並且其中包含了 `js/firebase-config.js` 這一行。

2.  **設定 GitHub Secrets**：

    - 在您的 GitHub 儲存庫頁面，前往 **Settings** → **Secrets and variables** → **Actions**。
    - 點擊 **New repository secret** 按鈕。
    - **Name**：輸入 `FIREBASE_CONFIG`
    - **Secret**：在這裡，您需要將您的 `firebaseConfig` 物件轉換為一個**單行的 JSON 字串**。
      - **如何轉換**：複製您的 `firebaseConfig` 物件（不含 `const firebaseConfig =`），使用一個線上 JSON 壓縮工具（如 [jsonformatter.org/json-minify](https://jsonformatter.org/json-minify)）將其壓縮成一行，然後貼上。
    - 點擊 **Add secret**。

3.  **設定 GitHub Pages**：

    - 在您的 GitHub 儲存庫頁面，前往 **Settings** → **Pages**。
    - 在「Build and deployment」的「Source」下拉選單中，選擇 **GitHub Actions**。

4.  **建立 Actions Workflow**：

    - 在您的本地專案根目錄下，建立資料夾結構 `.github/workflows/`。
    - 在 `workflows` 資料夾內，建立一個名為 `deploy.yml` 的檔案，並將以下內容完整貼上：

      ```yml
      name: Deploy to GitHub Pages

      on:
        push:
          branches:
            - main
        workflow_dispatch:

      permissions:
        contents: read
        pages: write
        id-token: write

      concurrency:
        group: "pages"
        cancel-in-progress: true

      jobs:
        deploy:
          environment:
            name: github-pages
            url: ${{ steps.deployment.outputs.page_url }}
          runs-on: ubuntu-latest
          steps:
            - name: Checkout
              uses: actions/checkout@v3

            - name: Create Firebase Config
              run: |
                echo "export const firebaseConfig = ${{ secrets.FIREBASE_CONFIG }};" > js/firebase-config.js

            - name: Setup Pages
              uses: actions/configure-pages@v3

            - name: Upload artifact
              uses: actions/upload-pages-artifact@v2
              with:
                path: "."

            - name: Deploy to GitHub Pages
              id: deployment
              uses: actions/deploy-pages@v2
      ```

5.  **觸發部署**：
    - 將您本地的所有變更（包括 `.github/workflows/deploy.yml` 檔案）提交並 `push` 到 `main` 分支。
    - `push` 操作會自動觸發部署流程。您可以前往儲存庫的 **Actions** 標籤頁查看進度。
    - 部署成功後，您的 PassVault 應用就可以透過 GitHub Pages 提供的網址公開訪問了。

### 步驟 4：強化 Firestore 安全規則（部署前必做）

初始的「測試模式」規則非常不安全。在您準備將應用程式提供給他人使用或部署到公開網址之前，**必須**更新 Firestore 的安全規則，以確保每個用戶的資料都是私密的。

1.  **前往 Firebase 控制台** → **Firestore Database** → **Rules** 分頁。
2.  將編輯器中的所有內容替換為以下規則：

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // 僅允許使用者讀取、寫入、更新或刪除
        // `userData` 集合中，文件 ID 與他們自身 uid 完全相符的文件。
        match /userData/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

3.  點擊「**發布**」。

**規則解釋**：

- `match /userData/{userId}`：這條規則匹配 `userData` 集合下的任何文件。
- `allow read, write`：允許讀取和寫入操作。
- `if request.auth != null && request.auth.uid == userId;`：這是關鍵的安全條件，它要求**同時滿足**以下兩點：
  1.  `request.auth != null`：請求者必須是已登入的用戶。
  2.  `request.auth.uid == userId`：請求者的用戶 ID（`request.auth.uid`）必須與他們試圖存取的文件 ID（`userId`）完全相同。

> 完成此步驟後，您的資料庫就具備了最基本的、也是最關鍵的多用戶安全隔離。

---

## 🛠️ 系統配置與技術棧

- **核心框架**：[Vue 3](https://vuejs.org/)
- **客戶端加密**：[CryptoJS](https://github.com/brix/crypto-js)（AES 算法）
- **圖示庫**：[Lucide](https://lucide.dev/)
- **拖曳排序**：[VueDraggable](https://github.com/SortableJS/Vue.Draggable)
- **模組化**：瀏覽器原生 ES Modules
- **狀態管理**：`js/store.js`（輕量級集中式狀態管理）
- **PWA 架構**：`manifest.json` & `service-worker.js`
- **後端服務**：Google Firebase（Authentication & Firestore）

---

## 📖 App 使用說明

### 首次使用

1.  **註冊**：首次訪問時，點擊「沒有帳號？立即註冊」。您需要設定：
    - **電子郵件** & **登入密碼**：用於登入您的 Firebase 帳號。
    - **金鑰（主密碼）**：這是最重要的密碼，**只存在於您的腦中**，用於加密和解密您的所有資料。**一旦遺失，資料將無法復原！** 建議設定一個高強度的密碼。
2.  **登入**：註冊成功後，使用您的「電子郵件」和「登入密碼」進行登入。
3.  **解鎖**：登入後，您需要輸入您設定的「金鑰」來解鎖您的資料保險庫。

### 主要功能

- **新增項目**：點擊底部導覽列中間的「＋」按鈕。
- **編輯／刪除**：在「所有項目」或「釘選項目」頁面，點擊任一項目卡片即可進入編輯模式。刪除按鈕位於編輯畫面的左下角。
- **排序**：在「所有項目」、「釘選項目」、「分類與標籤」頁面，按住項目左側的拖曳控制項即可進行拖曳排序。
- **篩選**：
  - 在「所有項目」或「釘選項目」頁面的卡片上，點擊「分類」或「標籤」按鈕，即可快速篩選。
  - 在「分類與標籤」頁面，點擊任一分類或標籤，即可跳轉到主頁並顯示篩選結果。
- **帳號設定**：點擊底部導覽列的「帳號設定」，您可以：
  - 變更登入密碼或金鑰。
  - 設定自動鎖定和剪貼簿清除的時間。
  - 切換日夜間模式。
  - 匯出／匯入資料。
  - 清除所有資料（危險操作）！
