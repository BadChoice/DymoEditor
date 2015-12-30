//----------------------------------------------------------------------------
//
//  $Id: PreviewAndPrintLabel.js 11419 2010-04-07 21:18:22Z vbuzuev $ 
//
// Project -------------------------------------------------------------------
//
//  DYMO Label Framework
//
// Content -------------------------------------------------------------------
//
//  DYMO Label Framework JavaScript Library Samples: Print label
//
//----------------------------------------------------------------------------
//
//  Copyright (c), 2010, Sanford, L.P. All Rights Reserved.
//
//----------------------------------------------------------------------------


(function()
{
    // called when the document completly loaded
    function onload()
    {
        var textTextArea    = document.getElementById('textTextArea');
        var printButton     = document.getElementById('printButton');

        // prints the label
        printButton.onclick = function()
        {
            try{
                // open label
                var labelXml = '<?xml version="1.0" encoding="utf-8"?>\
                <DieCutLabel Version="8.0" Units="twips">\
                    <PaperOrientation>Landscape</PaperOrientation>\
                    <Id>Address</Id>\
                    <PaperName>30256 Shipping</PaperName>\
                    <DrawCommands/>\
                    <ObjectInfo>\
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
                        <String>BARCODE</String>\
                            <Attributes>\
                                <Font Family="Arial" Size="12" Bold="False" Italic="False"\
                                         Underline="False" Strikeout="False" />\
                                    <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                </Attributes>\
                        </Element>\
                    </StyledText>\
                        </TextObject>\
                        <Bounds X="200" Y="300" Width="3000" Height="1000" />\
                    </ObjectInfo>\
                                        <ObjectInfo>\
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
                        <String>BARCODE</String>\
                            <Attributes>\
                                <Font Family="Arial" Size="12" Bold="False" Italic="False"\
                                         Underline="False" Strikeout="False" />\
                                    <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                                </Attributes>\
                        </Element>\
                    </StyledText>\
                        </TextObject>\
                        <Bounds X="200" Y="700" Width="3000" Height="1000" />\
                    </ObjectInfo>\
                </DieCutLabel>';

                labelXml = editor.exportXML();

                console.log(labelXml);

                var label = dymo.label.framework.openLabelXml(labelXml);

                // set label text
                //label.setObjectText("Text", textTextArea.value);

                // select printer to print on
                // for simplicity sake just use the first LabelWriter printer
                var printers = dymo.label.framework.getPrinters();
                if (printers.length == 0)
                    throw "No DYMO printers are installed. Install DYMO printers.";

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
    };

    // register onload event
    if (window.addEventListener)
        window.addEventListener("load", onload, false);
    else if (window.attachEvent)
        window.attachEvent("onload", onload);
    else
        window.onload = onload;

} ());