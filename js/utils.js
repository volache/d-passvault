// 輔助函式庫

/**
 * 獲取當前 GMT+8 時區的時間戳字串
 * @returns {string} 格式為 YYYYMMDD_hhmmss
 */
export const getGmt8Timestamp = () => {
  const now = new Date();
  const gmt8Date = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));

  const year = gmt8Date.getFullYear();
  const month = String(gmt8Date.getMonth() + 1).padStart(2, "0");
  const day = String(gmt8Date.getDate()).padStart(2, "0");
  const hours = String(gmt8Date.getHours()).padStart(2, "0");
  const minutes = String(gmt8Date.getMinutes()).padStart(2, "0");
  const seconds = String(gmt8Date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};
