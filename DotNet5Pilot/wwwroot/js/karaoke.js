class karaoke {
    constructor(karaokePanelSelector) {
        this.karaokePanel = $(karaokePanelSelector);
        this.karaokeBox = $('#karaokeBox');
        this.timeout = null;
        this.currentLine = -1;
        this.lyrics = null;
        this.offset = 500;
        this.stopped = true;
    }

    load(lyrics) {
        this.karaokeBox.empty();
        this.lyrics = lyrics;
        if (lyrics != null) {
            this.karaokePanel.show(500);
            this.karaokeBox.append('<div style="height:112px;">&nbsp;</div>');
            this.lyrics.forEach((lyric) => {
                this.karaokeBox.append('<div>' + lyric.text + '</div>');
            })
        }
        else {
            this.karaokePanel.hide(500);
        }
    }

    start(startingMilliseconds = 0) {
        if (this.lyrics != null) {
            var startingLine = this.findStartingLyric(startingMilliseconds);
            var milliseconds = this.lyrics[startingLine + 1].milliseconds - startingMilliseconds;
            if (startingLine > 0 && startingLine !== this.currentLine) {
                this.goToLine(startingLine, milliseconds);
            }
            this.currentLine = startingLine;
            this.stopped = false;
            this.queueNextLine(milliseconds);
        }
    }

    findStartingLyric(startingMilliseconds) {
        let startingLyricsIndex = this.lyrics.findIndex(lyr => lyr.milliseconds > startingMilliseconds);
        return startingLyricsIndex - 1;
    }

    reset() {
        this.stop();
        this.currentLine = -1;
        this.scroll(0, 0);
    }

    stop() {
        this.stopped = true;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
        }
    }

    nextLine() {
        if (this.stopped) {
            return;
        }
        this.currentLine++;
        var nextLineExists = this.currentLine + 1 < this.lyrics.length;

        var millisecondsDifference = nextLineExists ?
            this.lyrics[this.currentLine + 1].milliseconds - this.lyrics[this.currentLine].milliseconds : 2000;
        if (nextLineExists) {
            this.queueNextLine(millisecondsDifference);
        }
        this.goToLine(this.currentLine, millisecondsDifference);
    }

    queueNextLine(miliseconds) {
        this.timeout = window.setTimeout(() => this.nextLine(), miliseconds);
    }

    goToLine(newLine, nextLineTime) {
        this.karaokeBox.find('.karaoke-current-line').removeClass('karaoke-current-line');
        var currentLineElement = $('#karaokeBox div:nth-child(' + (newLine + 2) + ')');
        currentLineElement.addClass('karaoke-current-line');
        var newPosition = currentLineElement[0].offsetTop - 125 + (currentLineElement[0].clientHeight / 2);
        if (nextLineTime > 2000) {
            this.scroll(newPosition, 1000);
        }
        else {
            this.scroll(newPosition, nextLineTime / 2);
        }
    }

    scroll(topPixels, duration = 1000) {
        this.karaokeBox.animate({
            scrollTop: topPixels
        }, {
            duration: duration,
        });
    }
}