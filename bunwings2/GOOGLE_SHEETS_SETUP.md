# Google Sheets Setup Guide for Zayka Menu with Formula-Based Translations

## Problem Overview
When using formula-based translations (like `=GOOGLETRANSLATE(...)`) in Google Sheets, the Sheets API may:
- Return empty values if formulas haven't been evaluated
- Return formula text instead of results
- Experience delays in formula calculation

## Solution: Enhanced SheetAPI with Formula Support

The updated `sheet-api.js` now includes:
✅ Formula evaluation support (`valueRenderOption=FORMATTED_VALUE`)
✅ Retry logic with exponential backoff
✅ Automatic fallback to main sheet
✅ Data validation and error handling
✅ Result caching to avoid repeated failed requests
✅ Detailed debug logging

## Recommended Google Sheets Setup

### Option 1: Formula-Based Translations (Current)
**Setup:**
```
Sheet: Menu-en (Main data)
├─ Column A: Category
├─ Column B: Name
├─ Column C: Price (MT)
├─ Column D: Description
└─ Column E: Image

Sheet: Menu-pt (Portuguese Translation)
├─ A1: =Menu-en!A1 (copy header)
├─ A2: =GOOGLETRANSLATE(Menu-en!A2,"en","pt") (formula)
├─ B1: =Menu-en!B1 (copy header)
├─ B2: =GOOGLETRANSLATE(Menu-en!B2,"en","pt") (formula)
└─ ... (similar for other columns)

Sheet: Menu-gu, Menu-zh (Same pattern)
```

**Pros:**
- Single source of truth
- Automatic updates when main data changes
- Easy to maintain

**Cons:**
- Formulas must fully evaluate
- API might experience delays
- Easier to debug with new SheetAPI

### Option 2: Copy/Paste Values (More Reliable but Manual)
**Setup:**
1. Create formulas in translated sheets
2. Let them fully evaluate (wait a few seconds)
3. Copy translated columns: `Ctrl+C`
4. Paste Special → Values Only: `Ctrl+Shift+V` → Values
5. Delete original formulas

**Pros:**
- Fastest API response
- No formula errors
- Reliable and predictable

**Cons:**
- Manual process for updates
- Need to re-do when main data changes

**Recommendation:** Use Option 1 with the new SheetAPI, but switch to Option 2 after initial setup if you need maximum reliability.

## Enhanced SheetAPI Features

### 1. valueRenderOption = "FORMATTED_VALUE"
```javascript
// Automatically evaluates formulas and returns calculated values
// Not formula text or #ERROR
```

### 2. Retry Logic with Exponential Backoff
```javascript
// If first fetch fails (formula not ready), retries:
// Attempt 1: immediate
// Attempt 2: after 500ms
// Attempt 3: after 1000ms
// Allows time for formulas to calculate
```

### 3. Fallback to Main Sheet
```javascript
// If Menu-pt fails, automatically falls back to Menu-en
// Ensures users always see some data
// Logs which sheet was used
```

### 4. Result Caching
```javascript
// Caches successful fetches for 5 minutes
// Prevents repeated API calls for same data
// Reduces load on Google Sheets
```

### 5. Data Validation
```javascript
// Checks for:
// - Required fields (Category, Name)
// - Non-empty data rows
// - Correct structure
```

### 6. Debug Mode
```javascript
// Use SheetAPI.debugSheetTab('Menu-pt') to test any sheet
// Shows what was fetched and any errors
```

## How to Use the Enhanced API

### Basic Usage (No changes needed)
```javascript
// Automatically handles formula evaluation
const menuData = await SheetAPI.fetchMenuDataByLanguage('en');
```

### Manual Fetch with Options
```javascript
const data = await SheetAPI.fetchMenuData('Menu-pt', {
  valueRenderOption: "FORMATTED_VALUE",    // Evaluate formulas
  dateTimeRenderOption: "FORMATTED_STRING", // Format dates
  maxRetries: 2,                            // Retry count
  fallbackToMainSheet: true                 // Fallback enabled
});
```

### Debug a Specific Sheet
```javascript
// Run in browser console
SheetAPI.debugSheetTab('Menu-pt');
```

### Clear Cache
```javascript
SheetAPI.clearCache();
```

## Troubleshooting

### Issue 1: "No data in sheet" Error
**Causes:**
- Sheet tab name is incorrect
- Formulas are returning #ERROR
- Sheet is empty

**Solutions:**
1. Verify exact sheet tab name (case-sensitive)
2. Check in Google Sheets if formulas have green checkmarks (no errors)
3. Click a formula cell and check if it evaluates correctly
4. Run: `SheetAPI.debugSheetTab('Menu-pt')`
5. Look at browser console for detailed error message

