var player;

//window['__onGCastApiAvailable'] = function (isAvailable) {
//    if (isAvailable) {
//        initializeCastApi();
//    }
//};

//initializeCastApi = function () {
//    cast.framework.CastContext.getInstance().setOptions({
//        androidReceiverCompatible: false,
//        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
//        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
//    });
//};

$(document).ready(() => {
    player = new audioPlayer('#audioPlayer');
    reloadPlaylist();
});

function reloadPlaylist() {
    ajaxAction('Info/-1', (data) => { player.emptySong = data; player.stopPlaying() });
    ajaxAction('List', (data) => { player.loadPlaylist(data) });
}

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