const eventNames = require("../data/eventName.json");
const general = require("../data/general.json");

const EventEmitter = require("events");
const Loggerine = require("@techiepi/loggerine");

class Soundy {
    #logger
    constructor(props) {
        const debugLevel = (() => {if(window != null) return window.debugLevel; else return general.fallbackDebugLevel})();

        this.audio = new Audio();
        this.event = new EventEmitter();
        this.#logger = new Loggerine({ module: "Soundy", debugLevel: debugLevel, vanillaFunctions: true })

        const emitEvents = (() => {if(props != null){if(props.emitEvents == null) {return false} else {return props.emitEvents}} else return true;})();
        this._ = { emitEvents };

        (async () => {if(props != null) if(props.src != null && (props.autoplay != null && props.autoplay === true)) await this.playUrl(props.src);})();

        this.#logger.debug(`Instance settings: emitEvents = ${this._.emitEvents}, autoplay = ${(() => {if(props != null) return props.autoplay})()}, debugLevel: ${debugLevel}`);
    }

    async playUrl(url) {
        this.#_setSource(url);
        await this.#_play();
        this.#logger.debug("Started playing from URL");
    }

    async playBase64(base64, encoding) {
        if(base64.startsWith("data:audio/")) {
            this.#logger.debug("The provided Base64 is complete. Setting source as the raw string");
            this.#_setSource(base64);
        }
        else {
            this.#logger.debug("The provided Base64 is incomplete. Trying to adapt it");
            this.#_setSource(`data:audio/${encoding};base64,${base64}`);
        }
        await this.#_play();
        this.#logger.debug("Started playing from Base64 string");
    }

    async playBase64Url(url, encoding, sendCookies, _rawOptions) {
        let base64;
        if(_rawOptions != null) {
            this.#logger.debug("Overriding fetch settings for Base64 request")
            const res = await fetch(url, _rawOptions);
            base64 = await res.text();
        }
        else {
            if(sendCookies === true) {
                const urlObj = new URL(url);
                if(window != null) {
                    if(window.location.origin !== urlObj.origin) {
                        this.#logger.warn("Sending cookies and authorization data to a hostname different than the actual. Be careful when using this!");
                    }
                    else {
                        this.#logger.debug("Sending cookies to the same host on Base64 URL");
                    }
                }
                const res = await fetch(url, { credentials: "include" });
                base64 = await res.text();
            }
            else {
                const res = await fetch(url);
                base64 = await res.text();
            }
        }
        this.#logger.debug("Request completed, playing audio");

        await this.playBase64(base64, encoding);
    }

    pause() {
        this.#emitEventNoArgs(eventNames.PAUSE);
        this.audio.pause();
        this.#logger.debug("Paused audio");
    }

    stop() {
        this.#_setSource("");
        this.#logger.debug("Stopped audio");
    }

    async resume() {
        this.#emitEventNoArgs(eventNames.PLAY);
        await this.audio.play();
        this.#logger.debug("Resuming audio");
    }

    // Private helper methods
    #_setSource(src) {
        this.audio.pause();
        this.#emitEventNoArgs(eventNames.STOP);

        this.audio.src = src;
        if(src !== "" || src != null) this.#emitEventNoArgs(eventNames.SOURCE_CHANGE);

        this.#logger.debug("Modified source");
    }

    async #_play() {
        try {
            await this.audio.play()
            this.#emitEventNoArgs(eventNames.PLAY);
        } catch (e) {
            this.#emitEventArgs(eventNames.ERROR, e);
            throw e;
        }

        this.#logger.debug("Called #_play()");
    }

    #emitEventNoArgs(event) {
        if(this._.emitEvents === true) this.event.emit(event, this);

        this.#logger.debug(`Sent event ${event} without args`);
    }

    #emitEventArgs(event, args) {
        if(this._.emitEvents === true) this.event.emit(event, args);

        this.#logger.debug(`Sent event ${event} with args: ${args}`);
    }

}

module.exports = Soundy;