### Issue 2: Formulas Not Evaluating
**Causes:**
- Too many formulas in sheet
- Google Sheets hasn't finished calculating
- GOOGLETRANSLATE service is slow

**Solutions:**
1. Wait 30-60 seconds after opening sheet (let Sheets calculate)
2. Click a formula cell and press Enter to force update
3. Switch to Option 2 (copy/paste values)
4. Add retry count in config: `maxRetries: 5`

### Issue 3: Empty Results on First Load
**Causes:**
- Formulas are still calculating
- Slow internet connection
- API rate limiting

**Solutions:**
1. Already handled! Retry logic will wait
2. Check browser Network tab for API delays
3. Clear cache and try again: `SheetAPI.clearCache()`
4. Increase maxRetries in config

### Issue 4: Timeout Error
**Causes:**
- Formulas are very complex
- Slow connection
- Too many sheets

**Solutions:**
1. Simplify GOOGLETRANSLATE formulas
2. Switch to Option 2 (copy/paste values)
3. Increase timeout (currently 10 seconds):
   ```javascript
   // In sheet-api.js, change: setTimeout(..., 10000)
   ```

## Step-by-Step Setup for Formula-Based Sheets

### 1. Create Main Sheet (Menu-en)
```
Headers (Row 1):
A1: Category
B1: Name
C1: Price (MT)
D1: Description
E1: Image

Data (From Row 2):
A2: Appetizers
B2: Spring Rolls
C2: 150 MT
D2: Crispy spring rolls
E2: [image URL]
```

### 2. Create Translated Sheet (Menu-pt)
```
Row 1 (Headers - copy from Menu-en):
A1: =Menu-en!A1
B1: =Menu-en!B1
C1: =Menu-en!C1
D1: =Menu-en!D1
E1: =Menu-en!E1

Row 2+ (Translations):
A2: =GOOGLETRANSLATE(Menu-en!A2,"en","pt")
B2: =GOOGLETRANSLATE(Menu-en!B2,"en","pt")
C2: =Menu-en!C2  // Price stays same
D2: =GOOGLETRANSLATE(Menu-en!D2,"en","pt")
E2: =Menu-en!E2  // Image stays same

Copy formulas down for all data rows
```

### 3. Wait for Evaluation
- Open Google Sheets
- Wait 30-60 seconds
- Check if all cells show values (not formulas)
- Check if no red error indicators visible

### 4. Test with API
```javascript
// In browser console:
SheetAPI.debugSheetTab('Menu-pt');
```

### 5. If Still Not Working
- Switch to **Option 2: Copy/Paste Values**
- Formulas auto-calculated, paste as values, delete formulas
- Much more reliable

## Language Mapping

The system expects these exact sheet tab names:

```javascript
LanguageManager.getSheetTab(lang)

pt → Menu-pt  (Portuguese - if not found)
en → Menu-en  (English - main source)
gu → Menu-gu  (Gujarati)
zh → Menu-zh  (Chinese)
```

**Create all translated sheet tabs with exactly these names!**

## Browser Console Debugging

Open browser console (`F12`) and run:

```javascript
// Test Portuguese sheet
SheetAPI.debugSheetTab('Menu-pt');

// Test all languages
['en', 'pt', 'gu', 'zh'].forEach(lang => {
  SheetAPI.debugSheetTab(LanguageManager.getSheetTab(lang));
});

// See what's cached
console.log("Cache contents:", SheetAPI._cache || {});

// Clear everything
SheetAPI.clearCache();
```

## Performance Tips

1. **First Load:** Will be slower (fetching and evaluating)
2. **Subsequent Loads:** Much faster (uses 5-minute cache)
3. **Clear Cache:** `SheetAPI.clearCache()` if data changes
4. **Reduce Formulas:** Fewer GOOGLETRANSLATE calls = faster
5. **Copy/Paste Values:** If using Option 2, no formula overhead

## API Rate Limiting

Google Sheets API limits:
- 500 requests per 100 seconds per project
- Usually not an issue for single website
- Caching helps reduce requests

If you hit limits:
1. Increase cache duration (currently 5 minutes)
2. Batch requests together
3. Use Copy/Paste values instead of formulas

## Summary

| Aspect | Solution |
|--------|----------|
| Formula Evaluation | `valueRenderOption=FORMATTED_VALUE` |
| Slow Formulas | Retry logic with backoff |
| Failed Sheets | Fallback to main sheet |
| Empty Caches | 5-minute auto-expiry |
| Debugging | `SheetAPI.debugSheetTab()` |
| Errors | Detailed console logging |

Your updated SheetAPI handles all these cases automatically! 🎉
