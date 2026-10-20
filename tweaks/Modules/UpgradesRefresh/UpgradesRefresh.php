<?php

namespace AdminTweaks;

/**
 * Thanks to Robin Sallis (@Toutouwai)
 */
class UpgradesRefresh extends Tweak
{
  public function info(): array
  {
    return [
      'description' => 'Always refresh when visiting ProcessWireUpgrades',
    ];
  }

  public function ready(): void
  {
    $this->loadJS();
  }
}
