# AdminTweaks

Small tweaks for the ProcessWire admin, each enabled on its own in the module's settings, where they're grouped by folder.

Installing enables every bundled tweak; turn off the ones you don't want. ColumnBreak creates an `aos_column_break` field the first time it runs, and NonSuperuserTrash gives users who aren't superusers a Trash action.

Based on [RockAdminTweaks](https://github.com/baumrock/RockAdminTweaks) by Bernhard Baumrock, which built on AdminOnSteroids by Roland Toth. Most of the tweaks here come from AdminOnSteroids, and each one credits its author in its settings.

## Tweaks

| Tweak | What it does |
|---|---|
| General › BypassTrash | Delete buttons in the page list and on the page edit Delete tab that skip the trash, for superusers |
| Inputfields › AsmSearchBox | A search box in place of AsmSelect's add dropdown |
| Inputfields › CheckAllCheckboxes | A button to check or uncheck every checkbox in a field |
| Inputfields › ColumnBreak | An `aos_column_break` field that splits the page editor into two resizable columns |
| Inputfields › CopyFieldNames | Shift-click a field's label to copy its name, for superusers |
| Inputfields › ImageDownload | A download button on images |
| Inputfields › PageListSelectUnselectRestore | Clear and restore buttons on single page selects |
| Modules › CollapseInfo | Collapses a module's info section |
| Modules › UpgradesRefresh | Upgrades links check for new versions every time |
| PageEdit › EditFieldLinks | A link to edit each field, shown on hover, for superusers |
| PageEdit › PrevNextPage | Links to edit the previous and next sibling |
| PageList › NonSuperuserTrash | A Trash action in the page list for users who aren't superusers |
| PageList › TemplateLink | The template's name, linked to its settings, in the page list actions, for superusers |

## Site tweaks

A site can add its own tweaks in `site/templates/AdminTweaks/<Folder>/<Name>/<Name>.php`. A site tweak with the same folder and name as a bundled tweak replaces it.

```php
<?php

namespace AdminTweaks;

class Name extends Tweak
{
  public function info(): array
  {
    return ['description' => 'What the tweak does'];
  }

  public function ready(): void
  {
    $this->loadCSS(); // Name.css next to Name.php
    $this->loadJS(); // Name.js next to Name.php
  }
}
```

`loadCSS()` and `loadJS()` version the file's URL, as described below. To version it some other way, hook after `AdminTweaks::assetUrl`.

## Versioned CSS and JS

Every tweak's CSS and JS URL carries a version, so browsers fetch a file again after it changes. By default that is a `?v=` query string. A CDN that ignores query strings (CloudFront, by default) keeps serving the old file, so the module's settings can put the file's modification time in its name instead: `ColumnBreak.1792537113.js`. That needs this rule in the site's `.htaccess`, before ProcessWire's own rewrite rules, or every tweak's CSS and JS returns 404:

```
RewriteRule ^(.+)\.(\d{10,})\.(js|css)$ $1.$3 [L]
```

## A tweak that breaks the admin

A tweak that throws an error is skipped and logged in the `admin-tweaks` log, and superusers see the error. If the admin still won't load, add `$config->adminTweaksDisabled = true;` to `site/config.php` to run no tweaks at all.

## Switching from RockAdminTweaks

1. Install AdminTweaks. It copies the tweaks enabled in RockAdminTweaks, instead of enabling every tweak, and runs none of them while RockAdminTweaks is installed.
2. Uninstall RockAdminTweaks.

Site tweaks in `site/templates/RockAdminTweaks/` keep working as they are. To move one, put it in `site/templates/AdminTweaks/` and change its namespace from `RockAdminTweaks` to `AdminTweaks`.

Tweaks from RockAdminTweaks that aren't included here are left out of the copied settings when the module's settings are next saved.

## JavaScript

The tweaks are plain JavaScript with no bundled libraries. They use jQuery only to listen for two events that ProcessWire triggers through jQuery, which native listeners can't receive: `pageSelected` (PageListSelectUnselectRestore) and `wiretabclick` (ColumnBreak, for columns in tabs).
