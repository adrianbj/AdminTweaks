document.addEventListener('DOMContentLoaded', function () {
  var links = ProcessWire.config.AOS_prevnextlinks;
  var target = document.querySelector('h1') || document.querySelector('li.title span') || document.querySelector('li.title');
  if (!links || !target) return;

  ['prev', 'next'].forEach(function (key) {
    if (!links[key]) return;
    var a = document.createElement('a');
    a.href = links[key].url;
    a.title = links[key].title;
    a.className = 'aos-edit-' + key;
    a.setAttribute('uk-tooltip', '');
    var icon = document.createElement('i');
    icon.className = 'fa fa-angle-' + (key === 'prev' ? 'left' : 'right');
    a.appendChild(icon);
    target.appendChild(a);
  });
});
