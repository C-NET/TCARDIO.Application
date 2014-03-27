// This global variable is where all the script goes so that
// it doesn't polute the global namespace
var MYAPP = MYAPP || {};

MYAPP.run = (function () {
    // create the Kendo UI Mobile application
    MYAPP.app = new kendo.mobile.Application(document.body, { transition: "slide" });

    //Test 
    window.localStorage.removeItem('eula-flag');

    /*Check EULA flag*/
    var eula = window.localStorage.getItem('eula-flag');

    if (eula == null || !eula)
    {
        var win = $("#eula").data("kendoMobileModalView");

        //win.center();
        win.open();
    }
});

MYAPP.acceptEULA = function (code) {
    //Save EULA flag
    if (MYAPP.check(code)) {
        window.localStorage.setItem('eula-flag', true);

        $("#eula").data("kendoMobileModalView").close();
    }
}

MYAPP.refuseEULA = function () {
    navigator.app.exitApp();
}

// this is called when the intial view shows. it prevents the flash
// of unstyled content (FOUC)
MYAPP.showindex = (function () {
    MYAPP.abstracts.fetch();

    $(document.body).show();
});

// this function runs at startup and attaches to the 'deviceready' event
// which is fired by PhoneGap when the hardware is ready for native API
// calls. It is self invoking and will run immediately when this script file is 
// loaded.
(function () {
    if (navigator.userAgent.indexOf('Browzr') > -1) {
        // blackberry
        setTimeout(MYAPP.run, 250)
    } else {
        // attach to deviceready event, which is fired when phonegap is all good to go.
        document.addEventListener('deviceready', MYAPP.run, false);
    }
})();

var i = 0;

MYAPP.abstracts = new kendo.data.DataSource({
    transport: {
        read: function (options) {
            var max = 25;
            var data = [];

            for (var i = 0; i < max; i++) {
                data.push({
                    title: "record" + i,
                    subtitle: "test record" + i + " subtitle",
                    category: (i % 2 == 0 ? "Par" : "Impar"),
                    article: "test-abstract.html"
                });
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