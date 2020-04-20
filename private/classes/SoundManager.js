class SoundManager {
    sounds = [];

    constructor() {

    }

    loadSounds(list) {
        let s = [];
        for (let sound of list) {
            s.push(this.loadSound(sound));
        }
        return s;
    }

    /**
     * 
     * @param {string} url 
     */
    loadSound(url, volume = 0.2) {
        let sound = document.createElement('audio');
        sound.src = url;
        sound.volume = volume;
        let name = url;
        if (url.includes('/')) name = url.split('/')[1];
        name = name.split('.')[0];
        this.sounds[name] = sound;
        return sound;
    }
}