class equalizer {
    /**
     * @param {HTMLMediaElement} audioElement
     * */
    constructor(audioElement) {
        this.audioContext = new AudioContext();
        this.audioElement = audioElement;
        this.source = new MediaElementAudioSourceNode(this.audioContext, {
            mediaElement: this.audioElement,
        });
        /**@type {BiquadFilterNode[]}*/
        this.filters = [];
        this.defaultGains = [2, 4, 4, 3, 2, 1, -2, -4, -5, -7, -6, -4, -2, 0, 2, 3, 4, 3];

        let lastAudioNode = this.source;
        let freqList = [55, 77, 110, 156, 220, 311, 440, 622, 880, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 14000, 20000];
        let qList = [11, 16, 5, 23, 32, 45, 5, 64, 5, 91, 129, 160, 300, 350, 500, 750, 1000, 1500, 2000, 3000, 3000];

        lastAudioNode = lastAudioNode.connect(this.createBqFilter(freqList[0], 0, 0, "lowshelf"));
        this.filters.push(lastAudioNode);
        for (var i = 0; i < freqList.length; i++) {
            lastAudioNode = lastAudioNode.connect(this.createBqFilter(freqList[i], qList[i], 0));
            this.filters.push(lastAudioNode);
        }
        lastAudioNode = lastAudioNode.connect(this.createBqFilter(freqList[freqList.length - 1], 0, 0, "highshelf"));
        this.filters.push(lastAudioNode);
        lastAudioNode.connect(this.audioContext.destination);

        this.setDefault();
    }

    setDefault() {
        this.setGains(this.defaultGains);
    }

    setNone() {
        this.setGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    /**@param {number[]} dbList list of boosts for each frequency in dB
     frequencies are foobar defaults: [55, 77, 110, 156, 220, 311, 440, 622, 880, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 14000, 20000]
     you may use default foobar equalizer to create .feq file
     */
    setGains(dbList) {
        if (!Array.isArray(dbList) || dbList.length !== 18 ||
            !dbList.every(numb => Number.isInteger(numb) && numb <= 40 && numb >= -40)) {
            throw 'dbList must by an array of 18 numbers <-40;40>'
        }
        this.filters[0].gain.value = dbList[0];
        for (var i = 0; i < dbList.length; i++) {
            this.filters[i + 1].gain.value = dbList[i];
        }
        this.filters[19].gain.value = dbList[17];
    }

    /** 
     *  @param {number} frequency
     *  @param {number} q
     *  @param {number} gainDb
     *  @param {BiquadFilterType} type
     *  @returns {BiquadFilterNode}
     */
    createBqFilter(frequency, q, gainDb, type = "peaking") {
        let filter = this.audioContext.createBiquadFilter();
        filter.frequency.value = frequency;
        filter.Q.value = q;
        filter.gain.value = gainDb;
        filter.type = type;
        return filter;
    }
}