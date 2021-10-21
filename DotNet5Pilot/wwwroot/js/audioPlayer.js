class audioPlayer {
    constructor(audioPlayerSelector) {
        this.container = $(audioPlayerSelector);
        this.audio = $(audioPlayerSelector + ' audio');
        this.audioDom = this.audio[0];
        this.audioSource = $(audioPlayerSelector + ' audio source');
        this.playlistBody = $(audioPlayerSelector + ' .playlist-body');
        this.playlistFilter = $(audioPlayerSelector + ' .playlist-filter');

        this.playlist = [];
        this.filteredPlaylist = [];

        this.currentlyPlaying = -1;

        this.attachActions();
    }

    attachActions() {
        this.playlistFilter.on('input', () => { this.onFilterChange(); });
        this.audio.on('ended', () => { this.playNext(); });
    }

    loadPlaylist(data) {
        this.playlist = data;
        this.fillPlaylistBody(data);
    }

    fillPlaylistBody(data) {
        this.playlistBody.empty();
        data.forEach((song) => {
            var row = '<tr id="' + song.id + '" class="song-row"><td>' + (song.id + 1) + '</td><td>' + song.title + '</td><td>' + song.artist +
                '</td><td>' + song.album + '</td><td>' + formatSeconds(song.length) + '</td></tr>';
            this.playlistBody.append(row)
        });
        this.attachRowActions();
        this.markCurrentlyPlayig();
    }

    attachRowActions() {
        var audioPlayer = this;
        this.container.find('.song-row').click(function () {
            var songId = Number.parseInt($(this)[0].id, 10);
            audioPlayer.playSong(songId);
        })
    }

    playNext() {
        var nextSongId = (this.currentlyPlaying + 1) % this.playlist.length;
        this.playSong(nextSongId);
    }

    playSong(songId) {
        this.currentlyPlaying = songId;
        this.audioSource.attr('src', '/Media/Stream/' + songId + "?" + new Date().getTime());
        this.audioDom.load();
        this.audioDom.play();
        this.markCurrentlyPlayig();
    }

    markCurrentlyPlayig() {
        this.playlistBody.find('.table-primary').removeClass('table-primary');
        this.playlistBody.find('#' + this.currentlyPlaying).addClass('table-primary');
    }

    onFilterChange() {
        var filter = this.playlistFilter.val();
        if (filter === '') {
            this.fillPlaylistBody(this.playlist);
            return;
        }
        if (filter.length < 3) {
            return;
        }
        this.filteredPlaylist = this.playlist.filter((value) => {
            return value.title.toLowerCase().includes(filter) ||
                value.album.toLowerCase().includes(filter) ||
                value.artist.toLowerCase().includes(filter);
        });
        this.fillPlaylistBody(this.filteredPlaylist);
    }
}