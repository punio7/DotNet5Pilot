var selectedAlbum = null;
var modalQuery = $('#albumsModal');

$(document).ready(() => {
    modalQuery.modal({ show: false });
    $('#loadAlbumButton').click(() => {
        ajaxAction('ListAlbums', (albums) => {
            loadAlbums(albums);
        })
    });
    $('#loadAlbumSubmitButton').click(() => loadAlbumSubmit());
});

function loadAlbums(albums) {
    selectedAlbum = null;
    let buttonClass = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action';
    let spanClass = 'badge badge-primary badge-pill';
    let albumList = $('#albumList');
    albumList.empty();
    modalQuery.modal('show');
    albums.forEach((album) => {
        let id = album.id;
        let button = $('<button></button>');
        button.attr('type', 'button');
        button.attr('id', id);
        button.addClass(buttonClass);
        button.click(() => selectedAlbum = id);
        let span = $('<span></span>');
        span.addClass(spanClass);
        span.text(album.songCount);
        button.append(album.name, span);
        albumList.append(button);
    });
}

function loadAlbumSubmit() {
    if (selectedAlbum === null) {
        return;
    }
    var ajaxOptions = {
        url: '/PilotStream/' + 'LoadAlbum/' + selectedAlbum,
        method: 'POST'
    };
    ajaxOptions.success = () => {
        modalQuery.modal('hide');
        reloadPlaylist();
    };

    $.ajax(ajaxOptions);
}