/**
 * Edit links on the pages selected in a Page field, and a "New" link that creates a page in a
 * modal and adds it to the field. The server only marks the fields (PageFieldEditLinks.php):
 * .at-pfel-edit, .at-pfel-new with data-pfel-parent and data-pfel-template, and for a locked
 * field .at-pfel-value with data-pfel-page.
 *
 * Loaded on every admin page: a marked field can arrive later by ajax (a repeater item), and a
 * modal opened inside a modal needs the handlers at the end of this file in both documents.
 */
(function ($) {

    if (window.AdminTweaksPageFieldEditLinks) return;

    var EDIT_BUTTONS = '#submit_save, #submit_publish, #submit_save_unpublished';
    var NEW_BUTTONS = '#Inputfield_submit_save, #submit_save, #submit_publish, #submit_save_unpublished';

    function settings() {
        var pw = (window.ProcessWire && ProcessWire.config) || window.config || {};
        var own = pw.AdminTweaksPageFieldEditLinks || {};
        return {
            newLabel: own.newLabel || 'New',
            editLabel: own.editLabel || 'View',
            adminUrl: own.adminUrl || (pw.urls && pw.urls.admin) || '/'
        };
    }

    /** The field's li.Inputfield */
    function inputfield($wrapper) {
        return $wrapper.closest('.Inputfield');
    }

    function editUrl($wrapper, pageId) {
        var url = settings().adminUrl + 'page/edit/?id=' + parseInt(pageId, 10);
        var forPage = /[?&]id=(\d+)/.exec($wrapper.closest('form').attr('action') || '');
        var name = (inputfield($wrapper).attr('id') || '').replace(/^wrap_Inputfield_/, '');
        if (forPage && name) url += '&forpage=' + forPage[1] + '&forfield=' + encodeURIComponent(name);
        return url;
    }

    function icon(name) {
        var i = document.createElement('i');
        i.className = 'fa ' + name + ' at-pfel-icon';
        return i;
    }

    /** An edit link for one page: just the icon, or the icon and "View" */
    function editLink($wrapper, pageId, withLabel) {
        var a = document.createElement('a');
        a.className = 'pw-modal pw-modal-medium at-pfel-link';
        a.setAttribute('data-buttons', EDIT_BUTTONS);
        a.setAttribute('data-autoclose', '');
        a.href = editUrl($wrapper, pageId);
        a.target = '_blank';
        a.appendChild(icon('fa-search'));
        if (withLabel) a.appendChild(document.createTextNode(settings().editLabel));
        return a;
    }

    function wrapped(link) {
        var span = document.createElement('span');
        span.className = 'at-pfel-link-wrap';
        span.appendChild(link);
        return span;
    }

    function validId(id) {
        return parseInt(id, 10) > 1;
    }

    /** Take this tweak's edit links back out of a field */
    function clear($wrapper) {
        $wrapper.find('.at-pfel-link-wrap').not('.at-pfel-new-wrap').remove();
        $wrapper.next('.at-pfel-link-wrap').not('.at-pfel-new-wrap').remove();
        $wrapper.find('a.at-pfel-link').each(function () {
            var $a = $(this);
            $a.children('.at-pfel-icon').remove();
            $a.replaceWith($a.contents());
        });
    }

    /** Make a label the link: its own content moves inside, followed by the icon */
    function linkLabel($wrapper, $label, pageId) {
        if (!$label.length || !validId(pageId)) return;
        // A label that already holds a link (an autocomplete's can) gets the icon beside it instead.
        if ($label.children('a').length) {
            $label.append(wrapped(editLink($wrapper, pageId, false)));
            return;
        }
        var a = editLink($wrapper, pageId, false);
        var search = a.firstChild;
        $(a).prepend($label.contents());
        a.appendChild(search);
        $label.append(a);
    }

    /** Add the edit links to one marked field, replacing any already there */
    function refresh($wrapper) {
        if (!$wrapper.hasClass('at-pfel-edit')) return;
        clear($wrapper);

        if ($wrapper.hasClass('at-pfel-value')) {
            var valueId = $wrapper.attr('data-pfel-page');
            if (validId(valueId)) $wrapper.after(wrapped(editLink($wrapper, valueId, true)));
            return;
        }

        if ($wrapper.hasClass('InputfieldAsmSelect')) {
            $wrapper.find('.asmListItem').each(function () {
                var $item = $(this);
                var $option = $wrapper.find('.asmSelect [rel="' + $item.attr('rel') + '"]').first();
                linkLabel($wrapper, $item.find('span.asmListItemLabel'), $option.val());
            });
            return;
        }

        if ($wrapper.hasClass('InputfieldPageListSelectMultiple')
            || ($wrapper.hasClass('InputfieldPageAutocomplete') && !$wrapper.find('.no_list').length)) {
            $wrapper.find('ol li').not('.itemTemplate').each(function () {
                var $item = $(this);
                linkLabel($wrapper, $item.find('span.itemLabel'), $item.find('span.itemValue').text());
            });
            return;
        }

        if ($wrapper.hasClass('InputfieldPageAutocomplete')) {
            var autoId = $wrapper.find('.InputfieldPageAutocompleteData').val();
            if (validId(autoId)) $wrapper.find("input[type='text']").first().parent().after(wrapped(editLink($wrapper, autoId, true)));
            return;
        }

        if ($wrapper.hasClass('InputfieldPageListSelect')) {
            var $data = $wrapper.children('input[type=text]').first();
            if (validId($data.val())) $data.after(wrapped(editLink($wrapper, $data.val(), true)));
            return;
        }

        if ($wrapper.hasClass('InputfieldCheckboxes') || $wrapper.hasClass('InputfieldRadios')) {
            $wrapper.find('ul li, ol li').each(function () {
                var $item = $(this);
                var id = $item.find('input').val();
                if (validId(id)) $item.find('span').first().append(wrapped(editLink($wrapper, id, false)));
            });
            return;
        }

        // A single select (InputfieldSelect, InputfieldChosenSelect, and the like)
        var $select = $wrapper.find('select').not('[multiple]').first();
        if ($select.length && validId($select.val())) $select.after(wrapped(editLink($wrapper, $select.val(), true)));
    }

    /** The "New" link of one marked field */
    function addNewLink($wrapper) {
        if ($wrapper.children('.at-pfel-new-wrap').length) return;
        var parent = parseInt($wrapper.attr('data-pfel-parent'), 10) || 0;
        var template = parseInt($wrapper.attr('data-pfel-template'), 10) || 0;
        var url = settings().adminUrl + 'page/add/?';
        if (parent) url += 'parent_id=' + parent + '&';
        if (template) url += 'template_id=' + template + '&';
        var a = document.createElement('a');
        a.className = 'pw-modal pw-modal-medium at-pfel-new-link';
        a.setAttribute('data-buttons', NEW_BUTTONS);
        a.href = url + 'modal=1';
        a.target = '_blank';
        a.appendChild(icon('fa-plus-circle'));
        a.appendChild(document.createTextNode(settings().newLabel));
        var span = wrapped(a);
        span.className += ' at-pfel-new-wrap';
        $wrapper.append(span);
    }

    /**
     * The select that holds a field's value. asmSelect adds a dropdown of its own before it,
     * so the multiple one is looked for first.
     */
    function valueSelect($wrapper) {
        var $multiple = $wrapper.find('select[multiple]').first();
        return $multiple.length ? $multiple : $wrapper.find('select').not('.asmSelect').first();
    }

    /** Choose values in a reloaded option-list field: those chosen before, then the new page */
    function chooseOptions($wrapper, ids, single) {
        if ($wrapper.hasClass('InputfieldCheckboxes') || $wrapper.hasClass('InputfieldRadios')) {
            // The reload brings the saved choices back: only what was chosen here should stay.
            $wrapper.find('input[type=radio], input[type=checkbox]').prop('checked', false);
            $.each(ids, function (i, id) {
                $wrapper.find('input').filter(function () { return this.value === String(id); }).prop('checked', true);
            });
            return $wrapper.find('input').first();
        }
        var $select = valueSelect($wrapper);
        if (single) {
            $select.val(String(ids[ids.length - 1]));
            return $select;
        }
        // The reload brings the saved choices back: only what was chosen here should stay.
        $select.children('option').prop('selected', false).removeAttr('selected');
        // In order, at the end: a sortable select (AsmSelect) lists the chosen ones as they come.
        $.each(ids, function (i, id) {
            var $option = $select.children('option').filter(function () { return this.value === String(id); });
            if ($option.length) $select.append($option.prop('selected', true));
        });
        return $select;
    }

    /**
     * Put a page just created into the field: page is { id, title }.
     *
     * Fields that list their options reload from the server, which then has the new page among
     * them. The page list and autocomplete inputs take it through their own JS, with its title.
     */
    function addNew($wrapper, page) {
        if (!validId(page.id)) return;
        var $li = inputfield($wrapper);
        var id = parseInt(page.id, 10);

        if ($wrapper.hasClass('InputfieldPageListSelectMultiple')) {
            $wrapper.find('.InputfieldPageListSelectMultipleData').trigger('pageSelected', { id: id, title: page.title, actionLink: $() });
            $wrapper.trigger('change');
            return;
        }

        if ($wrapper.hasClass('InputfieldPageAutocomplete')) {
            var $data = $wrapper.find('.InputfieldPageAutocompleteData');
            if ($wrapper.find('.no_list').length) {
                var $text = $wrapper.find("input[type='text']").first();
                $text.val(page.title).attr('data-selectedLabel', page.title);
                $data.val(id).trigger('change');
                $text.trigger('change').trigger('blur');
            } else {
                InputfieldPageAutocomplete.pageSelected($wrapper.find('ol').first(), { page_id: id, label: page.title });
                $wrapper.trigger('change');
            }
            return;
        }

        // The rest reload. What's chosen but not yet saved is put back afterwards.
        var single = false;
        var chosen = [];
        if ($wrapper.hasClass('InputfieldPageListSelect')) {
            single = true;
        } else if ($wrapper.hasClass('InputfieldCheckboxes') || $wrapper.hasClass('InputfieldRadios')) {
            single = $wrapper.hasClass('InputfieldRadios');
            $wrapper.find('input:checked').each(function () { chosen.push(this.value); });
        } else {
            var $select = valueSelect($wrapper);
            single = !$select.prop('multiple');
            $select.children('option:selected').each(function () { if (this.value) chosen.push(this.value); });
        }
        if (single) chosen = [];
        chosen.push(id);

        // On the field itself, so this runs before the document-level handlers that set the
        // reloaded input up (asmSelect, the page list): they then start from these values.
        $li.one('reloaded', function () {
            var $fresh = $li.find('.at-pfel-new, .at-pfel-edit').first();
            if (!$fresh.length) return;
            if ($fresh.hasClass('InputfieldPageListSelect')) {
                $fresh.find('.InputfieldPageListSelectData').val(id);
            } else {
                var $changed = chooseOptions($fresh, chosen, single);
                setTimeout(function () { $changed.trigger('change'); }, 150);
            }
            setTimeout(function () { init($li); }, 150);
        });
        $li.trigger('reload');
    }

    /** Set up every marked field inside $root */
    function init($root) {
        $root.find('.at-pfel-edit, .at-pfel-new').addBack('.at-pfel-edit, .at-pfel-new').each(function () {
            var $wrapper = $(this);
            if ($wrapper.hasClass('at-pfel-new') && !$wrapper.hasClass('at-pfel-value')) addNewLink($wrapper);
            refresh($wrapper);
        });
    }

    window.AdminTweaksPageFieldEditLinks = { init: init, refresh: refresh, editUrl: editUrl, addNew: addNew };

    // asmSelect and the list inputs build their items a moment after ready and after a change.
    $(function () {
        setTimeout(function () { init($(document.body)); }, 100);
    });
    $(document).on('reloaded', '.Inputfield', function () {
        var $li = $(this);
        setTimeout(function () { init($li); }, 100);
    });
    $(document).on('change', '.at-pfel-edit', function () {
        var $wrapper = $(this);
        setTimeout(function () { refresh($wrapper); }, 100);
    });

    // The "New" modal closed: a page was created if the modal ended on its editor.
    $(document).on('pw-modal-closed', 'a.at-pfel-new-link', function () {
        var $wrapper = $(this).closest('.at-pfel-new');
        var $modal;
        try {
            $modal = $('iframe.pw-modal-window').last().contents();
        } catch (e) {
            return;
        }
        var id = parseInt($modal.find('#Inputfield_id').val(), 10);
        if (!validId(id)) return;
        var title = $modal.find('#Inputfield_title').val()
            || $modal.find('input[name=title]').val()
            || $modal.find('#Inputfield__pw_page_name').val()
            || String(id);
        addNew($wrapper, { id: id, title: title });
    });

    // A modal opened inside a modal: the outer dialog fills the window meanwhile.
    function outerDialog() {
        try {
            if (window === window.top) return null;
            return window.parent.jQuery(window.parent.document).find('iframe.pw-modal-window').closest('.ui-dialog');
        } catch (e) {
            return null;
        }
    }
    $(document).on('pw-modal-opened', function () {
        var $dialog = outerDialog();
        if ($dialog) $dialog.addClass('at-pfel-nested');
    });
    $(document).on('pw-modal-closed', function () {
        var $dialog = outerDialog();
        if ($dialog) $dialog.removeClass('at-pfel-nested');
    });

})(jQuery);
