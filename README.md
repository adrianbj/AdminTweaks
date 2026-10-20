# AdminTweaks

Small tweaks for the ProcessWire admin, each enabled on its own in the module's settings, where they're grouped by folder.

Installing enables every bundled tweak; turn off the ones you don't want. ColumnBreak creates an `aos_column_break` field the first time it runs, and NonSuperuserTrash gives users who aren't superusers a Trash action.

Based on [RockAdminTweaks](https://github.com/baumrock/RockAdminTweaks) by Bernhard Baumrock, which built on AdminOnSteroids by Roland Toth. Most of the tweaks here come from AdminOnSteroids, and each one credits its author in its settings.

## Tweaks

| Tweak | What it does |
|---|---|
| General › BypassTrash | Delete buttons in the page list and on the page edit Delete tab that skip the trash, for superusers |
| Inputfields › AsmSearchBox | A search box in AsmSelect dropdowns |
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

`loadCSS()` and `loadJS()` add a `?v=` version to the URL. To version it another way, for example in the filename for a CDN that ignores query strings, hook after `AdminTweaks::assetUrl`.

## A tweak that breaks the admin

A tweak that throws an error is skipped and logged in the `admin-tweaks` log, and superusers see the error. If the admin still won't load, add `$config->adminTweaksDisabled = true;` to `site/config.php` to run no tweaks at all.

## Switching from RockAdminTweaks

1. Install AdminTweaks. It copies the tweaks enabled in RockAdminTweaks, instead of enabling every tweak, and runs none of them while RockAdminTweaks is installed.
2. Uninstall RockAdminTweaks.

Site tweaks in `site/templates/RockAdminTweaks/` keep working as they are. To move one, put it in `site/templates/AdminTweaks/` and change its namespace from `RockAdminTweaks` to `AdminTweaks`.

Tweaks from RockAdminTweaks that aren't included here are left out of the copied settings when the module's settings are next saved.

## jQuery

The tweaks don't rely on jQuery Migrate, and avoid the functions jQuery 4 removes. With jQuery 3.7.1 and Migrate's logging on, they log no deprecation warnings. The bundled select2 4.0.6-rc.1 is patched to use native functions in place of `$.trim`, `$.isArray`, `$.isFunction`, and `$.camelCase` (`select2-v4.0.6-jquery4.patch`).
