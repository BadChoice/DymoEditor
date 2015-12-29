/**
 * Created by Jordi Puigdellívol<jordi.p@revo.works> on 29/12/2015.
 * JQuery plugin for dymo ticket editor
 *
 * Patches and suggestions are welcome
 *
 * (c) 2016 - Revo Systems http://revo.works
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
        var objects;

        //-----------
        //Functions
        //-----------
        this.toggleOrientation  = function () {            toggleOrientation(this);         return this; }
        this.exportXML          = function () {            exportXML(this);                 return this; }
        this.addObject          = function (type) {        addObject(this,type);            return this; }

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

    function addObject(element, type){

        if(type == 'text'){
            textObject = $('<span type="text">a text</span>');
            textObject.addClass('dymoEditorObject');
            element.editor.append(textObject);
        }

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