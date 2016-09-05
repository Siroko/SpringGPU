var THREE = require('three');

/**
 * @function random
 * @param {float} min
 * @param {float} max
 * @param {boolean} round
 */
function random(min, max, round) {
  var value = Math.random() * (max - min) + min;
  return round ? Math.round(value) : value;
};

/**
 * @function getTextAndColorsFromHash
 * @returns {{[name:string]:string}}
 */
function getTextAndColorsFromHash() {
  var hash = window.location.hash;

  var text = null;
  var colors = null;

  hash.substr(1).split('&').forEach(function(part) {
    var subpart = part.split('=');

    if(subpart.length) {
      if(subpart[0] === 'text') {
        text = subpart[1].toUpperCase();
      } else if(subpart[0] === 'colors') {
        colors = subpart[1].toUpperCase();
      }
    }
  });

  return {
    text: text || 'HELLO WORLD',
    colors: colors || text ?
      Array.prototype.map.call(text, function() { return 'S'; }).join('')
      : 'SSSSS GGGGG'
  }
};

module.exports = {
  random: random,
  textureLoader: new THREE.TextureLoader(),
  jsonLoader: new THREE.JSONLoader(),
  getTextAndColorsFromHash: getTextAndColorsFromHash
};
