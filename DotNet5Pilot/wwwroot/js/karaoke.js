class Karaoke {
    constructor(karaokeBoxSelector) {
        this.karaokeBox = $('#karaokeBox');
        this.timeout = null;
        this.currentLine = 0;
        this.karaokeLineCount = 0;
        this.lyrics = null;
        this.offset = 500;
    }

    loadKaraoke() {
        this.karaokeBox.empty();
        $('#songImage').removeClass('karaoke-background');
        if (this.lyrics != null) {
            $('#songImage').addClass('karaoke-background');
            this.karaokeBox.append('<div style="height:112px;">&nbsp;</div>');
            this.lyrics.forEach((lyric) => {
                this.karaokeBox.append('<div>' + lyric.text + '</div>');
            })
        }
    }

    startKaraoke() {
        this.resetKaraoke();
        if (this.lyrics != null) {
            this.karaokeLineCount = lyrics.length;
            var milliseconds = this.lyrics[0].milliseconds;
            if (milliseconds > this.offset) {
                milliseconds -= this.offset;
            }
            this.karaokeQueueNextLine(milliseconds);
        }
    }

    resetKaraoke() {
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
        }
        this.currentLine = 0;
        this.karaokeLineCount = 0;
        this.karaokeScroll(0);
    }

    karaokeNextLine() {
        if (this.currentLine > this.karaokeLineCount) {
            return;
        }
        this.currentLine++;
        var millisecondsDifference =
            this.lyrics[currentLine].milliseconds - this.lyrics[currentLine - 1].milliseconds;
        this.karaokeQueueNextLine(millisecondsDifference);
        this.karaokeGoToLine(this.currentLine);
    }

    karaokeQueueNextLine(miliseconds) {
        this.timeout = window.setTimeout(karaokeNextLine, miliseconds);
    }

    karaokeGoToLine(newLine) {
        this.karaokeBox.find('div:nth-child(' + newLine + ')').removeClass('karaoke-current-line');
        var currentLineElement = $('#karaokeBox div:nth-child(' + (newLine + 1) + ')');
        currentLineElement.addClass('karaoke-current-line');
        var newPosition = currentLineElement[0].offsetTop - 112;
        this.karaokeScroll(newPosition);
    }

    karaokeScroll(topPixels) {
        this.karaokeBox[0].scroll({
            top: topPixels,
            left: 0,
            behavior: 'smooth'
        });
    }
}