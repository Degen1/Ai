const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

module.exports = function withPurchases(config) {
  return withAndroidManifest(config, (result) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(result.modResults);
    activity.$['android:launchMode'] = 'singleTop';
    return result;
  });
};
