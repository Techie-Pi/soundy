const eventNames = require("../data/eventName.json");

const EventEmitter = require("events");

class Soundy {
    constructor(props) {
        this.audio = new Audio();
        this.event = new EventEmitter();

        const emitEvents = (() => {if(props != null){if(props.emitEvents == null) {console.log("False"); return false} else {return props.emitEvents}} else return true;})();
        this._ = { emitEvents };

        (async () => {if(props != null) if(props.src != null && (props.autoplay != null && props.autoplay === true)) await this.playUrl(props.src);})();
    }

    async playUrl(url) {
        this.#_setSource(url);
        await this.#_play();
    }

    async playRawBase64(base64, encoding) {
        if(base64.startsWith("data:audio")) {
            this.#_setSource(base64);
        }
        else {
            this.#_setSource(`data:audio/${encoding};base64,${base64}`);
        }
        await this.#_play();
    }

    async playBase64FromUrl(url, encoding, sendCookies, _rawOptions) {
        let base64;
        if(_rawOptions != null) {
            const res = await fetch(url, _rawOptions);
            base64 = await res.text();
        }
        else {
            if(sendCookies === true) {
                const res = await fetch(url, { credentials: "include" });
                base64 = await res.text();
            }
            else {
                const res = await fetch(url);
                base64 = await res.text();
            }
        }

        if(base64.startsWith("data:audio")) {
            this.#_setSource(base64);
        }
        else {
            this.#_setSource(`data:audio/${encoding};base64,${base64}`);
        }

        await this.#_play();
    }

    pause() {
        this.#emitEventNoArgs(eventNames.PAUSE);
        this.audio.pause();
    }

    stop() {
        this.#_setSource("");
    }

    async resume() {
        this.#emitEventNoArgs(eventNames.PLAY);
        await this.audio.play();
    }

    // Private helper methods
    #_setSource(src) {
        this.audio.pause();
        this.#emitEventNoArgs(eventNames.STOP);

        this.audio.src = src;
        if(src !== "" || src != null) this.#emitEventNoArgs(eventNames.SOURCE_CHANGE);
    }

    async #_play() {
        try {
            await this.audio.play()
            this.#emitEventNoArgs(eventNames.PLAY);
        } catch (e) {
            this.#emitEventArgs(eventNames.ERROR, e);
            throw e;
        }
    }

    #emitEventNoArgs(event) {
        if(this._.emitEvents === true) this.event.emit(event, this);
    }

    #emitEventArgs(event, args) {
        if(this._.emitEvents === true) this.event.emit(event, args);
    }
}

module.exports = Soundy;
