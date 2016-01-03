# Dymo Label Editor

A JQuery Plugin to design and print Dymo labels developed initialy for [Revo](http://revo.works) web backend.

Elements required:
- JQuery  
- JQuery UI   
- Font Awesome (optional for icons)   

Right now, the `div` element to handle the editor must have as ID `dymoEditor`.


### Usage
For a complete sample check out the index.html

1. Import required libreries (for optimization, mix them into just one css and one js files


    <link rel="stylesheet" type="text/css" href="./GSDymo.css">
    <link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
        
    <script src = "https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src = "https://code.jquery.com/ui/1.11.3/jquery-ui.min.js"    type="text/javascript"></script>
    <script src = "http://labelwriter.com/software/dls/sdk/js/DYMO.Label.Framework.latest.js" type="text/javascript" charset="UTF-8"> </script>
    <script src = "./GSDymo.js" type="text/javascript" charset="UTF-8"> </script>



2. Initialize plugin (send an array of values keys available for the value object)


    <script>
        var editor;
        $(document).ready(function() {
            editor = $('dymoEditor').dymoEditor({'values':['ID','Price','Barcode']});
        });
    </script>


3. Add buttons for each action


    <button onClick="editor.toggleOrientation();">              Toggle Orientation</button>
    <button onClick="editor.selectPaper(DYMO_PAPER_ADDRESS);">                     Change size Address</button>
    <button onClick="editor.exportXML();">   Export XML</button>

    <br>
    <button onClick="editor.addObject('text');">Text</button>
    <button onClick="editor.addObject('value');">Value</button>
    <button onClick="editor.addObject('barcode');">Barcode</button>

4. Print (Send an array of values keys and its value to be printed 

    ```<button onClick="editor.print({'Price':'10€'});">Print</button>```
    
    