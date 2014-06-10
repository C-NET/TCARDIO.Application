// This global variable is where all the script goes so that
// it doesn't polute the global namespace
var MYAPP = MYAPP || {};
var listView;

MYAPP.run = (function() {
    // create the Kendo UI Mobile application
    MYAPP.app = new kendo.mobile.Application(document.body, {
        transition: "slide"
    });

    //Test para quitar de memoria 
    // window.localStorage.removeItem('eula-flag');
    
    /*Check EULA flag*/
    var eula = window.localStorage.getItem('eula-flag');

    if (eula == null || !eula) {
        MYAPP.app.navigate("#eula");
    }
    window.plugins.emailComposer = new EmailComposer();
});

MYAPP.call = function (operation, data, successFn, errorFn) {
    $.ajax({
        url: "http://localhost:3355/Auth.svc/" + operation,
        dataType: "jsonp",
        data: data,
        crossDomain: true,
        type: "POST",   
        username: null,
        password: null,
        timeout: 10000, //10 segundos de TO
        success: successFn,
        error: errorFn
    });

};


MYAPP.acceptEULA = function (code) {
    
    window.localStorage.setItem('eula-flag', true);
    MYAPP.app.navigate("#home");
    //COMENTADO PARA USAR EN EL TELEFONO
        //MYAPP.call(
        //    "Check",
        //    { code: code },
        //    function(result) {
        //        if (result == "OK") {
        //            window.localStorage.setItem('eula-flag', true);
        //            MYAPP.app.navigate("#home");
        //        } else {
        //            /* CODIGO INCORRECTO */
        //        }
        //    },
        //    function(result, error) {
        //        /* ERROR SERVICIO NO DISPONIBLE */
        //    }
        //);
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

    var now = new Date();
    var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("-"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(""), AddZero(now.getSeconds())].join("");
   
    window.plugins.emailComposer.showEmailComposer(title, 'Adjunto se encuentra una p\u00e1gina de un ensayo cl\u00ednico: ' + title + '\n' + subtitle, null, null, null, false, null, [['Articulo_' + strDateTime + '.html', encoded64]]);

};
//Pad given value to the left with "0"
function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
}

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
    $(".div-banner").hide();
};

MYAPP.showFooter = function () {
    $(".div-banner").show();
    $(".km-tabstrip").show();
};

MYAPP.scrollTop = function(e) {
    var scroller = e.view.scroller;
    scroller.reset();
};

//MYAPP.hideHeader = function () {
//    $(".km-header").hide();
//    $(".km-navbar").hide();
//};

//MYAPP.showHeader = function () {
//    $(".km-navbar").show();
//    $("km-header").show();
    
//};