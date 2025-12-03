function onlyNos(e) 
{if (window.event)
    {var charCode = window.event.keyCode;}
    else if (e) { var charCode = e.which;}
    else { return true; }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) 
{if (charCode === 46 || charCode === 45)
    return true;
    else return false;}
return true;}
