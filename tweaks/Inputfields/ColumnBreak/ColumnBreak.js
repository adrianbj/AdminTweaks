document.addEventListener('DOMContentLoaded', function () {

    var gutterSize = 20;
    var minSize = 250;
    var left = document.querySelector('.aos_col_left');
    var right = left ? left.parentNode.querySelector('.aos_col_left ~ .aos_col_right') : null;
    var gutter = null;
    var storageName, defaultSizes;

    function setSizes(sizes) {
        left.style.width = 'calc(' + sizes[0] + '% - ' + (gutterSize / 2) + 'px)';
        right.style.width = 'calc(' + sizes[1] + '% - ' + (gutterSize / 2) + 'px)';
    }

    function getSizes() {
        var total = left.offsetWidth + right.offsetWidth + gutterSize;
        var first = (left.offsetWidth + gutterSize / 2) / total * 100;
        return [first, 100 - first];
    }

    function setSplitterHeight() {
        if (!gutter) return;
        // set height to 0 before checking parent height
        gutter.style.height = '0';
        gutter.style.height = gutter.parentNode.offsetHeight + 'px';
    }

    function readSizes() {
        try {
            var saved = JSON.parse(localStorage.getItem(storageName));
            if (Array.isArray(saved) && saved.length === 2) return saved;
        } catch (e) {}
        return defaultSizes;
    }

    function saveSizes(sizes) {
        try {
            if (sizes) localStorage.setItem(storageName, JSON.stringify(sizes));
            else localStorage.removeItem(storageName);
        } catch (e) {}
    }

    if (left && right) {
        storageName = right.getAttribute('data-splitter-storagekey');
        defaultSizes = [
            parseFloat(left.getAttribute('data-splitter-default')),
            parseFloat(right.getAttribute('data-splitter-default'))
        ];

        gutter = document.createElement('div');
        gutter.className = 'gutter gutter-horizontal';
        gutter.style.width = gutterSize + 'px';
        left.after(gutter);
        setSizes(readSizes());

        gutter.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            e.preventDefault();
            var startX = e.clientX;
            var startLeft = left.getBoundingClientRect().width;
            var total = startLeft + right.getBoundingClientRect().width + gutterSize;
            gutter.setPointerCapture(e.pointerId);
            document.body.style.userSelect = 'none';

            function move(e) {
                var width = Math.min(Math.max(startLeft + e.clientX - startX, minSize), total - gutterSize - minSize);
                var first = (width + gutterSize / 2) / total * 100;
                setSizes([first, 100 - first]);
            }

            function end() {
                gutter.removeEventListener('pointermove', move);
                gutter.removeEventListener('pointerup', end);
                gutter.removeEventListener('pointercancel', end);
                document.body.style.userSelect = '';
                saveSizes(getSizes());
                setSplitterHeight();
            }

            gutter.addEventListener('pointermove', move);
            gutter.addEventListener('pointerup', end);
            gutter.addEventListener('pointercancel', end);
        });

        // restore default splitter position on double-click on splitter
        gutter.addEventListener('dblclick', function () {
            setSizes(defaultSizes);
            saveSizes(null);
            setSplitterHeight();
        });
    }

    // the ready handler can run after the load event
    if (document.readyState === 'complete') {
        setTimeout(setSplitterHeight, 2000);
    } else {
        window.addEventListener('load', function () {
            setTimeout(setSplitterHeight, 2000);
        });
    }

    // recalculate splitter height on window resize
    window.addEventListener('resize', setSplitterHeight);

    // AdminColumns in tabs. wiretabclick is a jQuery event from ProcessWire's WireTabs,
    // which native listeners can't receive.
    var tabsForm = document.querySelector('#ProcessPageEdit li[data-column-break]');
    if (tabsForm && window.jQuery) {
        window.jQuery(document).on('wiretabclick', function (e, elem) {
            var tabName = elem.attr('id').replace('Inputfield_', '');
            var tab = document.getElementById('Inputfield_' + tabName);
            var tabColumnBreaks = JSON.parse(tabsForm.getAttribute('data-column-break') || '{}');

            if (!tab || tab.classList.contains('aos-columns-ready')) return false;
            if (!tabColumnBreaks[tabName] || !tabColumnBreaks[tabName][0]) return false;

            var breakField = document.getElementById('wrap_Inputfield_' + tabColumnBreaks[tabName][0]);
            var colWidth = tabColumnBreaks[tabName][1] ? tabColumnBreaks[tabName][1] : 67;
            var fields = tab.querySelector(':scope > .Inputfields');

            if (!breakField || !fields || breakField.parentNode !== fields) return false;

            var items = Array.prototype.slice.call(fields.children).filter(function (child) {
                return child.tagName === 'LI';
            });
            var breakIndex = items.indexOf(breakField) + 1;

            fields.insertBefore(column('aos_col_left', colWidth, items.slice(0, breakIndex)), items[0]);
            fields.appendChild(column('aos_col_right', 100 - colWidth, items.slice(breakIndex)));

            tab.classList.add('aos-columns-ready');
        });
    }

    // an InputfieldFieldsetOpen-like column holding the given inputfields
    function column(className, width, items) {
        var li = document.createElement('li');
        li.className = 'InputfieldFieldsetOpen ' + className;
        li.style.width = width + '%';
        var content = document.createElement('div');
        content.className = 'InputfieldContent';
        var ul = document.createElement('ul');
        ul.className = 'Inputfields';
        items.forEach(function (item) {
            ul.appendChild(item);
        });
        content.appendChild(ul);
        li.appendChild(content);
        return li;
    }
});
