# Changelog

## 1.0.0

First release, from RockAdminTweaks 1.13.1 with 13 of its 21 tweaks.

- Only enabled tweaks are loaded, without scanning the tweak folders on every admin request.
- A tweak that fails to load or throws an error is skipped and logged, instead of breaking the admin, and `$config->adminTweaksDisabled` turns every tweak off.
- Settings are grouped by folder, and saved by ProcessWire's own settings form.
- Installing enables every bundled tweak.
- No form for creating site tweaks.
- Two tweaks with the same name are refused instead of being a fatal error.
- `AdminTweaks::assetUrl()` is hookable.
- Installing copies the enabled tweaks from RockAdminTweaks, and site tweaks written for it keep working.
- ColumnBreak and EditFieldLinks: repeater pages, checkbox fields, and repeater fields are recognized again.
- AsmSearchBox: no more errors after choosing or removing an item.
- PrevNextPage and PageListSelectUnselectRestore: page titles are escaped.
- BypassTrash: the Delete action checks that the page can be deleted.
- Plain JavaScript, with no bundled libraries:
  - AsmSearchBox has its own search box in place of select2.
  - ColumnBreak has its own draggable divider in place of Split.js, and keeps the saved sizes.
  - PageListSelectUnselectRestore sets the restored title as text, not HTML.
  - CopyFieldNames uses the Clipboard API.
