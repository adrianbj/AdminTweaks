// Pins the page editor's header buttons (ProcessWire's copy of the Save button) to the top right
// of the window once the header scrolls away, centered in the tab bar while it's stuck there.
function initFloatingSave(tries) {
  var buttons = document.getElementById('pw-content-head-buttons');

  // ProcessWire copies the Save button into the header after this script runs
  if (!buttons || !buttons.querySelector('button')) {
    if (tries < 120) {
      window.requestAnimationFrame(function () {
        initFloatingSave(tries + 1);
      });
    }
    return;
  }

  var head = document.getElementById('pw-content-head') || buttons.parentNode;
  var masthead = document.getElementById('pw-masthead');
  var tabs = document.getElementById('PageEditTabs');

  // holds the buttons' place in the header while they're pinned
  var placeholder = document.createElement('div');
  placeholder.className = buttons.className;
  placeholder.hidden = true;
  buttons.parentNode.insertBefore(placeholder, buttons);

  var pending = false;

  function place() {
    pending = false;
    var pinned = buttons.classList.contains('FloatingSave-pinned');
    var spot = (pinned ? placeholder : buttons).getBoundingClientRect();
    var height = buttons.offsetHeight;
    var top = masthead ? Math.max(0, masthead.getBoundingClientRect().bottom) : 0;
    var bar = tabs && getComputedStyle(tabs).position === 'sticky' ? tabs.getBoundingClientRect() : null;
    if (bar && bar.top <= top + 1 && bar.height >= height) {
      top = bar.top + (bar.height - height) / 2;
    } else {
      top += 8;
    }

    // offsetWidth is 0 where the theme hides the header buttons (small screens)
    if (buttons.offsetWidth && spot.top < top) {
      if (!pinned) {
        placeholder.style.width = buttons.offsetWidth + 'px';
        placeholder.style.height = height + 'px';
        placeholder.hidden = false;
        buttons.classList.add('FloatingSave-pinned');
      }
      buttons.style.top = top + 'px';
      buttons.style.right = document.documentElement.clientWidth - head.getBoundingClientRect().right + 'px';
    } else if (pinned) {
      buttons.classList.remove('FloatingSave-pinned');
      buttons.style.top = '';
      buttons.style.right = '';
      placeholder.hidden = true;
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(place);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  place();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    initFloatingSave(0);
  });
} else {
  initFloatingSave(0);
}
