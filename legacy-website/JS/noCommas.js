function noCommas(e, t) {
    if (window.event)
    { var charCode = window.event.keyCode; }
    else if (e) { var charCode = e.which; }
    else { return true; }
    {
        if (charCode === 44)
            return false;
        else
            return true;
    }
    return true;
}