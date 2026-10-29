// Pins the tab bar (WireTabs) below the masthead, and gives each tab its own scroll position.
//
// All WireTabs panels stay in the DOM and switching just toggles which one is shown, so the window
// scroll stays put when you change tabs. This remembers where you were on the tab you leave and
// restores the incoming tab's last position (the top for a tab you haven't scrolled yet). If you
// leave a tab with the bar pinned, the incoming tab is scrolled at least far enough to keep it
// pinned, so the page doesn't jump back up to the headline.

// The bar pins below the masthead when the theme keeps it in view (Konkat's is sticky), and at the
// top of the window otherwise, such as in a modal, which has no masthead
function setStickyTabsTop() {
  var top = 0;
  for (var el = document.getElementById('pw-masthead'); el && el !== document.body; el = el.parentElement) {
    var position = getComputedStyle(el).position;
    if (position === 'sticky' || position === 'fixed') {
      top = el.offsetHeight;
      break;
    }
  }
  document.documentElement.style.setProperty('--StickyTabs-top', top + 'px');
}

function initStickyTabs(tries) {
  var tabs = document.querySelector('ul.WireTabs');

  // WireTabs builds its list after this script runs
  if (!tabs) {
    if (tries < 120) {
      window.requestAnimationFrame(function () {
        initStickyTabs(tries + 1);
      });
    }
    return;
  }

  var positions = {};

  function stickyTop() {
    return parseFloat(getComputedStyle(tabs).top) || 0;
  }

  // The bar's document top while it isn't pinned. Once it's pinned its position follows the
  // scroll, so this is only measured while it sits free.
  var naturalTop = null;
  function refreshNaturalTop() {
    var rectTop = tabs.getBoundingClientRect().top;
    if (rectTop > stickyTop() + 1) naturalTop = rectTop + window.scrollY;
  }

  // The scroll position at which the bar pins, or null while it isn't known yet
  function pinThreshold() {
    if (naturalTop === null) return null;
    return Math.max(0, Math.ceil(naturalTop - stickyTop()));
  }

  function keyFor(a) {
    if (!a) return null;
    return a.getAttribute('href') || a.textContent.trim();
  }

  // only the top-level tab links, not nested tab sets such as language tabs
  function activeLink() {
    return tabs.querySelector(':scope > * > a.pw-active');
  }

  var currentKey = keyFor(activeLink());
  refreshNaturalTop();

  // Recorded on every scroll, not when the tab changes: by then the browser has already clamped
  // the scroll position to the (possibly shorter) incoming panel.
  window.addEventListener('scroll', function () {
    refreshNaturalTop();
    if (currentKey !== null) positions[currentKey] = window.scrollY;
  }, { passive: true });

  // Watching the active class rather than clicks also covers tabs in the overflow dropdown and
  // tabs switched from script
  new MutationObserver(function () {
    var newKey = keyFor(activeLink());
    if (!newKey || newKey === currentKey) return;

    var leftAt = positions[currentKey] || 0;
    currentKey = newKey;
    var y = positions[newKey] || 0;

    var threshold = pinThreshold();
    if (threshold !== null && leftAt >= threshold && y < threshold) y = threshold;

    // the panels have already switched; scroll once layout has settled
    window.requestAnimationFrame(function () {
      window.scrollTo(0, y);
    });
  }).observe(tabs, { subtree: true, attributes: true, attributeFilter: ['class'] });
}

function startStickyTabs() {
  setStickyTabsTop();
  window.addEventListener('resize', setStickyTabsTop);
  initStickyTabs(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startStickyTabs);
} else {
  startStickyTabs();
}
