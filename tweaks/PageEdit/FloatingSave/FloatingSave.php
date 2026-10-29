<?php

namespace AdminTweaks;

/**
 * Based on FloatingPageSave by Daniel Zilli
 */
class FloatingSave extends Tweak
{

    public function info(): array
    {
        return [
            'description' => 'Keep the page editor\'s header Save button in view while scrolling',
            'author' => 'Daniel Zilli',
            'authorUrl' => 'https://github.com/dlzi/FloatingPageSave',
        ];
    }

    public function ready(): void
    {
        $this->addHookBefore('ProcessPageEdit::execute', $this, 'addFloatingSave');
    }

    public function addFloatingSave($event)
    {
        if ($this->wire()->config->ajax || $this->wire()->input->get('modal')) {
            return;
        }

        $this->loadCSS();
        $this->loadJS();
    }

}
