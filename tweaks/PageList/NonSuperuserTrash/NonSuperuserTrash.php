<?php

namespace AdminTweaks;

use ProcessWire\HookEvent;

/**
 * Originally from AdminOnSteroids by RolandToth (tpr)
 */
class NonSuperuserTrash extends Tweak
{
    public function info(): array
    {
        return [
            'description' => 'Add Trash action also for non-SuperUsers',
            'author' => 'Roland Toth',
            'authorUrl' => 'https://processwire.com/talk/profile/3156--',
            'maintainer' => 'Adrian Jones',
            'maintainerUrl' => 'https://processwire.com/talk/profile/985--',
            'help' => 'Compared to the core option of ProcessPageList to show trash for non-superusers this tweak only adds the "trash" action to the pagelist actions buttons, but the trash page in the tree will not be accessible with this tweak. If you want to make the trash page also accessible you can use the core feature in ProcessPageList config settings.',
        ];
    }


    public function ready(): void
    {
        if (!$this->wire->user->isSuperuser()) {
            // the same press-to-confirm, then cancel or confirm, as BypassTrash's Delete action
            $this->wire->addHookBefore('ProcessPageList::execute', function () {
                $this->wire('config')->js('AOS_BypassTrash', [
                    'str_cancel' => $this->_('Cancel'),
                    'str_confirm' => $this->_('Trash'),
                ]);
                $confirm = dirname(__DIR__, 2) . '/General/BypassTrash/BypassTrash';
                $this->wire('config')->styles->add($this->pathToUrl("$confirm.css", true));
                $this->wire('config')->scripts->add($this->pathToUrl("$confirm.js", true));
            });

            $this->addHookAfter('ProcessPageListActions::getExtraActions', function (HookEvent $event) {
                $page = $event->arguments(0);
                $extras = $event->return;
                if ($page->trashable()) {
                    $trash_icon = "<i class='fa fa-trash-o'></i>&nbsp;";
                    $extras['trash'] = array(
                        'cn' => 'Trash aos-pagelist-confirm',
                        'name' => $trash_icon . $this->_('Trash'),
                        'url' => $this->wire('config')->urls->admin . "page/?action=trash&id=$page->id",
                        'ajax' => true,
                    );
                }
                $event->return = $extras;
            });
        }
    }
}
