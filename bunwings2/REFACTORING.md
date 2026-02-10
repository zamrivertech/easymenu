# Zayka Restaurant - Code Refactoring Documentation

## Overview
This document describes the refactoring of the Zayka restaurant website to improve code organization, maintainability, and reusability through modularization of CSS and JavaScript files.

## Changes Made

### 1. CSS Reorganization
The original `style.css` (491 lines) has been split into modular, focused files:

#### New CSS Files:
- **`css/common.css`** - Shared styles used across all pages
  - CSS variables and root configuration
  - Base HTML elements styling
  - Navigation styles
  - Common buttons and components
  - Contact button styles

- **`css/index.css`** - Index/Home page specific styles
  - Hero text and animations
  - Card layouts for the about section
  - Map wrapper and overlays
  - Section-specific styling

- **`css/menu.css`** - Menu page specific styles
  - Menu layout and cards
  - Category images and animations
  - Navigation pills (menu categories)
  - Plate/dish item styling

- **`css/modal.css`** - Modal component styles
  - Contact modal styling
  - Image modal styling
  - Language selector buttons
  - Modal animations and transitions

- **`css/animations.css`** - Reusable animation definitions
  - Keyframe animations for common effects
  - Utilities for different animation types

#### Benefits:
- Easier to maintain and update specific page styles
- Reduced CSS file sizes for faster loading
- Clear separation of concerns
- Reusable animation definitions

### 2. JavaScript Modularization
The original implementation with scattered scripts has been organized into modular files:

#### New JavaScript Files:

- **`js/common.js`** - Shared utilities
  - `slugify()` - Converts text to URL-safe IDs
  - `getCurrentLanguage()` - Gets current language from localStorage
  - `setStoredLanguage()` - Updates language in localStorage
  - `log()` - Utility logging function

- **`js/language.js`** - Language management system
  - `LanguageManager` object with methods:
    - `t(key, lang)` - Get translation by key
    - `getCurrentLang()` - Get current language
    - `setLanguage(lang)` - Set language and dispatch event
    - `getSheetTab(lang)` - Get Google Sheet tab name for language
    - `init()` - Initialize language switcher
  - Translations for: Portuguese (pt), English (en), Gujarati (gu), Chinese (zh)
  - Automatic initialization on page load

- **`js/sheet-api.js`** - Google Sheets API integration
  - `SheetAPI` object with methods:
    - `fetchMenuData(sheetTab)` - Fetch data from specific sheet tab
    - `fetchMenuDataByLanguage(lang)` - Fetch data using language selection
  - Error handling and caching control
  - Dynamic sheet tab selection based on language

- **`js/menu-renderer.js`** - Menu rendering logic
  - `MenuRenderer` object with methods:
    - `renderDigitalMenu(lang)` - Render full menu with categories and items
    - `onLanguageChange(event)` - Handle language changes and re-render
  - GSAP animation integration
  - Responsive to language changes via event listener

- **`js/modals.js`** - Modal management
  - `ModalManager` object with methods:
    - `initContactModal()` - Initialize contact modal with language support
    - `initImageModal()` - Initialize image zoom modal
    - `initMapToggle()` - Initialize map preview toggle
  - Handles close buttons, backdrop clicks, and escape key
  - Mobile swipe-to-close functionality
  - Language text updates when language changes

#### Benefits:
- Each file has single responsibility
- Easy to locate and modify specific functionality
- Reusable modules across pages
- Event-driven architecture for language changes
- Automatic re-initialization of components

### 3. HTML Updates

#### index.html Changes:
- Removed inline `<style>` block (moved to modular CSS)
- Updated `<link>` tags to import modular CSS files:
  ```html
  <link rel="stylesheet" href="./css/common.css">
  <link rel="stylesheet" href="./css/index.css">
  <link rel="stylesheet" href="./css/modal.css">
  <link rel="stylesheet" href="./css/animations.css">
  ```
