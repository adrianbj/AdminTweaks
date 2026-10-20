document.addEventListener('DOMContentLoaded', function () {
    var upgradesUrl = ProcessWire.config.urls.admin + 'setup/upgrades/';
    document.querySelectorAll('a[href="' + upgradesUrl + '"]').forEach(function (a) {
        a.setAttribute('href', upgradesUrl + 'refresh');
    });
});
