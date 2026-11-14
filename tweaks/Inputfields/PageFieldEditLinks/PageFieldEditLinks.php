<?php

namespace AdminTweaks;

use ProcessWire\HookEvent;
use ProcessWire\InputfieldPage;
use ProcessWire\Page;
use ProcessWire\PageArray;

/**
 * Based on the AdminPageFieldEditLinks and AdminModalception modules by Mike Spooner
 * (thetuningspoon) and macrura. It reads the same per-field settings, so fields set up for
 * AdminPageFieldEditLinks keep working, and it waits until that module is uninstalled.
 *
 * Everything happens in the page editor's own markup and JS: the tweak answers no requests.
 * A new page's id and title are read from the modal it was created in.
 */
class PageFieldEditLinks extends Tweak
{

    /** The module this replaces: while it is installed, it adds the links. */
    public const REPLACES = 'AdminPageFieldEditLinks';

    public function info(): array
    {
        return [
            'description' => 'Edit links on pages selected in a Page field, and a link to create a new page for it in a modal',
            'help' => 'Turned on per Page field, on the field\'s Input tab: "Enable view/edit links on selected pages?" and "Enable link to create new pages?".'
                . ' Replaces the AdminPageFieldEditLinks and AdminModalception modules, using the same field settings; it does nothing until AdminPageFieldEditLinks is uninstalled.',
            'author' => 'Mike Spooner, macrura',
            'authorUrl' => 'https://github.com/thetuningspoon/AdminPageFieldEditLinks',
        ];
    }

    public function ready(): void
    {
        if ($this->wire()->modules->isInstalled(self::REPLACES)) return;
        $this->addHooks();
    }

    public function addHooks(): void
    {
        $this->addHookAfter('InputfieldPage::getConfigInputfields', $this, 'configInputfields');
        $this->addHookBefore('InputfieldPage::renderAddable', $this, 'renderAddable');
        $this->addHookAfter('InputfieldPage::render', $this, 'markField');
        $this->addHookAfter('InputfieldPage::renderValue', $this, 'markValue');

        // On every admin page, as AdminModalception's were: a marked field can arrive later by
        // ajax (a repeater item), and a modal opened inside a modal needs the script in both.
        $this->wire()->modules->get('JqueryUI')->use('modal');
        $this->wire()->config->js('AdminTweaksPageFieldEditLinks', [
            'newLabel' => $this->_('New'),
            'editLabel' => $this->_('View'),
            'adminUrl' => $this->wire()->config->urls->admin,
        ]);
        $this->loadJS();
        $this->loadCSS();
    }

    /**
     * The field's settings: edit links, the New link, and the parent for new pages
     */
    public function configInputfields(HookEvent $event): void
    {
        /** @var InputfieldPage $inputfield */
        $inputfield = $event->object;
        // Outside a field (FormBuilder, for one) there is no page editor to add links to.
        if (!$inputfield->hasFieldtype) return;
        $modules = $this->wire()->modules;
        $inputfields = $event->return;

        if ($inputfield->newPageLink && ($addable = $inputfields->getChildByName('addable'))) {
            $addable->attr('checked', false);
            $addable->attr('disabled', true);
            $addable->notes = $this->_('Off while "Enable link to create new pages?" is on (AdminTweaks › PageFieldEditLinks): that link takes its place.');
        }

        $f = $modules->get('InputfieldCheckbox');
        $f->attr('name', 'editLinks');
        $f->attr('value', 1);
        $f->addClass('at-pfel-setting');
        $f->label = $this->_('Enable view/edit links on selected pages?');
        $f->description = $this->_('Pages selected in this field can be viewed and edited in a modal window.');
        if ($inputfield->editLinks) $f->attr('checked', 'checked');
        $inputfields->append($f);

        $f = $modules->get('InputfieldCheckbox');
        $f->attr('name', 'newPageLink');
        $f->attr('value', 1);
        $f->addClass('at-pfel-setting');
        $f->label = $this->_('Enable link to create new pages?');
        $f->description = $this->_('Adds a "New" link to the field, which creates a page in a modal window and adds it to the field.');
        $f->notes = $this->_('Unlike "Allow new pages to be created from field" above, the page is created straight away, without saving the page being edited, and can be edited in the modal.');
        if ($inputfield->newPageLink) $f->attr('checked', 'checked');
        $inputfields->append($f);

        $f = $modules->get('InputfieldPageListSelect');
        $f->attr('name', 'newPageParent');
        $f->attr('value', (int) $inputfield->newPageParent);
        $f->addClass('at-pfel-setting');
        $f->label = $this->_('Parent for new pages created');
        $f->description = $this->_('Optional: the parent for pages created with the "New" link.');
        $f->notes = $this->_('Left empty, "Parent of selectable page(s)" above is used. With only a template set, the new page goes wherever that template\'s family settings allow.');
        $f->required = false;
        $f->showIf = 'newPageLink=1';
        $inputfields->append($f);
    }

