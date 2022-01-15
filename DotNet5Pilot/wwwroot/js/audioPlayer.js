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

        this.songTitle = $('#songTitle');
        this.songArtist = $('#songArtist');
        this.songAlbum = $('#songAlbum');
        this.songTrack = $('#songTrack');
        this.songYear = $('#songYear');
        this.songGenere = $('#songGenere');
        this.songImage = $('#songImage');
        this.progress = $('#progress');
        this.progressBar = $('#progressBar');
        this.timeProgress = $('#timeProgress');

        this.karaoke = new karaoke('#karaokePanel');
        this.karaokeBackground = $('#karaokeBackground');

        this.playlist = [];
        this.filteredPlaylist = [];
        this.previousSongs = [];
        this.emptySong = {};

        this.currentlyPlaying = -1;
        this.stopped = false;
        this.repeat = false;
        this.random = false;

        this.attachActions();
    }

    attachActions() {
        this.playlistFilter.on('input', () => { this.onFilterChange(); });
        this.audio.on('seeked', () => { this.onAudioSeeked(); });
        this.audio.on('ended', () => { this.next(); });
        this.audio.on('timeupdate', () => { this.updateProgress(); })
        this.playButton.click(() => this.playPause());
        this.prevButton.click(() => this.playPrevious());
        this.nextButton.click(() => this.playNext());
        this.stopButton.click(() => this.stopPlaying());
        this.repeatButton.click(() => this.toggleRepeat());
        this.randomButton.click(() => this.toggleRandom());
        this.progress.click((event) => this.progressSeek(event));
    }

    loadPlaylist(data) {
        this.playlist = data;
        this.fillPlaylistBody(data);
    }

    playPause() {
        if (this.audioDom.paused) {
            this.audioDom.play();
            this.karaoke.start(this.audioDom.currentTime * 1000);
            this.setMediaSessionPlaybackState('paused');
        }
        else {
            this.audioDom.pause();
            this.karaoke.stop();
            this.setMediaSessionPlaybackState('playing');
        }
    }

    next() {
        if (this.repeat) {
            this.audio.currentTime = 0;
            this.audioDom.play();
        }
        else {
            this.playNext();
        }
    }

    playNext() {
        if (this.random) {
            var nextSongId = this.getRandomInt(0, this.playlist.length - 1);
            this.playSong(nextSongId);
        }
        else {
            var nextSongId = (this.currentlyPlaying + 1) % this.playlist.length;
            this.playSong(nextSongId);
        }
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    playPrevious() {
        if (this.previousSongs.length <= 0) {
            return;
        }
        var songId = this.previousSongs.pop();
        this.playSong(songId);
    }

    stopPlaying() {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        this.audioDom.pause();
        this.audioSource.attr('src', '');
        this.audioDom.load();
        this.loadSongInfo(this.emptySong);
        this.previousSongs.push(this.currentlyPlaying);
        this.currentlyPlaying = -1;
        this.karaoke.reset();
        this.setMediaSessionPlaybackState('none');
    }

    toggleRepeat() {
        if (this.repeat) {
            this.repeat = false;
            this.repeatButton.removeClass('active');
        }
        else {
            this.repeat = true;
            this.repeatButton.addClass('active');
        }
    }

    toggleRandom() {
        if (this.random) {
            this.random = false;
            this.randomButton.removeClass('active');
        }
        else {
            this.random = true;
            this.randomButton.addClass('active');
        }
    }

    playSong(songId) {
        this.previousSongs.push(this.currentlyPlaying);
        this.currentlyPlaying = songId;
        this.stopped = false;
        this.audioSource.attr('src', '/Media/Stream/' + songId + "?" + new Date().getTime());
        this.audioDom.load();
        ajaxAction('Info/' + songId, (data) => {
            this.loadSongInfo(data);
            this.audioDom.play();
            this.karaoke.reset();
            this.karaoke.start();
            this.markCurrentlyPlayig();
            
        })
    }

    onAudioSeeked() {
        this.karaoke.stop();
        this.karaoke.start(this.audioDom.currentTime * 1000);
    }

    loadSongInfo(songInfo) {
        this.karaoke.load(songInfo.lyrics);
        this.updateTagField(this.songTitle, songInfo.title);
        this.updateTagField(this.songArtist, songInfo.artist);
        this.updateTagField(this.songAlbum, songInfo.album);
        this.updateTagField(this.songTrack, songInfo.track);
        this.updateTagField(this.songYear, songInfo.year);
        this.updateTagField(this.songGenere, songInfo.genere);
        this.songImage.attr('src', songInfo.imageUrl);
        this.karaokeBackground.css('background-image', 'url("' + songInfo.imageUrl + '")');
        this.updateMediaSession(songInfo);
    }

    updateMediaSession(songInfo) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
            navigator.mediaSession.metadata = new MediaMetadata({
                title: songInfo.title,
                artist: songInfo.artist,
                album: songInfo.album,
                artwork: [
                    { src: window.location.origin + songInfo.imageUrl, type: songInfo.imageMimeType },
                ]
            });
        }
    }

    updateTagField(selector, value) {
        if (value === undefined || value === null || value === "") {
            selector.parent().hide();
            selector.val("");
        }
        else {
            selector.parent().show();
            selector.val(value);
        }
    }

    onFilterChange() {
        var filter = this.playlistFilter.val().toLowerCase();
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

    markCurrentlyPlayig() {
        this.playlistBody.find('.table-primary').removeClass('table-primary');
        this.playlistBody.find('#' + this.currentlyPlaying).addClass('table-primary');
    }

    setMediaSessionPlaybackState(state) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = state;
        }
    }

    updateProgress() {
        var percentage = (this.audioDom.currentTime / this.audioDom.duration) * 100;
        if (isNaN(percentage)) {
            percentage = 0;
        }
        this.progressBar.css('width', percentage + '%');
        this.progressBar.attr('aria-valuenow', percentage);
        var duration = isNaN(this.audioDom.duration) ? 0 : this.audioDom.duration;
        this.timeProgress.text(formatSeconds(this.audioDom.currentTime) + ' / ' + formatSeconds(duration))
    }

    progressSeek(clickEvent) {
        if (this.stopped || isNaN(this.audioDom.currentTime) || isNaN(this.audioDom.duration)) {
            return;
        }
        var progressRectangle = this.progress[0].getBoundingClientRect();
        var startX = progressRectangle.x;
        var clickedX = clickEvent.pageX;
        var percentage = (clickedX - startX) / progressRectangle.width;
        this.audioDom.currentTime = this.audioDom.duration * percentage;
    }
}