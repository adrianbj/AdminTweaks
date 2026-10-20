// pageSelected is a jQuery event from ProcessWire's PageListSelect, which native listeners
// can't receive
if (window.jQuery) {
    window.jQuery(document).on('pageSelected', function (e, obj) {
        var wrap = obj.a[0].closest('.InputfieldPageListSelect');
        if (!wrap) return;
        var clearButton = wrap.querySelector('button.clear');
        var restoreButton = wrap.querySelector('button.restore');

        if (clearButton) clearButton.classList.toggle('empty', obj.id === 0);
        if (restoreButton) restoreButton.classList.remove('empty', 'initial');
    });
}

document.addEventListener('click', function (e) {
    var button = e.target.closest('.aos_pagelist_unselect');
    if (!button) return;
    e.preventDefault();

    var parent = button.parentNode;
    var input = parent.querySelector('input');
    var title = parent.querySelector('.PageListSelectName');

    if (button.classList.contains('clear')) {
        input.removeAttribute('value');
        input.value = '';
        if (title) title.textContent = '';
        button.classList.add('empty');
        var restore = parent.querySelector('button.restore');
        if (restore) {
            if (restore.getAttribute('data-value-original')) restore.classList.remove('empty');
            restore.classList.remove('initial');
        }
    } else {
        input.value = button.getAttribute('data-value-original');
        if (title) title.textContent = button.getAttribute('data-title-original');
        button.classList.add('empty');
        var clear = parent.querySelector('button.clear');
        if (clear) clear.classList.remove('empty');
    }

    // if pagelist is open, close it
    if (parent.querySelector('.PageListItemOpen')) {
        var toggle = parent.querySelector('a.PageListSelectActionToggle');
        if (toggle) toggle.click();
    }

    // allow dependent fields to update
    input.dispatchEvent(new Event('change', { bubbles: true }));
});
