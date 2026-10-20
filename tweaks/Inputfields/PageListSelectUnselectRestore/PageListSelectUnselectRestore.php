<?php

namespace AdminTweaks;

/**
 * Originally from AdminOnSteroids by RolandToth (tpr)
 */
class PageListSelectUnselectRestore extends Tweak
{

    public function info(): array
    {
        return [
            'description' => 'Add unselect/restore buttons to PageListSelect',
            'author' => 'Roland Toth',
            'authorUrl' => 'https://processwire.com/talk/profile/3156--',
        ];
    }

    public function ready(): void
    {
        $this->addHookAfter('InputfieldPageListSelect::render', $this, 'addPageListUnselectButtons');
    }

    public function addPageListUnselectButtons($event)
    {
        $field = $event->object;

        $original = $field->value ? $this->pages->get($field->value) : null;
        $originalTitle = $original && $original->id ? $this->wire('sanitizer')->entities($original->title) : '';

        $restoreTitleTag = $originalTitle && strlen($originalTitle) ? 'title="' . \ProcessWire\__('Restore', __FILE__) . ' &quot;' . $originalTitle . '&quot;"' : '';

        $clearButton = '<button class="aos_pagelist_unselect clear ui-button ' . ($field->value ? '' : 'empty') . '" title="' . \ProcessWire\__('Clear', __FILE__) . '"><i class="fa fa-times-circle"></i></button>';

        $restoreButton = $field->value ? '<button class="aos_pagelist_unselect restore ui-button initial" ' . $restoreTitleTag . ' data-title-original="' . $originalTitle . '" data-value-original="' . $field->value . '" ><i class="fa fa-undo"></i></button>' : '';

        $event->return = $restoreButton . $clearButton . $event->return;
        $this->addAssets($event);
    }
}
