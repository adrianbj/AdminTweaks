<?php

namespace ProcessWire;

use AdminTweaks\Tweak;

/**
 * Small tweaks for the ProcessWire admin, each enabled on its own.
 *
 * Based on RockAdminTweaks by Bernhard Baumrock, which built on AdminOnSteroids by Roland Toth.
 *
 * @license MIT
 */
class AdminTweaks extends WireData implements Module, ConfigurableModule
{
  /**
   * The module this one replaces: its enabled tweaks are imported on install, and its site
   * tweaks (site/templates/RockAdminTweaks/, namespace RockAdminTweaks) keep loading.
   */
  const legacyModule = 'RockAdminTweaks';

  /**
   * Enabled tweaks, keyed Folder:Name
   * @var Tweak[]
   */
  protected $tweaks = [];

  /**
   * Tweak class names already declared, with the file each came from
   * @var string[]
   */
  protected $declared = [];

  public static function getModuleInfo()
  {
    return [
      'title' => 'Admin Tweaks',
      'summary' => 'Small tweaks for the ProcessWire admin, each enabled on its own.',
      'version' => '1.0.0',
      'author' => 'Adrian Jones',
      'autoload' => 'template=admin',
      'singular' => true,
      'icon' => 'magic',
      'requires' => 'PHP>=8.1',
    ];
  }

  public function __construct()
  {
    parent::__construct();
    $this->set('enabledTweaks', []);
  }

  public function init()
  {
    $this->wire()->classLoader->addNamespace('AdminTweaks', __DIR__ . '/classes/');

    // With RockAdminTweaks still installed, both modules would run the same tweaks.
    if ($this->wire()->modules->isInstalled(self::legacyModule)) {
      if ($this->wire()->user->isSuperuser()) {
        $this->warning($this->_('AdminTweaks runs no tweaks until RockAdminTweaks is uninstalled.'));
      }
      return;
    }

    class_alias(Tweak::class, 'RockAdminTweaks\Tweak');

    // An escape hatch for a tweak that breaks the admin: $config->adminTweaksDisabled = true;
    if ($this->wire()->config->adminTweaksDisabled) return;

    foreach ($this->enabledTweaks as $key) {
      $tweak = $this->loadTweak((string) $key);
      if (!$tweak) continue;
      $this->tweaks[$key] = $tweak;
      $this->run($tweak, 'init');
    }
  }

  public function ready()
  {
    foreach ($this->tweaks as $tweak) $this->run($tweak, 'ready');
  }

  /**
   * URL of a tweak's asset file, with a cache-busting version
   *
   * Hook after this to version the URL some other way, e.g. in the filename for a CDN that
   * ignores query strings.
   */
  public function ___assetUrl(string $file): string
  {
    $config = $this->wire()->config;
    return $config->versionUrl(str_replace($config->paths->root, $config->urls->root, Paths::normalizeSeparators($file)));
  }

  /**
   * Directories holding tweaks, in the order a key is looked up: a site tweak wins over a
   * bundled tweak with the same key
   */
  public function tweakDirs(): array
  {
    $templates = $this->wire()->config->paths->templates;
    return [
      $templates . 'AdminTweaks/',
      $templates . self::legacyModule . '/',
      __DIR__ . '/tweaks/',
    ];
  }

  /**
   * The file of a tweak key (Folder:Name), or '' when there is none
   */
  public function tweakFile(string $key): string
  {
    if (!preg_match('/^(\w+):(\w+)$/', $key, $m)) return '';
    foreach ($this->tweakDirs() as $dir) {
      $file = "$dir$m[1]/$m[2]/$m[2].php";
      if (is_file($file)) return $file;
    }
    return '';
  }

  /**
   * Every available tweak, keyed Folder:Name, with its file
   */
  public function availableTweaks(): array
  {
    $tweaks = [];
    foreach ($this->tweakDirs() as $dir) {
      foreach (glob("$dir*/*/*.php") ?: [] as $file) {
        $name = basename($file, '.php');
        if ($name !== basename(dirname($file))) continue;
        $tweaks[basename(dirname($file, 2)) . ":$name"] ??= $file;
      }
    }
    ksort($tweaks);
    return $tweaks;
  }