- Replaced inline `<script>` blocks with modular JS imports:
  ```html
  <script src="./js/common.js"></script>
  <script src="./js/language.js"></script>
  <script src="./js/sheet-api.js"></script>
  <script src="./js/modals.js"></script>
  ```
- Updated contact modal close button ID to `closeContactModal` (avoid conflicts)

#### menu.html Changes:
- Removed inline `<style>` block (moved to modular CSS)
- Updated `<link>` tags to import modular CSS files
- **Added contact button** (`<button class="contact-btn btn-neon" id="openModal">💬</button>`)
- **Added contact modal** with language selector
- Updated `<script>` imports to use modular files:
  ```html
  <script src="./js/common.js"></script>
  <script src="./js/language.js"></script>
  <script src="./js/sheet-api.js"></script>
  <script src="./js/menu-renderer.js"></script>
  <script src="./js/modals.js"></script>
  ```
- Removed call to old `menu.js`

### 4. Language & Sheet Tab System

#### How Language Changes Affect Sheet Tabs:
1. User clicks language button (e.g., English)
2. `LanguageManager.setLanguage('en')` is called
3. localStorage is updated with new language
4. `languageChanged` event is dispatched across all pages
5. `MenuRenderer` listens for this event
6. `MenuRenderer.onLanguageChange()` triggers `renderDigitalMenu('en')`
7. `SheetAPI.fetchMenuDataByLanguage('en')` gets the sheet tab name via `LanguageManager.getSheetTab('en')`
8. Returns `'Menu-en'` sheet tab
9. Menu is fetched from `'Menu-en'` sheet and re-rendered

#### Sheet Tab Structure (User's Google Sheet):
- **Menu** - Portuguese data (default)
- **Menu-en** - English translation
- **Menu-gu** - Gujarati translation
- **Menu-zh** - Chinese translation

**Note:** Column names remain consistent across sheets (Category, Name, Price (MT), Description, Image)

### 5. Contact Button Integration
- Contact button now appears on both **index.html** and **menu.html**
- Opens modal with:
  - Contact/Call button
  - Language selector
  - All text updates based on current language selection
- Styled with neon glow effect (`btn-neon` class)
- Fixed positioning at bottom-left

### 6. Legacy Code
The original files have been backed up in `_legacy/` folder:
- `lang.js.bak` - Original language implementation
- `menu.js.bak` - Original menu renderer
- `style.css.bak` - Original combined stylesheet

These files are kept for reference but are no longer used.

## Migration Guide

### For Developers:
1. **Add new translations**: Edit `js/language.js` translations object
2. **Add new sheet tab**: Add language code to `getSheetTab()` mapping
3. **Modify styles**: Update appropriate file in `css/` folder
4. **Add new functionality**: Create new module in `js/` folder

### For Content Updates:
1. Update menu items in Google Sheet
2. Add new sheet tabs for new languages (follow naming convention: `Menu-{lang-code}`)
3. Use consistent column names across all sheets
4. Language selector will automatically pull data from correct sheet

## File Structure
```
zayka/
├── index.html
├── menu.html
├── css/
│   ├── common.css
│   ├── index.css
│   ├── menu.css
│   ├── modal.css
│   └── animations.css
├── js/
│   ├── common.js
│   ├── language.js
│   ├── sheet-api.js
│   ├── menu-renderer.js
│   └── modals.js
├── img/
│   └── (images)
├── _legacy/
│   ├── lang.js.bak
│   ├── menu.js.bak
│   └── style.css.bak
├── menu.js (kept for backward compatibility)
├── lang.js (deprecated - use js/language.js)
├── style.css (deprecated - use css/* files)
└── REFACTORING.md
```

## Performance Improvements
- Modular CSS loads only necessary styles per page
- JavaScript modules are lazy-loaded
- Event-driven architecture reduces polling
- Efficient DOM queries within modular functions

## Browser Compatibility
- All modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox for layout
- ES6 JavaScript features
- CSS custom properties (variables)

## Future Enhancements
1. Service Worker for offline menu caching
2. PWA manifest for installable app
3. Multi-language SEO optimization
4. Admin panel for content management
5. Analytics integration
