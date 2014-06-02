// This global variable is where all the script goes so that
// it doesn't polute the global namespace
var MYAPP = MYAPP || {};
var listView;

MYAPP.run = (function () {
    // create the Kendo UI Mobile application
    MYAPP.app = new kendo.mobile.Application(document.body, { transition: "slide" });
   
    //Test 
    window.localStorage.removeItem('eula-flag');

    if (window.plugin != null && window.plugin.email != null) {
        alert("no es nulo");
        window.plugin.email.isServiceAvailable(
            function (isAvailable) {
                // alert('Email service is not available') unless isAvailable;
            });
    } else {
        alert('PLUGIN NULO'); 
    }

    /*Check EULA flag*/
    var eula = window.localStorage.getItem('eula-flag');

    if (eula == null || !eula) {

        MYAPP.app.navigate("#eula");
    }
});

MYAPP.acceptEULA = function (code) {
    //Save EULA flag
    if (MYAPP.check(code)) {
        window.localStorage.setItem('eula-flag', true);
        $(".km-tabstrip").show();
        MYAPP.app.navigate("#home");
    }
};
MYAPP.refuseEULA = function () {
    navigator.app.exitApp();
};
// this is called when the intial view shows. it prevents the flash
// of unstyled content (FOUC)
MYAPP.showindex = (function () {
    MYAPP.app.navigate("#index");
    if (listView == null)
        listView = $('#index-list').data("kendoMobileListView");
    listView.refresh();
    MYAPP.abstracts.read();
    
});

// this function runs at startup and attaches to the 'deviceready' event
// which is fired by PhoneGap when the hardware is ready for native API
// calls. It is self invoking and will run immediately when this script file is 
// loaded.
(function () {
    if (navigator.userAgent.indexOf('Browzr') > -1) {
        // blackberry
        setTimeout(MYAPP.run, 250);
    } else {
        // attach to deviceready event, which is fired when phonegap is all good to go.
        document.addEventListener('deviceready', MYAPP.run, false);
    }

    MYAPP.idx = MYAPP.getIndex();
    MYAPP.src = MYAPP.getData();

})();

MYAPP.abstracts = new kendo.data.DataSource({
    transport: {
        read: function (options) {
            // Retorna los subindices de las páginas que coinciden.
            var match = MYAPP.find($("#search-text").val());

            var data = [];

            for (var i = 0; i < match.length; i++) {
                data.push(MYAPP.src[match[i]]);
            }

            options.success(data);
        }
        
    },
    group: { field: "category" }
});

MYAPP.check = function (code) {
    var n = parseInt(code, 16);

    return code.length == 6 && ((n % 7) == 0);
};

MYAPP.sendMail = function (title, subtitle, encoded64) {
    //window.plugin.email.open({
    //    subject: title,
    //    body: 'Adjunto se encuentra una página de un ensayo clínico: ' + title + '\n' + subtitle,
    //    attachments: [encoded64]
    //});
    window.plugins.emailComposer.showEmailComposerWithCallback(callback, title, 'Adjunto se encuentra una página de un ensayo clínico: ' + title + '\n' + subtitle, '', '', '', true, '', '');
};
MYAPP.find = function (key) {
    var idx = MYAPP.idx;

    key = key.toLowerCase();

    for (var i = 0; i < idx.length; i++) {
        if (idx[i].key == key)
            return (idx[i].src);
    }

    return [];
};

MYAPP.hideFooter = function () {
    $(".km-tabstrip").hide();
};

MYAPP.hideHeader = function () {
    $(".km-navbar").hide();
};

MYAPP.showHeader = function () {
    $(".km-navbar").show();
};