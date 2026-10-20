<?php

namespace AdminTweaks;

use ProcessWire\HookEvent;
use ProcessWire\Paths;
use ProcessWire\Wire;
use ProcessWire\WireData;

use function ProcessWire\wire;

/**
 * One tweak: a class named after its file, in tweaks/<Folder>/<Name>/<Name>.php or
 * site/templates/AdminTweaks/<Folder>/<Name>/<Name>.php, enabled on its own.
 *
 * init() runs in AdminTweaks::init() and ready() in AdminTweaks::ready(), only while the
 * tweak is enabled. loadCSS() and loadJS() add the tweak's own <Name>.css and <Name>.js.
 */
abstract class Tweak extends Wire
{
  /**
   * Path to the tweak's php file
   * @var string
   */
  public $file;

  /**
   * Id for use in DOM markup
   * @var string
   */
  public $id;

  /**
   * The info() array as WireData
   * @var WireData
   */
  public $info;

  /**
   * Tweak key (Folder:Name)
   * @var string
   */
  public $key;

  /**
   * Tweak name
   * @var string
   */
  public $name;

  /**
   * Whether addAssets() has run in this request
   * @var bool
   */
  private $assetsAdded = false;

  public function __construct($key)
  {
    $this->info = new WireData();
    $this->info->setArray($this->info());
    $this->key = $key;
    $this->id = wire()->sanitizer->pageNameUTF8($key);
  }

  /**
   * description, and optionally help (markdown), author, authorUrl, maintainer,
   * maintainerUrl and infoLink
   */
  public function info(): array
  {
    return [];
  }

  /**
   * Runs once when the tweak is turned on: in the module's settings, or on install. For setup the
   * tweak needs, such as a field it adds, so that ready() doesn't have to check for it.
   */
  public function enable(): void
  {
  }

  public function init(): void
  {
  }

  public function ready(): void
  {
  }

  public function loadCSS(): void
  {
    wire()->config->styles->add($this->pathToUrl(substr($this->file, 0, -3) . 'css', true));
  }

  public function loadJS(): void
  {
    wire()->config->scripts->add($this->pathToUrl(substr($this->file, 0, -3) . 'js', true));
  }

  /**
   * Load the tweak's CSS and JS from a hook on the markup that uses them, so that admin pages
   * without that markup don't load them. In an ajax request, such as a repeater item loading,
   * the page's head has already been sent, so the tags go at the start of the markup instead.
   * The tweak's JS must then be safe to run twice.
   */
  public function addAssets(HookEvent $event, bool $css = true, bool $js = true): void
  {
    if ($this->assetsAdded) return;
    $this->assetsAdded = true;
    if (!wire()->config->ajax) {
      if ($css) $this->loadCSS();
      if ($js) $this->loadJS();
      return;
    }
    $base = substr($this->file, 0, -3);
    $tags = '';
    if ($css) $tags .= "<link rel='stylesheet' href='" . $this->pathToUrl($base . 'css', true) . "'>";
    if ($js) $tags .= "<script src='" . $this->pathToUrl($base . 'js', true) . "'></script>";
    $event->return = $tags . $event->return;
  }

  /**
   * URL of a file under the site root, versioned by AdminTweaks::assetUrl() when $nocache is true
   */
  public function pathToUrl($path, $nocache = false): string
  {
    if ($nocache) return wire()->modules->get('AdminTweaks')->assetUrl($path);
    $config = wire()->config;
    return str_replace($config->paths->root, $config->urls->root, Paths::normalizeSeparators($path));
  }

  public function __debugInfo()
  {
    return [
      'name' => $this->name,
      'key' => $this->key,
      'id' => $this->id,
      'file' => $this->file,
    ];
  }
}
