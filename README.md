# soundy
🔊 A simple, reliable and easy to use sound library

> Warning! Soundy is still on an early stage, the API is subject to change

## Getting started
Install the library with
```
npm install @techiepi/soundy
```

You're done! Now you can use the library like in the example below
```js
const soundy = new Soundy();

await soundy.playUrl("https://example.org/song.mp3"); // Will download and play the file
soundy.playRawBase64("...", "mpeg") // You can use either raw base64 (SUQzBAA...) or a "complete" base64 (data:audio/mpeg;base64,SUQzB...)
    .then(() => {
        console.log("Loaded and playing!")
    });

// Get the base64 from an URL
await soundy.playBase64FromUrl("https://example.org/song.txt", "mpeg", true /* Send cookies */);
await soundy.playBase64FromUrl("https://example.org/song.txt", "mpeg", null /* Overriden by custom options */, { method: "POST", body: { ... } });

soundy.pause(); // Pause the current track
await soundy.resume(); // Resumes the current track
soundy.stop(); // Resets the source and pauses the music
```

If there's something missing, you can create an issue to add the functionality to the API
and/or use the ``soundy.audio`` which returns an ``HTMLAudioElement``

## Build
You can customize some options like the name of the events and the defaults _(WIP)_
at [data/](data).
After modifying the options, you can run
```
npm run build
```
to build the library

## License
This project is licensed under the [MIT license](LICENSE)
