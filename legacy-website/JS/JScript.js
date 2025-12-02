var ddlText, ddlValue, ddl;
function CacheItems(listBoxId) 
{ddlText = new Array(); ddlValue = new Array(); ddl = document.getElementById(listBoxId);
for (var i = 0; i < ddl.options.length; i++) { ddlText[ddlText.length] = ddl.options[i].text; ddlValue[ddlValue.length] = ddl.options[i].value;}} 
function FilterItems(value) {ddl.options.length = 0; for (var i = 0; i < ddlText.length; i++) {if (ddlText[i].toLowerCase().indexOf(value) != -1) {AddItem(ddlText[i], ddlValue[i]);}}}
function AddItem(text, value) {var opt = document.createElement("option"); opt.text = text; opt.value = value; ddl.options.add(opt);}