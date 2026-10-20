<?php

namespace AdminTweaks;

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
