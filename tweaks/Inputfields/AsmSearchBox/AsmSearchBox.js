// A search box in place of an AsmSelect's "add" dropdown. Choosing a result sets the dropdown's
// value and fires its change event, which is what AsmSelect listens for.
function initAsmSelectBox(inputfieldId) {
  var wrap = document.getElementById('wrap_' + inputfieldId);
  var select = wrap ? wrap.querySelector('select.asmSelect') : null;

  // AsmSelect creates its dropdown after this script runs
  if (!select) {
    window.requestAnimationFrame(function () {
      initAsmSelectBox(inputfieldId);
    });
    return;
  }
  if (select.dataset.asmSearchBox) return;
  select.dataset.asmSearchBox = '1';

  var box = document.createElement('div');
  box.className = 'AsmSearchBox';

  var input = document.createElement('input');
  input.type = 'search';
  input.className = 'AsmSearchBox-input uk-input uk-form-small';
  input.autocomplete = 'off';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-autocomplete', 'list');
  // AsmSelect's first option is its label ("Add Field"), with no value attribute
  var first = select.options[0];
  var label = first && (!first.hasAttribute('value') || first.value === '') ? first : null;
  var placeholder = label ? label.text : '';
  input.placeholder = placeholder;
  if (placeholder) input.setAttribute('aria-label', placeholder);

  var list = document.createElement('ul');
  list.className = 'AsmSearchBox-list';
  list.id = inputfieldId + '_AsmSearchBox';
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  input.setAttribute('aria-controls', list.id);

  box.appendChild(input);
  box.appendChild(list);
  select.parentNode.insertBefore(box, select);
  select.hidden = true;

  var active = -1;

  function choices() {
    return Array.prototype.slice.call(list.querySelectorAll('.AsmSearchBox-option:not(.disabled)'));
  }

  function setActive(index) {
    var items = choices();
    if (!items.length) return;
    active = (index + items.length) % items.length;
    items.forEach(function (item, i) {
      item.classList.toggle('active', i === active);
      item.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
    items[active].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', items[active].id);
  }

  function addOption(option, n) {
    var item = document.createElement('li');
    item.className = 'AsmSearchBox-option' + (option.disabled ? ' disabled' : '');
    item.id = list.id + '_' + n;
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.textContent = option.text;
    list.appendChild(item);
  }

  function render() {
    var term = input.value.trim().toLowerCase();
    var n = 0;
    list.textContent = '';
    active = -1;
    input.removeAttribute('aria-activedescendant');
    Array.prototype.forEach.call(select.children, function (child) {
      var options = child.tagName === 'OPTGROUP' ? child.children : [child];
      var matches = Array.prototype.filter.call(options, function (option) {
        return option !== label && option.text.trim() && option.text.toLowerCase().indexOf(term) !== -1;
      });
      if (!matches.length) return;
      if (child.tagName === 'OPTGROUP') {
        var group = document.createElement('li');
        group.className = 'AsmSearchBox-group';
        group.setAttribute('role', 'presentation');
        group.textContent = child.label;
        list.appendChild(group);
      }
      matches.forEach(function (option) {
        addOption(option, n++);
      });
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (term) setActive(0);
  }

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function choose(item) {
    if (!item || item.classList.contains('disabled')) return;
    select.value = item.dataset.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    input.value = '';
    close();
  }

  input.addEventListener('focus', render);
  // the input keeps focus after a choice, so a click on it has to reopen the list
  input.addEventListener('click', function () {
    if (list.hidden) render();
  });
  input.addEventListener('input', render);
  input.addEventListener('blur', close);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) render();
      setActive(active + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Enter') {
      // never submit the page form from here
      e.preventDefault();
      if (active > -1) choose(choices()[active]);
    } else if (e.key === 'Escape' && !list.hidden) {
      e.preventDefault();
      close();
    }
  });

  // mousedown, so the input keeps focus (and the list stays open) until the click lands
  list.addEventListener('mousedown', function (e) {
    e.preventDefault();
  });
  list.addEventListener('click', function (e) {
    choose(e.target.closest('.AsmSearchBox-option'));
    input.focus();
  });
}
