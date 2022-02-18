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
        this.pauseButton = $('#pauseButton');
        this.pauseButton.hide();
        this.prevButton = $('#prevButton');
        this.nextButton = $('#nextButton');
        this.backwardButton = $('#backwardButton');
        this.forwardButton = $('#forwardButton');
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

        this.wakeLock = null;

        this.attachActions();
        this.attachMediaSessionActions();
    }

    attachActions() {
        this.playlistFilter.on('input', () => { this.onFilterChange(); });
        this.audio.on('seeked', () => { this.onAudioSeeked(); });
        this.audio.on('ended', () => { this.next(); });
        this.audio.on('timeupdate', () => { this.updateProgress(); })
        this.audio.on('play', () => { this.onPlay(); })
        this.audio.on('pause', () => { this.onPause(); })
        this.playButton.click(() => this.play());
        this.pauseButton.click(() => this.pause());
        this.prevButton.click(() => this.playPrevious());
        this.nextButton.click(() => this.playNext());
        this.backwardButton.click(() => this.backward());
        this.forwardButton.click(() => this.forward());
        this.stopButton.click(() => this.stopPlaying());
        this.repeatButton.click(() => this.toggleRepeat());
        this.randomButton.click(() => this.toggleRandom());
        this.progress.click((event) => this.progressSeek(event));
    }

    attachMediaSessionActions() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => { this.play(); });
            navigator.mediaSession.setActionHandler('pause', () => { this.pause(); });
            navigator.mediaSession.setActionHandler('stop', () => { this.stopPlaying(); });
            navigator.mediaSession.setActionHandler('seekbackward', () => { this.backward(); });
            navigator.mediaSession.setActionHandler('seekforward', () => { this.forward(); });
            navigator.mediaSession.setActionHandler('seekto', (seekTime) => { this.seekTo(seekTime) });
            navigator.mediaSession.setActionHandler('previoustrack', () => { this.playPrevious(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { this.next(); });
        }
    }

    loadPlaylist(data) {
        this.playlist = data;
        this.fillPlaylistBody(data);
    }

    play() {
        if (this.stopped) {
            return;
        }
        this.audioDom.play();
    }

    onPlay() {
        this.karaoke.start(this.audioDom.currentTime * 1000);
        this.setMediaSessionPlaybackState('playing');
        this.showHidePlayPauseButtons(true);
    }

    pause() {
        this.audioDom.pause();
    }

    onPause() {
        this.karaoke.stop();
        this.setMediaSessionPlaybackState('paused');
        this.showHidePlayPauseButtons(false);
    }

    showHidePlayPauseButtons(isplaying) {
        if (isplaying) {
            this.pauseButton.show();
            this.playButton.hide();
        }
        else {
            this.pauseButton.hide();
            this.playButton.show();
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
            let nextSongId = 0;
            do {
                nextSongId = this.getRandomInt(0, this.playlist.length - 1);
            } while (this.previousSongs.indexOf(nextSongId) !== -1);
            this.playSong(nextSongId);
        }
        else {
            let nextSongId = (this.currentlyPlaying + 1) % this.playlist.length;
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
        let songId = this.previousSongs.pop();
        this.playSong(songId);
        this.previousSongs.pop();
    }

    forward() {
        this.seek(5);
    }

    backward() {
        this.seek(-5);
    }

    seek(seconds) {
        this.seekTo(this.audioDom.currentTime + seconds);
    }

    seekTo(seconds) {
        if (this.stopped) {
            return;
        }
        this.audioDom.currentTime = seconds;
    }

    stopPlaying() {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        this.audioDom.pause();
        this.showHidePlayPauseButtons(false);
        this.audioSource.attr('src', '');
        this.audioDom.load();
        this.loadSongInfo(this.emptySong);
        this.previousSongs.push(this.currentlyPlaying);
        this.currentlyPlaying = -1;
        this.karaoke.reset();
        this.setMediaSessionPlaybackState('none');
        this.releaseWakeLock();
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
        this.previousSongs = this.previousSongs.slice(-30);
        this.currentlyPlaying = songId;
        this.stopped = false;
        this.audioDom.pause();
        this.audioSource.attr('src', '/Media/Stream/' + songId + "?" + new Date().getTime());
        this.audioDom.load();
        ajaxAction('Info/' + songId, (data) => {
            this.loadSongInfo(data);
            this.karaoke.reset();
            this.audioDom.play();
            //this.karaoke.start();
            this.markCurrentlyPlayig();
            document.title = data.title + ' - DotNet5Pilot';
        });
        this.requestWakeLock();
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
            navigator.mediaSession.metadata = new MediaMetadata({
                title: songInfo.title,
                artist: songInfo.artist,
                album: songInfo.album,
                artwork: [
                    { src: window.location.origin + songInfo.imageUrl, type: songInfo.imageMimeType },
                ]
            });
            navigator.mediaSession.playbackState = 'playing';
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
        let filter = this.playlistFilter.val().toLowerCase();
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
            let row = '<tr id="' + song.id + '" class="song-row"><td>' + (song.id + 1) + '</td><td>' + song.title + '</td><td>' + song.artist +
                '</td><td>' + song.album + '</td><td>' + formatSeconds(song.length) + '</td></tr>';
            this.playlistBody.append(row)
        });
        this.attachRowActions();
        this.markCurrentlyPlayig();
    }

    attachRowActions() {
        let audioPlayer = this;
        this.container.find('.song-row').click(function () {
            let songId = Number.parseInt($(this)[0].id, 10);
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
        let percentage = (this.audioDom.currentTime / this.audioDom.duration) * 100;
        if (isNaN(percentage)) {
            percentage = 0;
        }
        this.progressBar.css('width', percentage + '%');
        this.progressBar.attr('aria-valuenow', percentage);
        let duration = isNaN(this.audioDom.duration) ? 0 : this.audioDom.duration;
        this.timeProgress.text(formatSeconds(this.audioDom.currentTime) + ' / ' + formatSeconds(duration))
    }

    progressSeek(clickEvent) {
        if (this.stopped || isNaN(this.audioDom.currentTime) || isNaN(this.audioDom.duration)) {
            return;
        }
        let progressRectangle = this.progress[0].getBoundingClientRect();
        let startX = progressRectangle.x;
        let clickedX = clickEvent.pageX;
        let percentage = (clickedX - startX) / progressRectangle.width;
        this.audioDom.currentTime = this.audioDom.duration * percentage;
    }

    async requestWakeLock() {
        if (this.wakeLock !== null) {
            return;
        }

        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock obtained');
                this.wakeLock.addEventListener('release', () => {
                    this.wakeLock = null;
                    console.log('Wake lock relesed');
                });
            } catch (err) {
                console.log(err);
            }
        }
    }

    releaseWakeLock() {
        if (this.wakeLock !== null) {
            this.wakeLock.release()
                .then(() => {
                    this.wakeLock = null;
                    console.log('Wake lock relesed');
                });
        }
    }
}