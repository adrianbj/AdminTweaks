document.addEventListener('mousedown', function (e) {
    var tooltip = e.target.closest('.Inputfield .aos_EditField');
    if (!tooltip) return;

    // right click
    if (e.button === 2) {
        e.preventDefault();
        return;
    }

    // in repeaters field names are suffixed, eg. "excerpt_repeater1516"
    var inputfield = tooltip.closest('.Inputfield');
    var link = inputfield.querySelector('.aos_EditFieldLink[data-field-id="' + tooltip.getAttribute('data-for-field') + '"]');
    if (!link) return;

    e.preventDefault();
    // if middle mouse button pressed, open a new page
    if (e.button === 1) {
        window.open(link.getAttribute('href').replace('&modal=1', ''));
    } else {
        link.click();
    }
});
