var player;

$(document).ready(() => {
    player = new audioPlayer('#audioPlayer');
    ajaxAction('List', (data) => { player.loadPlaylist(data) });
});

function ajaxAction(actionName, callback) {
    var ajaxOptions = {
        url: '/PilotStream/' + actionName
    };
    if (callback !== undefined) {
        ajaxOptions.success = callback;
    }
    else {
        ajaxOptions.success = ajaxOnSuccess;
    }

    $.ajax(ajaxOptions);
}

function ajaxOnSuccess(value) {
    console.info('ajax action: ' + value);
}