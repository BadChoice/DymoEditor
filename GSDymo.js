/**
 * Created by badchoice on 29/12/15.
 */

var DYMO_ORIENTATION_LANDSCAPE = 'Landscape';
var DYMO_ORIENTATION_PORTRAIT  = 'Portrait';


//-----------------------
// TICKET EDITOR PLUGIN
//-----------------------
;(function ( $ ) {

    //========================================================================
    // INIT
    //========================================================================
    $.fn.dymoEditor = function(options) {
        //-----------
        // Default options
        //-----------

        this.settings   = $.extend({}, $.fn.dymoEditor.defaults, options);
        var settings    = this.settings;

        //-----------
        //Private variables
        //-----------
        var editor;

        //-----------
        //Functions
        //-----------
        this.toggleOrientation  = function (type) {            toggleOrientation(this);         return this; }
        this.exportXML          = function (type) {            exportXML(this);                 return this; }

        //-----------
        // Init
        //-----------
        init(this);
        return this;
    }


    //========================================================================
    // Plugin defaults – added as a property on our plugin function.
    //========================================================================
    $.fn.dymoEditor.defaults = {
        width:  "250px",
        height: "100px",
    };

    //========================================================================
    // INTI
    //========================================================================
    function init(element){
        element.editor = $('#dymoEditor');
    }

    //========================================================================
    // FUNCTIONS
    //========================================================================
    function toggleOrientation(element){
        console.log("Toggle Orientation");
        var oldHeight   = element.editor.css('height');
        var oldWidth    = element.editor.css('width');

        element.editor.animate({
            height  : oldWidth,
            width   : oldHeight
        }, 1000, function() {
            // Animation complete.
        });
    }

    function exportXML(element){
        var xml = '<?xml version="1.0" encoding="utf-8"?>' +
                  '<DieCutLabel Version="8.0" Units="twips">';

        xml = xml + '<PaperOrientation>Landscape</PaperOrientation>'+
                    '<Id>Address</Id>' +
                    '<PaperName>30252 Address</PaperName>';


        xml = xml + '</DieCutLabel>';

        console.log(xml);
    }



})( jQuery );