/**
 * Created by Jordi Puigdellívol<jordi.p@revo.works> on 29/12/2015.
 * JQuery plugin for dymo ticket editor
 *
 * Patches and suggestions are welcome
 *
 * (c) 2016 - Revo Systems http://revo.works
 */

var DYMO_ORIENTATION_LANDSCAPE  = 'Landscape';
var DYMO_ORIENTATION_PORTRAIT   = 'Portrait';

var DYMO_PAPER_ADDRESS          = "30252 Address";
var DYMO_PAPER_FILEFOLDER       = "30327 File Folder – offset";
var DYMO_PAPER_SHIPPING         = "30256 Shipping"; //Default

var DYMO_PIXEL_TO_INCH          = 12;

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
        var currentObject;
        var selectedPaper       = DYMO_PAPER_SHIPPING;
        var selectedOrientation = DYMO_ORIENTATION_LANDSCAPE;
        var printValues         = {};

        //-----------
        //Functions
        //-----------
        this.toggleOrientation      = function ()       { toggleOrientation(this);         return this; }
        this.selectPaper            = function (paper)  { selectPaper(this,paper);         return this; }
        this.exportXML              = function ()       { return exportXML(this);                       }
        this.addObject              = function (type)   { addObject(this,type);            return this; }
        this.hidePopup              = function ()       { hidePopup(this);                 return this; }
        this.removeSelectedObject   = function ()       { removeSelectedObject(this);      return this; }
        this.updateObjectText       = function ()       { updateObjectText(this);          return this; }
        this.print                  = function (values) { print(this,values);              return this; }

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
        values: [],
    };

    //========================================================================
    // INTI
    //========================================================================
    function init(element){
        element.editor = $('#dymoEditor');
        element.editor.css('width','450px');
        element.editor.css('height','235px');

        createPopup(element);
    }

    function createPopup(element){
        element.popup = $('<div id="dymoEditorPopup">' +
                            "<input  id='popupInput'    type='text value='value' /> " +
                            "<select id='popupSelect' >" + getAvailableValueOptions(element) +"</select> " +
                            "<a      id='popupSave'     onClick='editor.updateObjectText()'>    <i class='fa fa-floppy-o'></i></a> " +
                            "<a      id='popupRemove'   onClick='editor.removeSelectedObject()'><i class='fa fa-trash'></i></a> " +
                            "<a      id='popupClose'    onClick='editor.hidePopup()'>           <i class='fa fa-times-circle'></i></a> " +
                          '</div>');
        element.editor.parent().append(element.popup);
    }

    function getAvailableValueOptions(element){
        var options = "";
        element.settings.values.forEach(function(entry) {
            options = options + "<option value="+ entry +">"    + entry   +"</option>";
        });
        return options;
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

    function selectPaper(element, paper){
        if(paper == DYMO_PAPER_ADDRESS){
            element.editor.animate({
                height  : 100,
                width   : 250
            });
        }

        element.selectedPaper = paper;
    }

    function print(element,values){
        element.printValues = values;
        element.exportXML();
    }

    function addObject(element, type){
        var object;
        if(type == 'text'){
            object = $('<div type="text"><div>Click to enter text</div></div>');
            object.css('width' ,'100px');
            object.css('height','50px');
        }
        else if(type == 'value'){
            object = $('<div type="value"><div>--</div></div>');
            object.css('width' ,'100px');
            object.css('height','50px');
        }
        else if(type == 'barcode'){
            object = $('<div type="barcode" class="dymoEditorBarcodeObject"><div>|| | |||| ||| | |||| ||| | |||| ||| | |||| </div></div>');
            object.css('width' ,'300px');
            object.css('height','50px');
            object.attr('text','barcode')
        }

        element.editor.append(object);
        object.addClass ('dymoEditorObject');
        object.draggable({containment: "parent", grid: [ 5, 5 ]});
        object.resizable({containment: "parent", grid: [ 5, 5 ], addClasses: false});


        object.click(function(){
            showPopup(element, object);
        });
    }

    function getObjectText(object){
        var type = object.attr('type');
        if(type == 'text') {
            return object.children().first().text();
        }
        else if(type == 'barcode'){
            return object.attr('text');
        }
        return "";
    }

    function updateObjectText(element){
        var objectType      = element.currentObject.attr("type");

        if(objectType == "text") {
            element.currentObject.children().first().text($('#popupInput').val());
        }
        else if(objectType == "value"){
            element.currentObject.attr('value',$('#popupSelect').val());
            element.currentObject.children().first().text("{" + $('#popupSelect').val() + "}");
        }
        else if(objectType == 'barcode'){
            element.currentObject.attr('text',$('#popupInput').val());
        }
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
        var popupSelect     = $('#popupSelect').hide();
        var popupSave       = $('#popupSave').hide();

        if(objectType == 'text') {
            popupInput.show();
            popupInput.val(getObjectText(object));
            popupSave.show();
        }
        else if(objectType == 'value') {
            popupSelect.show();
            popupSave.show();
        }
        else if(objectType == 'barcode'){
            popupInput.show();
            popupInput.val(getObjectText(object));
            popupSave.show();
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
                    '<PaperName>30256 Shipping</PaperName>' +
                    '<DrawCommands/>';

        element.editor.children().each(function(){
            xml = xml + exportObjectXml(element,$(this));
        });


        xml = xml + '</DieCutLabel>';

        console.log(xml);

        return xml;
    }

    function exportObjectXml(element,object){

        var type    = object.attr("type");

        var x       = (object.position().left - object.parent().position().left)* DYMO_PIXEL_TO_INCH + 160;
        var y       = (object.position().top  - object.parent().position().top) * DYMO_PIXEL_TO_INCH + 100;
        var width   = object.width()         * DYMO_PIXEL_TO_INCH;
        var height  = object.height()        * DYMO_PIXEL_TO_INCH;
        var text    = getObjectText(object);

        console.log("Object position:" + object.position().left + " - " + object.position().top + "-" + width + "-" + height);
        console.log("Parent position:" + object.parent().position().left + " - " + object.parent().position().top );
        console.log("Final  position:" + (object.position().left - object.parent().position().left) + " - " + (object.position().top - object.parent().position().top) + "-" + width + "-" + height);
        console.log("Final. position:" + x + " - " + y + "-" + width + "-" + height);
        console.log("---");


        if(type == 'text') {
            return '<ObjectInfo>\
                    <TextObject>\
                        <Name>Text</Name>\
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                        <LinkedObjectName></LinkedObjectName>\
                        <Rotation>Rotation0</Rotation>\
                        <IsMirrored>False</IsMirrored>\
                        <IsVariable>True</IsVariable>\
                        <HorizontalAlignment>Left</HorizontalAlignment>\
                        <VerticalAlignment>Top</VerticalAlignment>\
                        <TextFitMode>ShrinkToFit</TextFitMode>\
                        <UseFullFontHeight>False</UseFullFontHeight>\
                        <Verticalized>False</Verticalized>\
                        <StyledText>\
                            <Element>\
                                <String>' + text + '</String>\
                                    <Attributes>\
                                        <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                    </Attributes>\
                            </Element>\
                        </StyledText>\
                    </TextObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';
        }
        else if(type == 'barcode'){
            return '<ObjectInfo>\
                    <BarcodeObject>\
                        <Name>Barcode</Name>\
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                        <LinkedObjectName>BarcodeText</LinkedObjectName>\
                        <Rotation>Rotation0</Rotation>\
                        <IsMirrored>False</IsMirrored>\
                        <IsVariable>True</IsVariable>\
                        <Text>' + text + '</Text>\
                        <Type>Code128Auto</Type>\
                        <Size>Medium</Size>\
                        <TextPosition>Bottom</TextPosition>\
                        <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                        <CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                        <TextEmbedding>None</TextEmbedding>\
                        <ECLevel>0</ECLevel>\
                        <HorizontalAlignment>Center</HorizontalAlignment>\
                        <QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" />\
                    </BarcodeObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';
        }
        else if(type == 'value'){
            var valueId  = object.attr('value');
            var theValue = element.printValues[valueId];

            return '<ObjectInfo>\
                    <TextObject>\
                        <Name>Text</Name>\
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                        <LinkedObjectName></LinkedObjectName>\
                        <Rotation>Rotation0</Rotation>\
                        <IsMirrored>False</IsMirrored>\
                        <IsVariable>True</IsVariable>\
                        <HorizontalAlignment>Left</HorizontalAlignment>\
                        <VerticalAlignment>Top</VerticalAlignment>\
                        <TextFitMode>ShrinkToFit</TextFitMode>\
                        <UseFullFontHeight>False</UseFullFontHeight>\
                        <Verticalized>False</Verticalized>\
                        <StyledText>\
                            <Element>\
                                <String>' + theValue + '</String>\
                                    <Attributes>\
                                        <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                    </Attributes>\
                            </Element>\
                        </StyledText>\
                    </TextObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';

        }
    }

})( jQuery );