    /**
     * The New link takes the place of core's "create new" input
     */
    public function renderAddable(HookEvent $event): void
    {
        if (!$event->object->newPageLink) return;
        $event->replace = true;
        $event->return = '';
    }

    /**
     * Whether the current user may create a page where this field's New link would
     */
    public function canAddNew(InputfieldPage $inputfield): bool
    {
        $parentId = (int) ($inputfield->newPageParent ?: $inputfield->parent_id);
        if ($parentId) {
            $parent = $this->wire()->pages->get($parentId);
            return $parent->id && $parent->addable();
        }
        $template = $this->templateId($inputfield) ? $this->wire()->templates->get($this->templateId($inputfield)) : null;
        return $template && $this->wire()->user->hasPermission('page-add', $template);
    }

    /**
     * Mark the rendered field for the tweak's JS: classes on its outer element, and where a
     * new page would go
     */
    public function markField(HookEvent $event): void
    {
        /** @var InputfieldPage $inputfield */
        $inputfield = $event->object;
        $edit = (bool) $inputfield->editLinks;
        $new = $inputfield->newPageLink && $this->canAddNew($inputfield);
        if (!$edit && !$new) return;

        $classes = ($edit ? 'at-pfel-edit ' : '') . ($new ? 'at-pfel-new ' : '');
        $attrs = $new
            ? "data-pfel-parent='" . (int) ($inputfield->newPageParent ?: $inputfield->parent_id) . "' data-pfel-template='" . $this->templateId($inputfield) . "' "
            : '';
        // Only the outer element: the inputfield it delegates to builds that, so its classes
        // can't be added before it renders.
        $out = preg_replace("/^(\\s*)<div class='/", "$1<div {$attrs}class='$classes", (string) $event->return, 1, $count);
        if (!$count) return;
        $event->return = $out;
    }

    /**
     * A locked field holding one page: mark its value with that page's id
     */
    public function markValue(HookEvent $event): void
    {
        /** @var InputfieldPage $inputfield */
        $inputfield = $event->object;
        if (!$inputfield->editLinks) return;
        $value = $inputfield->attr('value');
        if ($value instanceof PageArray) $value = $value->count() === 1 ? $value->first() : null;
        if (is_array($value)) $value = count($value) === 1 ? reset($value) : null;
        $id = $value instanceof Page ? (int) $value->id : (int) $value;
        if ($id < 2) return;
        $event->return = "<span class='at-pfel-edit at-pfel-value' data-pfel-page='$id'>{$event->return}</span>";
    }

    /** The one template new pages would use, or 0 when the field allows several or none */
    protected function templateId(InputfieldPage $inputfield): int
    {
        $id = $inputfield->template_id;
        if (is_array($id)) $id = count($id) === 1 ? reset($id) : 0;
        return (int) $id;
    }

}
