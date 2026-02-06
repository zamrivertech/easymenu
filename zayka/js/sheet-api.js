/* ===========================
   Google Sheets API Management with Formula Support
=========================== */

const SheetAPI = (() => {
  const SHEET_ID = "1LshawAIIIorlZF1T3rV6LDx1hx81M-CpOCmMq3hGQjU";
  const API_KEY = "AIzaSyA_88FypaC1s4exlXvKn_x0_28WvZnSLjs";
  const MAIN_SHEET_TAB = "Menu-en"; // Primary data source
  
  // Cache to avoid repeated failed requests
  const cache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  return {
    // Fetch menu data with formula evaluation support
    fetchMenuData: async function(sheetTab = MAIN_SHEET_TAB, options = {}) {
      const {
        valueRenderOption = "FORMATTED_VALUE", // Evaluates formulas
        dateTimeRenderOption = "FORMATTED_STRING",
        maxRetries = 2,
        fallbackToMainSheet = true
      } = options;

      try {
        // Check cache first
        const cacheKey = `${sheetTab}_${valueRenderOption}`;
        const cachedData = this._getCachedData(cacheKey);
        if (cachedData !== null) {
          console.log(`[SheetAPI] Returning cached data for: ${sheetTab}`);
          return cachedData;
        }

        // Fetch data with retry logic
        let data = null;
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            data = await this._fetchWithRetry(
              sheetTab,
              valueRenderOption,
              dateTimeRenderOption,
              attempt
            );
            break; // Success, exit retry loop
          } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
              // Exponential backoff
              const delay = Math.pow(2, attempt) * 500;
              console.warn(
                `[SheetAPI] Retry ${attempt + 1}/${maxRetries} for ${sheetTab} in ${delay}ms`
              );
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        // Handle failures
        if (!data) {
          if (fallbackToMainSheet && sheetTab !== MAIN_SHEET_TAB) {
            console.warn(
              `[SheetAPI] Falling back to ${MAIN_SHEET_TAB} (failed: ${lastError?.message})`
            );
            return this.fetchMenuData(MAIN_SHEET_TAB, { ...options, fallbackToMainSheet: false });
          }
          throw lastError || new Error(`Failed to fetch data from ${sheetTab}`);
        }

        // Parse and validate data
        const menuData = this._parseSheetData(data.values, sheetTab);
        
        // Validate data structure
        if (!this._isValidMenuData(menuData, sheetTab)) {
          throw new Error(`Invalid menu data structure from ${sheetTab}`);
        }

        // Cache successful result
        this._setCachedData(cacheKey, menuData);

        console.log(
          `[SheetAPI] Successfully fetched ${menuData.length} items from ${sheetTab}`
        );
        return menuData;

      } catch (error) {
        console.error(`[SheetAPI] Final error for ${sheetTab}:`, error.message);
        throw error;
      }
    },

    // Internal: Fetch with timeout and error handling
    _fetchWithRetry: async function(
      sheetTab,
      valueRenderOption,
      dateTimeRenderOption,
      attempt
    ) {
      const RANGE = `${sheetTab}!A:E`;
      const url = new URL(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`
      );
      
      // Add parameters for formula evaluation
      url.searchParams.append("key", API_KEY);
      url.searchParams.append("valueRenderOption", valueRenderOption);
      url.searchParams.append("dateTimeRenderOption", dateTimeRenderOption);
      url.searchParams.append("t", Date.now()); // Cache buster
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const res = await fetch(url.toString(), {
          cache: "no-store",
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status}: ${res.statusText}. Sheet "${sheetTab}" may not exist.`
          );
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(
            `Sheets API Error: ${data.error.message} for tab "${sheetTab}"`
          );
        }

        if (!data.values || data.values.length === 0) {
          throw new Error(
            `No data in sheet "${sheetTab}". Check: 1) Tab name exists, 2) Formulas evaluated, 3) Data range correct`
          );
        }

        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    },

    // Parse sheet data into menu items
    _parseSheetData: function(rows, sheetTab) {
      if (!rows || rows.length < 1) {
        return [];
      }

      const [headers, ...dataRows] = rows;

      return dataRows
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = row[i] ?? ""; // Use ?? to handle falsy values
          });
          return obj;
        })
        .filter(item => item.Name || item.Category); // Filter empty rows
    },

    // Validate menu data structure
    _isValidMenuData: function(data, sheetTab) {
      if (!Array.isArray(data)) return false;
      if (data.length === 0) {
        console.warn(`[SheetAPI] Warning: Empty menu data from ${sheetTab}`);
        return false;
      }

      // Check if first item has required fields
      const firstItem = data[0];
      const requiredFields = ["Category", "Name"];
      const hasRequiredFields = requiredFields.every(field => field in firstItem);

      if (!hasRequiredFields) {
        console.error(
          `[SheetAPI] Missing required fields. Expected: ${requiredFields.join(", ")} in ${sheetTab}`
        );
        return false;
      }

      return true;
    },

    // Cache helpers
    _getCachedData: function(key) {
      const cached = cache.get(key);
      if (!cached) return null;

      const { data, timestamp } = cached;
      const isExpired = Date.now() - timestamp > CACHE_DURATION;

      if (isExpired) {
        cache.delete(key);
        return null;
      }

      return data;
    },

    _setCachedData: function(key, data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    },

    // Fetch from language-specific sheet tab
    fetchMenuDataByLanguage: async function(lang = "en") {
      const sheetTab = LanguageManager.getSheetTab(lang);
      return this.fetchMenuData(sheetTab, {
        valueRenderOption: "FORMATTED_VALUE",
        fallbackToMainSheet: true
      });
    },

    // Debug: Check sheet availability and data
    debugSheetTab: async function(sheetTab) {
      console.group(`[SheetAPI Debug] Checking tab: ${sheetTab}`);
      try {
        console.log(`Fetching with FORMATTED_VALUE...`);
        const data = await this.fetchMenuData(sheetTab, {
          valueRenderOption: "FORMATTED_VALUE",
          fallbackToMainSheet: false,
          maxRetries: 0
        });
        console.log(`✓ Success: ${data.length} items found`);
        console.table(data.slice(0, 3));
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
      }
      console.groupEnd();
    },

    // Clear cache
    clearCache: function() {
      cache.clear();
      console.log("[SheetAPI] Cache cleared");
    }
  };
})();
