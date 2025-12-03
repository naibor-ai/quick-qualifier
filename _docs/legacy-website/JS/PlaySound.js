
    var soundObject = null;
    function PlaySound() {
        if (soundObject != null) {
            document.body.removeChild(soundObject);
            soundObject.removed = true;
            soundObject = null;}
        soundObject = document.createElement("embed");
        soundObject.setAttribute("src", "../sounds/click.wav");
        soundObject.setAttribute("hidden", true);
        soundObject.setAttribute("autostart", true);
        document.body.appendChild(soundObject);}
    