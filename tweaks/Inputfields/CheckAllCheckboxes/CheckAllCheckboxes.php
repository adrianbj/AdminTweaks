<?php

namespace AdminTweaks;

/**
 * Originally from AdminOnSteroids by RolandToth (tpr)
 */
class CheckAllCheckboxes extends Tweak
{
    public function info(): array
    {
        return [
            'description' => 'Add checkbox to check all checkboxes in a field',
            'author' => 'Roland Toth',
            'authorUrl' => 'https://processwire.com/talk/profile/3156--',
        ];
    }

    public function ready(): void
    {
        $this->loadJS();
        $this->loadCSS();
    }
}
