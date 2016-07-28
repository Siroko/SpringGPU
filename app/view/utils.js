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

module.exports = {
  random: random
};
