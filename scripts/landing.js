// Changes the colour of the body when called
function change_colours() {
    // Used built in DOM this time cos its way too short to make jQ worth it
    if (document.body.className == 'body-pink')
        document.body.className = 'body-black';
    else
        document.body.className = 'body-pink';
}
