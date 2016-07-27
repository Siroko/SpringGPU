var BALLOON_1 = 0;
var BALLOON_2 = 1;
var BALLOON_3 = 2;

var Sounds = {};

Sounds[BALLOON_1] = {
  src: 'assets/sounds/balloon1.wav',
  loop: false,
  volume: 1
};

Sounds[BALLOON_2] = {
  src: 'assets/sounds/balloon2.wav',
  loop: false,
  volume: 1
};

Sounds[BALLOON_3] = {
  src: 'assets/sounds/balloon3.wav',
  loop: false,
  volume: 1
};

module.exports = {
  BALLOON_1: BALLOON_1,
  BALLOON_2: BALLOON_2,
  BALLOON_3: BALLOON_3,
  Sounds: Sounds
};
