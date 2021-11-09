class karaoke {
    constructor(karaokeBoxSelector) {
        this.karaokeBox = $('#karaokeBox');
        this.timeout = null;
        this.currentLine = 0;
        this.karaokeLineCount = 0;
        this.lyrics = null;
        this.offset = 500;
    }

    load(lyrics) {
        this.karaokeBox.empty();
        $('#songImage').removeClass('karaoke-background');
        if (lyrics != null) {
            this.lyrics = lyrics;
            $('#songImage').addClass('karaoke-background');
            this.karaokeBox.append('<div style="height:112px;">&nbsp;</div>');
            this.lyrics.forEach((lyric) => {
                this.karaokeBox.append('<div>' + lyric.text + '</div>');
            })
        }
    }

    start() {
        this.reset();
        if (this.lyrics != null) {
            this.karaokeLineCount = this.lyrics.length;
            var milliseconds = this.lyrics[0].milliseconds;
            if (milliseconds > this.offset) {
                milliseconds -= this.offset;
            }
            this.queueNextLine(milliseconds);
        }
    }

    reset() {
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
        }
        this.currentLine = 0;
        this.karaokeLineCount = 0;
        this.scroll(0);
    }

    nextLine() {
        if (this.currentLine > this.karaokeLineCount) {
            return;
        }
        this.currentLine++;
        var millisecondsDifference =
            this.lyrics[this.currentLine].milliseconds - this.lyrics[this.currentLine - 1].milliseconds;
        this.queueNextLine(millisecondsDifference);
        this.goToLine(this.currentLine);
    }

    queueNextLine(miliseconds) {
        this.timeout = window.setTimeout(() => this.nextLine(), miliseconds);
    }

    goToLine(newLine) {
        this.karaokeBox.find('div:nth-child(' + newLine + ')').removeClass('karaoke-current-line');
        var currentLineElement = $('#karaokeBox div:nth-child(' + (newLine + 1) + ')');
        currentLineElement.addClass('karaoke-current-line');
        var newPosition = currentLineElement[0].offsetTop - 112;
        this.scroll(newPosition);
    }

    scroll(topPixels) {
        this.karaokeBox[0].scroll({
            top: topPixels,
            left: 0,
            behavior: 'smooth'
        });
    }
}