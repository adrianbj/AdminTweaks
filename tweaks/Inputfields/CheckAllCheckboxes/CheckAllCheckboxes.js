document.addEventListener('DOMContentLoaded', function () {

    var selector = '.InputfieldCheckboxes ul[class*="InputfieldCheckboxes"]';

    // one button, moved into whichever checkboxes list the pointer is over
    var button = document.createElement('li');
    button.id = 'checkAllCheckboxes';
    button.innerHTML = '<i class="fa fa-check"></i>';

    function inputs(ul) {
        return ul.querySelectorAll('input[type="checkbox"]');
    }

    function updateState(ul) {
        var allChecked = Array.prototype.every.call(inputs(ul), function (input) {
            return input.checked;
        });
        button.setAttribute('data-checked-all', allChecked ? '1' : '');
    }

    // check every unchecked box, or uncheck them all when every box is already checked
    function toggle(ul) {
        var checkAll = Array.prototype.some.call(inputs(ul), function (input) {
            return !input.checked;
        });
        Array.prototype.forEach.call(inputs(ul), function (input) {
            if (input.checked === checkAll) return;
            input.checked = checkAll;
            // need to trigger change, eg. for showIf fields
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        return checkAll;
    }

    document.addEventListener('change', function (e) {
        var ul = e.target.closest(selector);
        if (ul && e.target.matches('input[type="checkbox"]')) updateState(ul);
    });

    button.addEventListener('click', function (e) {
        if (e.button !== 0) return;
        button.setAttribute('data-checked-all', toggle(button.parentNode) ? '1' : '');
    });

    document.addEventListener('mouseover', function (e) {
        var ul = e.target.closest(selector);
        if (!ul || button.parentNode === ul) return;
        ul.appendChild(button);
        updateState(ul);
    });
});
