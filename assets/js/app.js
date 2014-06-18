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
    window.localStorage.removeItem('eula-flag');
    
    /*Check EULA flag*/
    var eula = window.localStorage.getItem('eula-flag');

    if (eula == null || !eula) 
        MYAPP.app.navigate("#eula");
    else
        MYAPP.app.navigate("#ListCategoriesView.html");
    
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

MYAPP.acceptEULA = function () {    
    window.localStorage.setItem('eula-flag', true);
    window.localStorage.setItem('eula-accept', true);
    MYAPP.app.navigate("#ListCategoriesView.html");
};
    
MYAPP.refuseEULA = function () {
    //navigator.app.exitApp();
    window.localStorage.setItem('eula-flag', true);
    window.localStorage.setItem('eula-accept', false);
    MYAPP.app.navigate("#ListCategoriesView.html");
};

// this is called when the initial view shows. it prevents the flash
// of unstyled content (FOUC)
MYAPP.search = (function () {
    MYAPP.app.navigate("#articulos");
    if (listView == null)
        listView = $('#result-list').data("kendoMobileListView");
    listView.refresh();
    MYAPP.abstracts.read();
    //ORDENAMIENTO
    if ($("#rbTitulo")[0].checked) {
        MYAPP.abstracts.sort({ field: "title", dir: "asc" });
        MYAPP.abstracts.group([]);
        //CORRECION BUG DE KENDO 
        $('#result-list').removeClass("km-listgroup");
        $('#result-list').addClass("km-list");
        /////////////////////////
    }
    if ($("#rbCategoria")[0].checked) {
        MYAPP.abstracts.group({ field: "category" });
       
    }
        if ($("#rbAcronimo")[0].checked)
    {
        MYAPP.abstracts.group({ field: "subtitle" });
        MYAPP.abstracts.filter({ field: "subtitle", operator: "neq", value: "" });
    }
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
    MYAPP.cat = MYAPP.getCategories();

})();

//FILTRA LOS ARTICULOS POR B�SQUEDA
MYAPP.abstracts = new kendo.data.DataSource({
    transport: {
        read: function (options) {
            var categoryCodes = 0;
            //Recorro los checkbox de categor�as
            for (var k = 0; k < 9; k++)
            {
                //Si est� chequeado agrego la categor�a a categoryCodes.
                if ($("#chkCat"+k)[0].checked)
                    categoryCodes |= (1 << (4+k));
            }
            // Retorna las p�ginas que coinciden.
            var data = MYAPP.find($("#search-text").val(), categoryCodes);
            options.success(data);
        } 
    }   
});

//DEVUELVE TODOS LOS ARTICULOS PARA EL INDIDCE GENERAL
MYAPP.showIndexList = new kendo.data.DataSource({
    transport: {
        read: function (options) {
            options.success(MYAPP.src);
        }
    },
    group: { field: "categoryCode" }
});


//FUNCIONALIDAD BOT�N COMPARTIR
MYAPP.sendMail = function (title, subtitle, encoded64) {

    var now = new Date();
    //Concatena d�a, fecha, hora, segundos
    var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("-"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(""), AddZero(now.getSeconds())].join("");
   
    window.plugins.emailComposer.showEmailComposer(title, 'Adjunto se encuentra una p\u00e1gina de un ensayo cl\u00ednico: ' + title + '\n' + subtitle, null, null, null, false, null, [['Articulo_' + strDateTime + '.html', encoded64]]);

};
//Pad given value to the left with "0"
function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
}


//BUSCA EL INDICE DEL ARTICULO DE LA PALABRA ENCONTRADA
MYAPP.find = function (key, categories) {
    var idx = MYAPP.idx;
 
    key = key.toLowerCase();

    var match = [];

    // Recorre el �ndice
    for (var i = 0; i < idx.length; i++)
    {
        // Compara la categoria del grupo contra la categor�as que se buscan
        if ((idx[i].cat & categories) != 0 && idx[i].key.indexOf(key) >= 0)
        {
            var count = idx[i].src.length;

            // Se agregan todos los subindices de los art�culos sin repetir.
            for (var j = 0; j < count; j++)
            {
                var e = idx[i].src[j];

                // Si est� repetido no se agrega
                if (match.indexOf(e) < 0)
                    match.push(e);
            }
        }
    }

    var data = [];
    //Filtra los art�culos por categor�a
    for (var i = 0; i < match.length; i++) {
        var art = MYAPP.src[match[i]];
        if ((art.categoryCode & categories) != 0)
            data.push(art);
    }

    return data;
};

MYAPP.cambiarArticulo = function (indice) {
    spinnerplugin.show();
    MYAPP.app.navigate("\#abstracts/" + MYAPP.src[indice].article);
};

//Obtiene el nombre de la categor�a mediante el c�digo.
MYAPP.getCategoryName = function (categoryCode) {
    var cat = MYAPP.cat;

    for (var i = 0; i < cat.length; i++)
        if (cat[i].id == categoryCode)
            return cat[i].desc;

    return "";
}

MYAPP.CheckAll = function (e) {
    // Listen for click on toggle checkbox
    if ($('#chkCatTodas')[0].checked) {
        // Iterate each checkbox
        $(':checkbox').each(function () {
            this.checked = true;
        });
    }
    else { // Iterate each checkbox 
        $(":checkbox").each(function () { this.checked = false; });
    }

}

MYAPP.navigateToArticle = function (article) {
    /*Chequeo si acepta compartir informacion con Novartis*/
    var eulaAceptado = window.localStorage.getItem('eula-accept');
    if (eulaAceptado == 'false')
        MYAPP.app.navigate("#eula");
    else
        MYAPP.app.navigate(article);
}

MYAPP.hideFooter = function (e) {
    $(".km-tabstrip").hide();
};

MYAPP.showFooter = function (e) {
    $(".km-tabstrip").show(); 
};

MYAPP.scrollTop = function(e) {
    var scroller = e.view.scroller;
    scroller.reset();c  
};



//CODIGO QUE PUEDO LLEGAR A NECESITAR: (BORRAR LUEGO)

//window.plugins.telephoneNumber.get(function (result) {
//    alert('re' + 'sult =' + result);
//}, function (error) {
//    alert('error = ' + error.code);
//});

//COMENTADO LLAMADA AJAX  A WEB SERVICE
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