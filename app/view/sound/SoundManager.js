var Howler = require('howler');

/**
 * @interface ISound {
 *  string|Array<string> src
 *  boolean loop
 *  float volume
 * }
 */

/**
 * @class SoundManager
 * @constructor
 */
function SoundManager() {
  this._sounds = {};
};

/**
 * @method addSound
 * @param {string} name
 * @param {string|Array<string>} srcs
 * @param {boolean} [loop=false]
 * @param {float} [volume=1]
 */
SoundManager.prototype.addSound = function(name, srcs, loop, volume) {
  if(!Array.isArray(srcs)) {
    srcs = [srcs];
  }

  if(loop === void 0) {
    loop = false;
  }
  
  if(volume === void 0) {
    volume = 1;
  }

  var sound = new Howler.Howl({
    src: srcs,
    loop: loop,
    volume: volume
  });
  
  this._sounds[name] = sound;
};

/**
 * Add sounds from a config object
 *
 * @method addSounds
 * @param {Array<ISound>} sounds
 */
SoundManager.prototype.addSounds = function(sounds) {
  for(var name in sounds) {
    if(!sounds.hasOwnProperty(name)) {
      continue;
    }

    var sound = sounds[name];

    this.addSound(name, sound.src, sound.loop, sound.volume);
  }
};

/**
 * Play a sound, ignores if the sound is not ready
 *
 * @method play
 * @param {string} sound
 */
SoundManager.prototype.play = function(sound) {
  var sound = this._sounds[sound];

  if(!sound || sound.state() === 'loading') {
    return;
  }

  sound.play();
};

/**
 * Play a sound, if the sound isn't ready, wait for it to be and play it
 *
 * @method playWhenReady
 * @param {string} sound
 */
SoundManager.prototype.playWhenReady = function(sound) {
  var sound = this._sounds[sound];

  if(!sound) {
    return;
  }

  sound.once('load', sound.play.bind(sound));
};

module.exports = SoundManager;

