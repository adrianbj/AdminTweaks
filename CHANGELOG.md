# Changelog

## 1.0.0

First release, from RockAdminTweaks 1.13.1 with 13 of its 21 tweaks.

- Only enabled tweaks are loaded, without scanning the tweak folders on every admin request.
- A tweak that fails to load or throws an error is skipped and logged, instead of breaking the admin, and `$config->adminTweaksDisabled` turns every tweak off.
- Enabled tweaks are saved by ProcessWire's own settings form.
- No form for creating site tweaks.
- Two tweaks with the same name are refused instead of being a fatal error.
- `AdminTweaks::assetUrl()` is hookable.
- Installing copies the enabled tweaks from RockAdminTweaks, and site tweaks written for it keep working.
- ColumnBreak and EditFieldLinks: repeater pages, checkbox fields, and repeater fields are recognized again.
- AsmSearchBox: no more errors after choosing or removing an item.
- PrevNextPage and PageListSelectUnselectRestore: page titles are escaped.
- BypassTrash: the Delete action checks that the page can be deleted.
- Works without jQuery Migrate, and avoids the functions jQuery 4 removes.
