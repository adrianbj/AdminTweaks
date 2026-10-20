// Shift-click a field's label to copy the field's name. The listener runs in the capture phase,
// so the click never reaches the label's own handler that opens or closes the field.
document.addEventListener('click', function (e) {
  if (!e.shiftKey) return;
  var header = e.target.closest('.InputfieldHeader');
  if (!header) return;

  e.preventDefault();
  e.stopPropagation();

  var text = header.getAttribute('for') || header.parentNode.id || '';
  text = text.replace(/^Inputfield_|wrap_Inputfield_|wrap_/, '').trim();
  if (!text) return;

  navigator.clipboard.writeText(text);
  header.animate([{ backgroundColor: '#ffff99' }, { backgroundColor: 'transparent' }], 500);
}, true);
