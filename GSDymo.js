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
        var popup;
        var objects;
        var currentObject;


        //-----------
        //Functions
        //-----------
        this.toggleOrientation      = function ()     { toggleOrientation(this);         return this; }
        this.exportXML              = function ()     { exportXML(this);                 return this; }
        this.addObject              = function (type) { addObject(this,type);            return this; }
        this.hidePopup              = function ()     { hidePopup(this);                 return this; }
        this.removeSelectedObject   = function ()     { removeSelectedObject(this);      return this; }
        this.updateObjectText       = function ()     { updateObjectText(this);          return this; }

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
        element.editor.css('width','300px');
        element.editor.css('height','150px');

        createPopup(element);
    }

    function createPopup(element){
        element.popup = $('<div id="dymoEditorPopup">' +
                            "<input  id='popupInput'    type='text value='value' /> " +
                            "<a      id='popupSave'     onClick='editor.updateObjectText()'>    <i class='fa fa-floppy-o'></i></a> " +
                            "<a      id='popupRemove'   onClick='editor.removeSelectedObject()'><i class='fa fa-trash'></i></a> " +
                            "<a      id='popupClose'    onClick='editor.hidePopup()'>           <i class='fa fa-times-circle'></i></a> " +
        '</div>');
        element.editor.parent().append(element.popup);
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
            var textObject = $('<div type="text"><div>Click to enter text</div></div>');
            textObject.addClass('dymoEditorObject');
            textObject.css('width','100px');
            textObject.css('height','50px');
            element.editor.append(textObject);

            textObject.draggable({containment: "parent", grid: [ 5, 5 ]});
            textObject.resizable({containment: "parent", grid: [ 5, 5 ]});

            textObject.click(function(){
                showPopup(element, textObject);
            });
        }
    }

    function getObjectText(object){
        return object.children().first().text();
    }

    function updateObjectText(element){
        element.currentObject.children().first().text($('#popupInput').val());
    }

    function removeSelectedObject(element){
        element.currentObject.remove();
        hidePopup(element);
    }

    function showPopup(element, object){
        element.currentObject = object;
        element.popup.css('display','block');
        element.popup.css('top', object.position().top);
        element.popup.css('left',element.editor.css('width') );


        var objectType      = object.attr("type");
        var popupInput      = $('#popupInput').hide();

        if(objectType == 'text') {
            popupInput.show();
            popupInput.val(getObjectText(object));
        }

    }
    function hidePopup(element){
        element.popup.css('display','none');
        element.currentObject = null;
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