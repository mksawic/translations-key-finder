# Translations Key Finder

## Overview

**Translations Key Finder** is a lightweight Visual Studio Code extension that helps developers working with i18n translation keys. It scans your files for translation keys such as:

```
'MISC.BUTTONS.CLOSE'
"LISTS.ACTIVE_USERS.TITLE"
```

and displays their corresponding values from a JSON translation file. This saves time by avoiding constant switching to translation files.

---

## Features

- 🔍 Detects translation keys in code (`'KEY.PATH'` or `"KEY.PATH"`).
- 📖 Works with **JSON structures**.
- ⚙️ Configurable translation file path.
- 🎨 Multiple display modes:

  - **Inline Ghost Text** → shows translations after keys.
  - **Hover Tooltip** → see translations on hover.
  - **CodeLens** → shows translations above the line as labels.

- 🔄 Auto-updates when files change.

---

## Configuration

In `.vscode/settings.json`:

```json
{
  "translationKeyFinder.translationFile": "src/app/translations/i18n/locale/en.json",
  "translationKeyFinder.displayMode": "codelens" // options: "after", "hover", "codelens"
}
```

---

## Example

### `en.json`

```json
{
  "MISC.BUTTONS.CLOSE": "Close", // flat structure
  "MISC": {
    "BUTTONS": {
      "UPDATE": "Update" // nested structure
    }
  }
}
```

### Source Code

```ts
const close = "MISC.BUTTONS.CLOSE";
```

### With Extension (CodeLens mode)

```
Close
const close = 'MISC.BUTTONS.CLOSE';
```

---

## License

MIT License. Free to use and modify.
