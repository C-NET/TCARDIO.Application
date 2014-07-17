// This global variable is where all the script goes so that
// it doesn't polute the global namespace
var MYAPP = MYAPP || {};
var listView;

MYAPP.run = (function() {
    // create the Kendo UI Mobile application
    MYAPP.app = new kendo.mobile.Application(document.body, {
        initial: "#home",
        skin: "flat"
    });
    window.plugins.emailComposer = new EmailComposer();   
});


// this is called when the initial view shows. it prevents the flash
// of unstyled content (FOUC)
MYAPP.search = (function (e) {

    e.preventDefault();
    if(window.spinnerplugin != null)
        window.spinnerplugin.show();
    MYAPP.abstracts.read();
    if (MYAPP.abstracts.total() > 0) {
        MYAPP.app.navigate("#articulos");
        if (listView == null)
            listView = $('#result-list').data("kendoMobileListView");
        listView.refresh();
        //ORDENAMIENTO
        var indice = $("#buttongroup").data("kendoMobileButtonGroup").selectedIndex;
        //Si esta chequeada la categoria
        if (indice == 0) {
            MYAPP.abstracts.group({ field: "category" });
        }
        //Si esta chequeado el titulo
        else if (indice== 1) {
            MYAPP.abstracts.sort({ field: "title", dir: "asc" });
            MYAPP.abstracts.group([]);
            //CORRECION BUG DE KENDO 
            $('#result-list').removeClass("km-listgroup");
            $('#result-list').addClass("km-list");
            /////////////////////////
        }       
        //Si esta chequeado el acronimo
       else if (indice == 2) {
            MYAPP.abstracts.group({ field: "subtitle" });
            MYAPP.abstracts.filter({ field: "subtitle", operator: "neq", value: "" });
        }
    }
    else {        
        MYAPP.app.navigate("#NotFound");
    }
    if (window.spinnerplugin != null)
        window.spinnerplugin.hide();
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

//FILTRA LOS ARTICULOS POR BÚSQUEDA
MYAPP.abstracts = new kendo.data.DataSource({
    transport: {
        read: function (options) {            
            var categoryCodes = 0;
            //Recorro los checkbox de categorías
            for (var k = 0; k < 9; k++)
            {
                //Si está chequeado agrego la categoría a categoryCodes.
                if ($("#chkCat"+k)[0].checked)
                    categoryCodes |= (1 << (4+k));
            }
            // Retorna las páginas que coinciden.

            var data = MYAPP.find($(".search-text").val(), categoryCodes);
            options.success(data);
            
        } 
    }   
});

//FUNCIONALIDAD BOTÓN COMPARTIR
MYAPP.sendMail = function (e) {
    var data = e.button.data();
    var now = new Date();
    //Concatena día, fecha, hora, segundos
    var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("-"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(""), AddZero(now.getSeconds())].join("");   
    var asunto = 'Abstract de terape\u00fatica cardiovascular';
    var cuerpo = 'Adjunto el siguiente abstract de terap\u00e9utica cardiovascular que puede resultar de tu inter\u00e9s: ' + data.title + '\n\n Te recomiendo Cardio Trials, una aplicaci\u00f3n de Novartis Argentina que permite buscar y compartir todos los abstracts de la 9na edici\u00f3n de \"Trials de la Terap\u00e9utica Cardiovascular\". \n\n Podr\u00e1s descargar esta aplicaci\u00f3n en forma gratuita hasta el 31/03/2015 desde las Tiendas de Aplicaciones de Android (Google Play) y iOS (App Store).';
    window.plugins.emailComposer.showEmailComposer(asunto, cuerpo, null, null, null, false, null, [['Articulo_' + strDateTime + '.html', data.base64]]);
};
MYAPP.compartirAplicacion = function () {
    var asunto = 'Te recomiendo esta aplicaci\u00f3n!';
    var cuerpo = 'Te recomiendo Cardio Trials, una aplicaci\u00f3n de Novartis Argentina que permite buscar y compartir todos los abstracts de la 9na edici\u00f3n de \"Trials de la Terap\u00e9utica Cardiovascular\". \n\n Podr\u00e1s descargar esta aplicaci\u00f3n en forma gratuita hasta  el 31/03/2015 desde las Tiendas de Aplicaciones de Android (Google Play) y iOS (App Store).';
    window.plugins.emailComposer.showEmailComposer(asunto, cuerpo, null, null, null, false, null,null);
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
    // Recorre el índice
    for (var i = 0; i < idx.length; i++)
    {
        // Compara la categoria del grupo contra la categorías que se buscan
        if ((idx[i].cat & categories) != 0 && idx[i].key.indexOf(key) >= 0)
        {
            var count = idx[i].src.length;

            // Se agregan todos los subindices de los artículos sin repetir.
            for (var j = 0; j < count; j++)
            {
                var e = idx[i].src[j];

                // Si está repetido no se agrega
                if (match.indexOf(e) < 0)
                    match.push(e);
            }
        }
    }
    var data = [];
    //Filtra los artículos por categoría
    for (var i = 0; i < match.length; i++) {
        var art = MYAPP.src[match[i]];
        if ((art.categoryCode & categories) != 0)
            data.push(art);
    }

    return data;
};

MYAPP.cambiarArticulo = function (indice, direccion) {
    if (indice < 0 || indice > 510) return false;
    MYAPP.app.navigate("\#abstracts/" + MYAPP.src[indice].article, 'slide:'+direccion);
};

//Obtiene el nombre de la categoría mediante el código.
MYAPP.getCategoryName = function (categoryCode) {
    var cat = MYAPP.cat;

    for (var i = 0; i < cat.length; i++)
        if (cat[i].id == categoryCode)
            return cat[i].desc;

    return ";"
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

MYAPP.navigateToArticle = function (article)
{
    MYAPP.app.navigate(article);
}


MYAPP.scrollTop = function (e) {
    e.preventDefault();
    var scroller = e.view.scroller;
    scroller.reset(); 
};

MYAPP.hideFooter = function (e) {
    $(".km-tabstrip").hide();
};

MYAPP.showFooter = function (e) {
    $(".km-tabstrip").show();
};

function seleccionarRadioButton() {
    var buttongroup = $("#buttongroup").data("kendoMobileButtonGroup");
    // selects by jQuery object
    buttongroup.select(buttongroup.element.children().eq(0));
    // selects by index
    buttongroup.select(0);
}


/*Lista Indice Principal*/
function indexListviewInit() {
    if (window.spinnerplugin != null)
        window.spinnerplugin.show();
    $("#indexListview").kendoMobileListView({
        dataSource: new kendo.data.DataSource({
            data: MYAPP.src,
            serverPaging: true,
            serverSorting: true,
            pageSize:50
        }),
        template: $("#item-template-index").text(),
       // virtualViewSize: 40, // needed setting, since local data virtualization does not use paging
        endlessScroll: true
    });
}

function refrescarLista() {
    if (window.spinnerplugin != null)
        window.spinnerplugin.show();
    var listview = $("#indexListview").data("kendoMobileListView");
    listview.dataSource.page(0); //request the first page
    listview.scroller().reset(); //reset the scroller
    if (window.spinnerplugin != null)
        window.spinnerplugin.hide();
}

