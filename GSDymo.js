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
var DYMO_PAPER_SHIPPING         = "30256 Shipping";
var DYMO_PAPER_RETURN           = "11352 Return Address Int";

var DYMO_ANIMATION_TIME         = 400;

var dymo_papers = {
    '30252 Address' : {
        'width'         : 375,
        'height'        : 95,
        'pixel_to_inch' : 13,
    },
    '30327 File Folder – offset' :{
        'width'         : 450,
        'height'        : 235,
        'pixel_to_inch' : 12,
    },
    '30256 Shipping' : {
        'width'         : 250,
        'height'        : 100,
        'pixel_to_inch' : 12,
    },
    '11352 Return Address Int' : {
        'width'         : 235,
        'height'        : 105,
        'pixel_to_inch' : 12,
    }
};


function startupCode() {
    console.log("Dymo connected");
}

function frameworkInitHelper() {
    dymo.label.framework.init(startupCode);
}
window.onload = frameworkInitHelper;

//-----------------------
// TICKET EDITOR PLUGIN
//-----------------------
;(function ( $ ) {

    //========================================================================
    // INIT
    //========================================================================
    $.fn.dymoEditor = function(options, json) {

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

        var printValues             = {};

        //-----------
        //Functions
        //-----------
        this.toggleOrientation      = function ()       { toggleOrientation(this);         return this; }
        this.selectPaper            = function (paper)  { selectPaper(this,paper,true);    return this; }
        this.exportXML              = function ()       { return exportXML(this);                       }
        this.exportJSON             = function ()       { return exportJSON(this);                      }
        this.loadJSON               = function (json)   { return loadJSON(this,json);      return this; }
        this.addObject              = function (type)   { addObject(this,type);            return this; }
        this.hidePopup              = function ()       { hidePopup(this);                 return this; }
        this.removeSelectedObject   = function ()       { removeSelectedObject(this);      return this; }
        this.updateObjectText       = function ()       { updateObjectText(this);          return this; }
        this.setAlign               = function (align)  { setAlign(this,align);            return this; }
        this.toggleBold             = function ()       { toggleBold(this);                return this; }
        this.print                  = function (values) { print(this,values);              return this; }

        //-----------
        // Init
        //-----------
        init(this);
        loadJSON(this,json);
        return this;
    }


    //========================================================================
    // Plugin defaults – added as a property on our plugin function.
    //========================================================================
    $.fn.dymoEditor.defaults = {
        paper       : DYMO_PAPER_ADDRESS,
        orientation : DYMO_ORIENTATION_LANDSCAPE,
        fontFamilies: ['Arial','Times New Roman','Helvetica Neue','Calibri'],
        fontSizes   : ['12px','14px','16px','18px','20px','22px','24px','26px','28px','30px'],
        barcodeSizes: ['Small','Medium','Large'],
        values      : [],
    };

    //========================================================================
    // INTI
    //========================================================================
    function init(element){

        element.editor = $('#dymoEditor');
        element.editor.css('width', dymo_papers[element.settings.paper].width);
        element.editor.css('height',dymo_papers[element.settings.paper].height);

        element.selectedPaper       = element.settings.paper;
        element.selectedOrientation = element.settings.orientation;

        createPopup(element);
    }

    function createPopup(element){
        element.popup = $('<div id="dymoEditorPopup">' +
            "<input  id='popupInput'    type='text value='value' /> " +
            "<select id='popupSelect' >"        + getAvailableValueOptions(element) +"</select> " +
            "<select id='popupFont' >"          + getAvailableFontOptions(element)  +"</select> " +
            "<select id='popupSize' >"          + getAvailableSizeOptions(element)  +"</select> " +
            "<select id='popupBarcodeSize' >"   + getAvailableBarcodeSizeOptions(element)  +"</select> " +
            "<a      id='popupSave'         onClick='editor.updateObjectText()'>        <i class='fa fa-floppy-o'></i></a> " +
            "<a      id='popupBold'         onClick='editor.toggleBold()'>              <i class='fa fa-bold'></i></a> " +
            "<a      id='popupAlignLeft'    onClick='editor.setAlign(\"left\")'>        <i class='fa fa-align-left'></i></a> " +
            "<a      id='popupAlignCenter'  onClick='editor.setAlign(\"center\")'>      <i class='fa fa-align-center'></i></a> " +
            "<a      id='popupAlignRight'   onClick='editor.setAlign(\"right\")'>       <i class='fa fa-align-right'></i></a> " +
            "<a      id='popupRemove'       onClick='editor.removeSelectedObject()'>    <i class='fa fa-trash'></i></a> " +
            "<a      id='popupClose'        onClick='editor.hidePopup()'>               <i class='fa fa-times-circle'></i></a> " +
            '</div>');
        element.editor.parent().append(element.popup);

        $( "#popupSelect" )         .change(function() {  updateObjectText(element);                 });
        $( "#popupFont" )           .change(function() {  updateObjectFormat(element,'font');        });
        $( "#popupSize" )           .change(function() {  updateObjectFormat(element,'size');        });
        $( "#popupBarcodeSize" )    .change(function() {  updateObjectFormat(element,'barcodeSize');        });
    }

    function getAvailableValueOptions(element){
        var options = "";
        element.settings.values.forEach(function(entry) {
            options = options + "<option value="+ entry +">"    + entry   +"</option>";
        });
        return options;
    }

    function getAvailableFontOptions(element){
        var options = "";
        element.settings.fontFamilies.forEach(function(entry) {
            options = options + "<option value="+ entry +">"    + entry   +"</option>";
        });
        return options;
    }

    function getAvailableSizeOptions(element){
        var options = "";
        element.settings.fontSizes.forEach(function(entry) {
            options = options + "<option value="+ entry +">"    + entry   +"</option>";
        });
        return options;
    }

    function getAvailableBarcodeSizeOptions(element){
        var options = "";
        element.settings.barcodeSizes.forEach(function(entry) {
            options = options + "<option value="+ entry +">"    + entry   +"</option>";
        });
        return options;
    }

    //--------------------------------------------------------------------------------------------
    // PAPER
    //--------------------------------------------------------------------------------------------
    function toggleOrientation(element){
        var oldHeight   = element.editor.css('height');
        var oldWidth    = element.editor.css('width');

        element.editor.animate({
            height  : oldWidth,
            width   : oldHeight
        }, DYMO_ANIMATION_TIME, function() {
            // Animation complete.
        });

        if(element.selectedOrientation == DYMO_ORIENTATION_LANDSCAPE)   element.selectedOrientation = DYMO_ORIENTATION_PORTRAIT;
        else                                                            element.selectedOrientation = DYMO_ORIENTATION_LANDSCAPE;
    }

    function selectPaper(element, paper, animated){

        element.selectedOrientation = DYMO_ORIENTATION_LANDSCAPE;
        element.selectedPaper       = paper;

        var w = dymo_papers[paper].width;
        var h = dymo_papers[paper].height;

        if(animated) {
            element.editor.animate({width: w, height: h}, DYMO_ANIMATION_TIME);
        }
        else{
            element.editor.width    (w);
            element.editor.height   (h);
        }

    }

    function setOrientation(element,orientation){
        if(orientation == DYMO_ORIENTATION_PORTRAIT){
            element.editor.width    (dymo_papers[element.selectedPaper].height);
            element.editor.height   (dymo_papers[element.selectedPaper].width);
        }
        else{
            element.editor.width    (dymo_papers[element.selectedPaper].width);
            element.editor.height   (dymo_papers[element.selectedPaper].height);
        }
        element.selectedOrientation = orientation;
    }

    //--------------------------------------------------------------------------------------------
    // PRINT
    //--------------------------------------------------------------------------------------------
    function print(element,values){
        try{
            element.printValues = values;
            var labelXml        = element.exportXML();


            var label    = dymo.label.framework.openLabelXml(labelXml);
            var printers = dymo.label.framework.getPrinters();
            if (printers.length == 0)
                throw "No DYMO printers are installed. Install DYMO printers.";

            // for simplicity sake just use the first LabelWriter printer
            var printerName = "";
            for (var i = 0; i < printers.length; ++i)
            {
                var printer = printers[i];
                if (printer.printerType == "LabelWriterPrinter")
                {
                    printerName = printer.name;
                    break;
                }
            }

            if (printerName == "")
                throw "No LabelWriter printers found. Install LabelWriter printer";

            // finally print the label
            label.print(printerName);
        }
        catch(e)
        {
            alert(e.message || e);
        }
    }

    //--------------------------------------------------------------------------------------------
    // ADD
    //--------------------------------------------------------------------------------------------
    function addObject(element, type){
        var object;
        if(type == 'text'){
            object = $('<div type="text"><div>Click to edit</div></div>');
            object.css('width' ,'100px');
            object.css('height','20px');
        }
        else if(type == 'value'){
            object = $('<div type="value"><div>--</div></div>');
            object.css('width' ,'100px');
            object.css('height','20px');
        }
        else if(type == 'barcode'){
            object = $('<div type="barcode" class="dymoEditorBarcodeObject"><div>|| | |||| ||| | |||| ||| | |||| ||| | |||| </div></div>');
            object.css('width' ,'300px');
            object.css('height','30px');
            object.attr('text','barcode');
            object.attr('barcodeSize','Medium');
        }
        else if(type == 'valueBarcode'){
            object = $('<div type="valueBarcode" class="dymoEditorBarcodeObject"><div>|| | |||| ||| | |||| ||| | |||| ||| | |||| </div></div>');
            object.css('width' ,'300px');
            object.css('height','30px');
            object.attr('barcodeSize','Medium');
        }

        element.editor.append(object);
        object.addClass ('dymoEditorObject');
        object.draggable({containment: "parent", grid: [ 5, 5 ]});
        object.resizable({/*containment: "parent",*/ grid: [ 5, 5 ], addClasses: false});


        object.click(function(){
            showPopup(element, object);
        });

        return object;
    }

    //--------------------------------------------------------------------------------------------
    // UPDATE
    //--------------------------------------------------------------------------------------------
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

    function getObjectValue(object){
        return object.attr('value');
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
        else if(objectType == 'valueBarcode'){
            element.currentObject.attr('value',$('#popupSelect').val());
        }
    }

    function updateObjectFormat(element, format){
        if(format == 'font'){
            element.currentObject.css('font-family',$('#popupFont').val());
        }
        else if(format == 'size'){
            element.currentObject.css('font-size',$('#popupSize').val());
        }
        else if(format == 'barcodeSize'){
            var size = $('#popupBarcodeSize').val();
            element.currentObject.attr('barcodeSize',$('#popupBarcodeSize').val());

            if      (size == 'Small')    element.currentObject.css('font-size','20px');
            else if (size == 'Medium')   element.currentObject.css('font-size','24px');
            else if (size == 'Large')    element.currentObject.css('font-size','35px');
        }
    }

    function setAlign(element,align){
        element.currentObject.css('text-align',align);
    }

    function toggleBold(element){
        if(element.currentObject.css('font-weight') == 'bold'){
            element.currentObject.css('font-weight','normal');
        }
        else{
            element.currentObject.css('font-weight','bold');
        }
    }

    function removeSelectedObject(element){
        element.currentObject.remove();
        hidePopup(element);
    }

    //--------------------------------------------------------------------------------------------
    // SHOW POPUP
    //--------------------------------------------------------------------------------------------
    function showPopup(element, object){
        element.currentObject = object;
        element.popup.css('display','block');
        element.popup.css('top', object.position().top);
        element.popup.css('left',element.editor.css('width') );


        var objectType          = object.attr("type");
        var popupInput          = $('#popupInput')      .hide();
        var popupSelect         = $('#popupSelect')     .hide();
        var popupSave           = $('#popupSave')       .hide();
        var popupAlignLeft      = $('#popupAlignLeft')  .hide();
        var popupAlignCenter    = $('#popupAlignCenter').hide();
        var popupAlignRight     = $('#popupAlignRight') .hide();
        var popupBold           = $('#popupBold')       .hide();
        var popupFont           = $('#popupFont')       .hide();
        var popupSize           = $('#popupSize')       .hide();
        var popupBarcodeSize    = $('#popupBarcodeSize').hide();

        if(objectType == 'text') {
            popupInput  .show();    popupInput  .val(getObjectText(object));
            popupSave   .show();
            popupAlignLeft.show();  popupAlignCenter.show();                     popupAlignRight.show();    popupBold.show();
            popupFont   .show();    popupFont.val(object.css('font-family'));    popupSize.show();          popupSize.val(object.css('font-size'));
        }
        else if(objectType == 'value') {
            popupSelect .show();    popupSelect .val(getObjectValue(object));
            popupSave   .show();
            popupAlignLeft.show();  popupAlignCenter.show();                     popupAlignRight.show();    popupBold.show();
            popupFont   .show();    popupFont.val(object.css('font-family'));    popupSize.show();          popupSize.val(object.css('font-size'));
        }
        else if(objectType == 'barcode'){
            popupInput      .show();    popupInput.val(getObjectText(object));
            popupBarcodeSize.show();    popupBarcodeSize.val(object.attr('barcodeSize'));
            popupSave       .show();
        }
        else if(objectType == 'valueBarcode'){
            popupSelect     .show();    popupSelect .val(getObjectValue(object));
            popupBarcodeSize.show();    popupBarcodeSize.val(object.attr('barcodeSize'));
        }
    }

    function hidePopup(element){
        element.popup.css('display','none');
        element.currentObject = null;
    }

    //--------------------------------------------------------------------------------------------
    // EXPORT XML
    //--------------------------------------------------------------------------------------------
    function exportXML(element){
        var xml = '<?xml version="1.0" encoding="utf-8"?>' +
            '<DieCutLabel Version="8.0" Units="twips">';

        xml = xml + '<PaperOrientation>' + element.selectedOrientation +'</PaperOrientation>'+
            '<Id>Address</Id>' +
            '<PaperName>' + element.selectedPaper + '</PaperName>' +
            '<DrawCommands/>';

        element.editor.children().each(function(){
            xml = xml + exportObjectXml(element,$(this));
        });


        xml = xml + '</DieCutLabel>';

        console.log(xml);

        return xml;
    }

    function exportObjectXml(element,object){

        var type            = object.attr("type");

        var PIXEL_TO_INCH   = dymo_papers[element.selectedPaper].pixel_to_inch;

        var x               = (object.position().left - object.parent().position().left)* PIXEL_TO_INCH + 160;
        var y               = (object.position().top  - object.parent().position().top) * PIXEL_TO_INCH + 100;
        var width           = object.width()         * PIXEL_TO_INCH;
        var height          = object.height()        * PIXEL_TO_INCH;

        var text            = getObjectText(object);
        var fontFamily      = object.css('font-family');
        var fontSize        = parseInt(object.css('font-size')) * PIXEL_TO_INCH;
        var isBold          = (object.css('font-weight') == 'bold')?'True':'False';
        var textAlign       = object.css('text-align');
        var barcodeSize     = object.attr('barcodeSize');

        textAlign = textAlign.charAt(0).toUpperCase() + textAlign.slice(1); //Capitalize
        if(textAlign == 'Start') textAlign = 'Left';

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
                        <HorizontalAlignment>' + textAlign + '</HorizontalAlignment>\
                        <VerticalAlignment>Top</VerticalAlignment>\
                        <TextFitMode>ShrinkToFit</TextFitMode>\
                        <UseFullFontHeight>False</UseFullFontHeight>\
                        <Verticalized>False</Verticalized>\
                        <StyledText>\
                            <Element>\
                                <String>' + text + '</String>\
                                    <Attributes>\
                                        <Font Family="' + fontFamily + '" Size="' + fontSize + '" Bold="'+isBold+'" Italic="False" Underline="False" Strikeout="False" />\
                                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                    </Attributes>\
                            </Element>\
                        </StyledText>\
                    </TextObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';
        }
        else if(type == 'barcode'){
            fontSize = fontSize/2;

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
                        <Size>' + barcodeSize + '</Size>\
                        <TextPosition>Bottom</TextPosition>\
                        <TextFont Family="' + fontFamily + '" Size="' + fontSize + '" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                        <CheckSumFont Family="' + fontFamily + '" Size="' + fontSize + '" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
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
            var theValue = '--';
            try {
                theValue = element.printValues[valueId];
            }catch(e){}

            return '<ObjectInfo>\
                    <TextObject>\
                        <Name>Text</Name>\
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                        <LinkedObjectName></LinkedObjectName>\
                        <Rotation>Rotation0</Rotation>\
                        <IsMirrored>False</IsMirrored>\
                        <IsVariable>True</IsVariable>\
                        <HorizontalAlignment>' + textAlign + '</HorizontalAlignment>\
                        <VerticalAlignment>Top</VerticalAlignment>\
                        <TextFitMode>ShrinkToFit</TextFitMode>\
                        <UseFullFontHeight>False</UseFullFontHeight>\
                        <Verticalized>False</Verticalized>\
                        <StyledText>\
                            <Element>\
                                <String>' + theValue + '</String>\
                                    <Attributes>\
                                        <Font Family="' + fontFamily + '" Size="' + fontSize + '" Bold="' + isBold + '" Italic="False" Underline="False" Strikeout="False" />\
                                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                    </Attributes>\
                            </Element>\
                        </StyledText>\
                    </TextObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';
        }
        else if(type == 'valueBarcode'){
            fontSize = fontSize/2;
            var valueId  = object.attr('value');
            var theValue = "--";
            try {
                theValue = element.printValues[valueId];
            }catch(e){}

            return '<ObjectInfo>\
                    <BarcodeObject>\
                        <Name>Barcode</Name>\
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                        <LinkedObjectName>BarcodeText</LinkedObjectName>\
                        <Rotation>Rotation0</Rotation>\
                        <IsMirrored>False</IsMirrored>\
                        <IsVariable>True</IsVariable>\
                        <Text>' + theValue + '</Text>\
                        <Type>Code128Auto</Type>\
                        <Size>' + barcodeSize + '</Size>\
                        <TextPosition>Bottom</TextPosition>\
                        <TextFont Family="' + fontFamily + '" Size="' + fontSize + '" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                        <CheckSumFont Family="' + fontFamily + '" Size="' + fontSize + '" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                        <TextEmbedding>None</TextEmbedding>\
                        <ECLevel>0</ECLevel>\
                        <HorizontalAlignment>Center</HorizontalAlignment>\
                        <QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" />\
                    </BarcodeObject>\
                    <Bounds X="' + x + '" Y="' + y + '" Width="' + width + '" Height="' + height + '" />\
                </ObjectInfo>';
        }
    }


    //--------------------------------------------------------------------------------------------
    // EXPORT JSON
    //--------------------------------------------------------------------------------------------
    function exportJSON(element){

        var exported = {
            paper       : element.selectedPaper,
            orientation : element.selectedOrientation,
            objects     : []
        };


        element.editor.children().each(function(){
            exported.objects.push( exportObjectJSON(element,$(this)) );
        });

        var jsonString = JSON.stringify(exported);
        console.log(jsonString);
        return jsonString;
    }

    function exportObjectJSON(element,object){
        var exportedObject      = {};
        var type                = object.attr('type');
        exportedObject.type     = type;

        exportPosition(exportedObject,object);

        if(type == 'text'){
            exportAttributes(exportedObject,object);
            exportedObject.text         = getObjectText(object);
        }
        else if(type=='value'){
            exportAttributes(exportedObject,object);
            exportedObject.text         = getObjectText(object);
            exportedObject.valueId      = getObjectValue(object);
        }
        else if(type=='barcode'){
            exportedObject.text         = getObjectText(object);
            exportedObject.barcodeSize  = object.attr('barcodeSize');
        }
        else if(type=='valueBarcode'){
            exportedObject.valueId      = getObjectValue(object);
            exportedObject.barcodeSize  = object.attr('barcodeSize');
        }

        return exportedObject;
    }

    function exportPosition(exportedObject, object){
        exportedObject.x            = object.position().left - object.parent().position().left ;
        exportedObject.y            = object.position().top  - object.parent().position().top ;
        exportedObject.width        = object.width();
        exportedObject.height       = object.height();
    }

    function exportAttributes(exportedObject, object){
        exportedObject.align        = object.css('text-align');
        exportedObject.bold         = object.css('font-weight') == 'bold';
        exportedObject.fontSize     = object.css('font-size');
        exportedObject.fontFamily   = object.css('font-family');
    }

    //--------------------------------------------------------------------------------------------
    // LOAD JSON
    //--------------------------------------------------------------------------------------------
    function loadJSON(element,json){

        for(i = 0; i< json.objects.length; i++){

            var jobject = json.objects[i];
            var object  = addObject(element, jobject .type);

            object.css('left',  object.parent().position().left + jobject.x);
            object.css('top',   object.parent().position().top + jobject.y);
            object.css('width', jobject.width);
            object.css('height',jobject.height);

            if(jobject.type == 'text'){
                object.children().first().text(jobject.text);
                loadJSONAttributes(object,jobject);
            }
            else if(jobject.type == 'value'){
                object.attr('value',jobject.valueId);
                object.children().first().text("{" + jobject.valueId + "}");
                loadJSONAttributes(object,jobject);
            }
            else if(jobject.type == 'barcode'){
                loadJSONBarcodeSize(object,jobject);
            }
            else if(jobject.type == 'valueBarcode'){
                loadJSONBarcodeSize(object,jobject);
                object.attr('value',jobject.valueId);
            }
        }

        selectPaper     (element, json.paper, false);
        setOrientation  (element, json.orientation);
    }

    function loadJSONAttributes(object,jobject){
        object.css('text-align',    jobject.align);
        object.css('font-family',   jobject.fontFamily);
        object.css('font-size',     jobject.fontSize);
        if(jobject.bold) object.css('font-weight','bold');
    }

    function loadJSONBarcodeSize(object,jobject){
        object.attr('barcodeSize',jobject.barcodeSize);
        if      (jobject.barcodeSize== 'Small')    object.css('font-size','20px');
        else if (jobject.barcodeSize== 'Medium')   object.css('font-size','24px');
        else if (jobject.barcodeSize == 'Large')   object.css('font-size','35px');
    }

})( jQuery );