  protected function loadTweak(string $key): ?Tweak
  {
    $file = $this->tweakFile($key);
    if (!$file) return null;
    $name = basename($file, '.php');

    // A second class of the same name is a fatal error that no catch can stop.
    if (isset($this->declared[$name]) && $this->declared[$name] !== $file) {
      $this->tweakError($key, "another tweak already uses the name $name ({$this->declared[$name]})");
      return null;
    }

    try {
      require_once $file;
      $this->declared[$name] = $file;
      $class = null;
      foreach (["AdminTweaks\\$name", self::legacyModule . "\\$name"] as $candidate) {
        if (class_exists($candidate, false) && is_subclass_of($candidate, Tweak::class)) $class = $candidate;
      }
      if (!$class) throw new WireException("$file declares no class $name extending AdminTweaks\\Tweak");
      $tweak = new $class($key);
      $tweak->file = $file;
      $tweak->name = $name;
      return $tweak;
    } catch (\Throwable $e) {
      $this->tweakError($key, $e->getMessage());
      return null;
    }
  }

  protected function run(Tweak $tweak, string $method): void
  {
    try {
      $tweak->$method();
    } catch (\Throwable $e) {
      $this->tweakError($tweak->key, $e->getMessage());
    }
  }

  protected function tweakError(string $key, string $message): void
  {
    $this->wire()->log->save('admin-tweaks', "$key: $message");
    if ($this->wire()->user->isSuperuser()) $this->error("$key: $message");
  }

  public function ___install()
  {
    $modules = $this->wire()->modules;
    if (!$modules->isInstalled(self::legacyModule)) return;
    $enabled = array_values((array) ($modules->getConfig(self::legacyModule, 'enabledTweaks') ?: []));
    $modules->saveConfig($this, 'enabledTweaks', $enabled);
    $this->message($this->_('Enabled tweaks copied from RockAdminTweaks:') . ' ' . count($enabled) . '. ' . $this->_('Uninstall RockAdminTweaks to start them.'));
  }

  public function getModuleConfigInputfields(InputfieldWrapper $inputfields)
  {
    $sanitizer = $this->wire()->sanitizer;

    /** @var InputfieldCheckboxes $f */
    $f = $this->wire()->modules->get('InputfieldCheckboxes');
    $f->attr('name', 'enabledTweaks');
    $f->label = $this->_('Tweaks');
    $f->icon = 'magic';
    $f->entityEncodeText = false;
    $f->notes = $this->_('Site tweaks go in') . ' ' . $this->wire()->config->urls->templates . 'AdminTweaks/' . ' ' . $this->_('as Folder/Name/Name.php, with a class Name extending AdminTweaks\Tweak in the namespace AdminTweaks.');

    foreach ($this->availableTweaks() as $key => $file) {
      [$folder, $name] = explode(':', $key);
      $tweak = $this->tweaks[$key] ?? $this->loadTweak($key);
      $label = "<strong>" . $sanitizer->entities("$folder › $name") . "</strong>";
      if ($tweak) {
        $info = $tweak->info;
        $label .= ' – ' . $sanitizer->entities((string) $info->description);
        $credits = [];
        foreach (['author', 'maintainer'] as $role) {
          if (!$info->$role) continue;
          $who = $sanitizer->entities($info->$role);
          $url = $info->get("{$role}Url");
          $credits[] = ucfirst($role) . ': ' . ($url ? "<a href='" . $sanitizer->entities($url) . "' target='_blank'>$who</a>" : $who);
        }
        if ($info->infoLink) $credits[] = "<a href='" . $sanitizer->entities($info->infoLink) . "' target='_blank'>" . $this->_('More info') . "</a>";
        if ($info->help) $label .= '<br><small>' . $sanitizer->entitiesMarkdown($info->help) . '</small>';
        if ($credits) $label .= '<br><small>' . implode(' · ', $credits) . '</small>';
      } else {
        $label .= ' – <span class="uk-text-danger">' . $this->_('fails to load, see the admin-tweaks log') . '</span>';
      }
      $f->addOption($key, $label);
    }

    $f->attr('value', array_values($this->enabledTweaks));
    $inputfields->add($f);

    if (is_dir($this->wire()->config->paths->templates . self::legacyModule)) {
      $inputfields->add([
        'type' => 'markup',
        'label' => $this->_('Site tweaks written for RockAdminTweaks'),
        'icon' => 'info-circle',
        'value' => '<p>' . $this->_('These still load from') . ' ' . $this->wire()->config->urls->templates . self::legacyModule . '/. ' . $this->_('To move one, put it in') . ' ' . $this->wire()->config->urls->templates . 'AdminTweaks/ ' . $this->_('and change its namespace to AdminTweaks.') . '</p>',
      ]);
    }

    return $inputfields;
  }
}
