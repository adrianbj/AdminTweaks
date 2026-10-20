# Changelog

## 1.2.1

- `Tweak::enable()` runs once when a tweak is turned on, in the settings or on install. ColumnBreak creates its `aos_column_break` field there, instead of on whichever admin request came first after the tweak was turned on.

## 1.2.0

- AsmSearchBox, CheckAllCheckboxes, ColumnBreak, and PageListSelectUnselectRestore load their CSS and JS only on admin pages with the fields they change, instead of on every admin page. `Tweak::addAssets()` loads a tweak's files from a render hook; in an ajax request, such as a repeater item loading, it puts the tags in the markup.
- BypassTrash, ColumnBreak, EditFieldLinks, and PrevNextPage no longer load the page named by `?id=` on every admin request; they use the page being edited, only when one is.
- NonSuperuserTrash: the Trash action asks for confirmation, as BypassTrash's Delete does. It had none, because the confirmation script only loaded for superusers.

## 1.1.2

- ColumnBreak's divider line, CheckAllCheckboxes' button, and AsmSearchBox's highlighted result use the admin theme's main color (`--pw-main-color`) instead of a fixed green; the highlighted result is a tint of it, so its text stays readable.

## 1.1.1

- ColumnBreak: the columns meet edge to edge, like ProcessWire's own side-by-side fields, with no gap and no offset at the top. The divider is a grab area over the shared border, which shows a thin line on hover and while dragging.

## 1.1.0

- A setting puts each CSS and JS file's modification time in its name (`Name.1792537113.js`) instead of `?v=`, for CDNs that ignore query strings. It needs a rewrite rule in `.htaccess`, given in the setting and the README.

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
