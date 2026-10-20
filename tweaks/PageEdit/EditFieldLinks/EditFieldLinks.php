<?php

namespace AdminTweaks;

use ProcessWire\InputfieldCheckbox;
use ProcessWire\InputfieldRepeater;

/**
 * Originally from AdminOnSteroids by RolandToth (tpr)
 */
class EditFieldLinks extends Tweak
{

    public function info(): array
    {
        return [
            'description' => 'Field edit links in PageEdit (on hover)',
            'author' => 'Roland Toth',
            'authorUrl' => 'https://processwire.com/talk/profile/3156--',
        ];
    }

    public function ready(): void
    {

        if ($this->wire('user')->isSuperuser()) {

            // editing a page, user, role or permission
            $editing = in_array((string) $this->wire('page')->process, ['ProcessPageEdit', 'ProcessUser', 'ProcessRole', 'ProcessPermission'])
                && $this->wire('input')->get->id;

            if ($editing) {

                $this->addHookAfter('Inputfield::render', $this, 'addFieldEditLinks');
                $this->addHookAfter('Inputfield::renderValue', $this, 'addFieldEditLinks');

                $this->loadJS();
                $this->loadCSS();

            }
        }

    }

    public function addFieldEditLinks($event)
    {
        $inputfield = $event->object;

        if ($inputfield->type === 'hidden') {
            return;
        }

        $markup = $event->return;

        if (strpos($markup, 'data-editurl')) {
            return;
        }

        if ($field = $inputfield->hasField) {

            if (!is_object($field)) {
                return;
            }

            if ($field->flags && $field->hasFlag(\ProcessWire\Field::flagSystem) && $field->name !== 'title') {
                return;
            }


            // add class to wrapper to be able to use :hover even if label is unavailable (eg. checkbox field)
            $inputfield->wrapAttr('class', $inputfield->wrapAttr('class') . ' aos_hasTooltip');

            $editFieldUrl = $this->wire('config')->urls->admin . 'setup/field/edit?id=' . $field->id;

            $editFieldTooltip = '<em class="aos_EditField" data-for-field="' . $field->id . '">' . $field->name . '<i class="fa fa-pencil"></i></em>';

            // need to allow HTML in label
            $inputfield->entityEncodeLabel = false;
            $inputfield->label = '<span class="title">' . $editFieldTooltip . $inputfield->label . '</span>';

            // add tooltip if there's no label (checkbox)
            if ($inputfield instanceof InputfieldCheckbox) {
                $markup = str_replace('</label>', $editFieldTooltip . '</label>', $markup);
            }

            // use hidden link to be able to use modal/panel
            // note: link is not added to the label tag because it won't be clickable

            $link = '';

            // for multi-select page reference fields $link was added twice (#96)
            // for repeaters $markup contains all included fields' $links (#101)
            if (strpos($markup, 'aos_EditFieldLink') === false || $inputfield instanceof InputfieldRepeater) {
                $link = '<a href="' . $editFieldUrl . '" class="aos_EditFieldLink" data-field-id="' . $field->id . '" target="_blank" style="display: none !important;">Edit</a>';
            }

            $event->return = $markup . $link;

        }
    }

}
