function isExpired(time, expireIn) {
  const currentTime = Date.now();
  const expirationTime = time + 60 * 1000 * expireIn;
  return currentTime > expirationTime;
}

module.exports = {
  isExpired,
};
