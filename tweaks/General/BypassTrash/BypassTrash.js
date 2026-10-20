// Delete + non-superuser Trash actions: the first press turns the link into a confirm link,
// with a cancel link before it; the confirm link then runs the action as usual.
document.addEventListener('mousedown', function (e) {
    var link = e.target.closest('a.aos-pagelist-confirm');
    if (!link) return;
    e.preventDefault();
    if (e.button !== 0) return;

    var strings = ProcessWire.config.AOS_BypassTrash;

    if (!link.hasAttribute('data-text-original')) {
        var currentText = link.childNodes[1] ? link.childNodes[1].nodeValue : link.innerHTML;
        link.setAttribute('data-text-original', currentText);
        if (link.classList.contains('PageListActionDelete') || link.classList.contains('PageDelete')) {
            link.setAttribute('data-text-confirm', strings.str_confirm);
        }
    }

    // already the confirm link: let the click run the action
    if (link.getAttribute('href').indexOf('&force=1') !== -1) return;

    if (link.classList.contains('cancel')) {
        // the cancel link: put the original link back in its place
        var confirmLink = link.nextElementSibling;
        if (!confirmLink || confirmLink.tagName !== 'A') return;
        confirmLink.classList.remove('cancel');
        confirmLink.setAttribute('href', link.getAttribute('href').replace('&force=1', ''));
        confirmLink.lastChild.textContent = link.getAttribute('data-text-original');
        link.replaceWith(confirmLink);
        return;
    }

    var cancelLink = link.cloneNode(true);
    cancelLink.classList.add('cancel');
    cancelLink.lastChild.textContent = ' ' + strings.str_cancel;

    // replace text only (keep icon)
    link.lastChild.textContent = link.getAttribute('data-text-confirm') || link.getAttribute('data-text-original');
    link.setAttribute('href', link.getAttribute('href') + '&force=1');
    link.before(cancelLink);
});
