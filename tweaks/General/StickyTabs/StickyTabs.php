<?php

namespace AdminTweaks;

class StickyTabs extends Tweak
{

    public function info(): array
    {
        return [
            'description' => 'Keep tab bars (page edit, templates, fields) pinned below the masthead while scrolling, each tab with its own scroll position',
        ];
    }

    public function ready(): void
    {
        $this->addHookBefore('ProcessController::execute', $this, 'addStickyTabs');
    }

    public function addStickyTabs($event)
    {
        if ($this->wire()->config->ajax) {
            return;
        }

        $this->loadCSS();
        $this->loadJS();
    }

}
