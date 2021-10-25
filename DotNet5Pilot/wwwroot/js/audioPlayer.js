class audioPlayer {
    constructor(audioPlayerSelector) {
        this.container = $(audioPlayerSelector);
        this.audio = $(audioPlayerSelector + ' audio');
        this.audioDom = this.audio[0];
        this.audioSource = $(audioPlayerSelector + ' audio source');
        this.playlistBody = $(audioPlayerSelector + ' .playlist-body');
        this.playlistFilter = $(audioPlayerSelector + ' .playlist-filter');

        this.mediaButton = $('#mediaButton');
        this.playButton = $('#playButton');
        this.prevButton = $('#prevButton');
        this.nextButton = $('#nextButton');
        this.stopButton = $('#stopButton');
        this.repeatButton = $('#repeatButton');
        this.randomButton = $('#randomButton');

        this.playlist = [];
        this.filteredPlaylist = [];

        this.currentlyPlaying = -1;

        this.attachActions();
    }

    attachActions() {
        this.playlistFilter.on('input', () => { this.onFilterChange(); });
        this.audio.on('ended', () => { this.playNext(); });
        this.playButton.click(() => this.playPause());
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

    playPause() {
        if (this.audioDom.paused) {
            this.audioDom.play();
        }
        else {
            this.audioDom.pause();
        }
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
        ajaxAction('Info/' + songId, (data) => {
            this.loadSongInfo(data);
        })
    }

    loadSongInfo(songInfo) {
        this.updateTagField("#songTitle", songInfo.title);
        this.updateTagField("#songArtist", songInfo.artist);
        this.updateTagField("#songAlbum", songInfo.album);
        this.updateTagField("#songTrack", songInfo.track);
        this.updateTagField("#songYear", songInfo.year);
        this.updateTagField("#songGenere", songInfo.genere);
        $('#songImage').attr('src', 'data:image/png;base64,' + songInfo.image);
    }

    updateTagField(selector, value) {
        if (value === undefined || value === null || value === "") {
            $(selector).parent().hide();
            $(selector).val("");
        }
        else {
            $(selector).parent().show();
            $(selector).val(value);
        }
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