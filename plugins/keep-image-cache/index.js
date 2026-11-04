const { withAppDelegate } = require('expo/config-plugins');

const IMPORT_AFTER = 'import React\n';
const SET_BEFORE = '    let delegate = ReactNativeDelegate()\n';

/**
 * Keeps downloaded images until the system needs the space (iOS). expo-image's cache otherwise
 * deletes files older than a week each time the app goes to the background, which a gym without
 * signal can't download again, and expo-image has no setting for it. A negative age turns it off.
 */
const withKeepImageCache = (config) =>
  withAppDelegate(config, (config) => {
    const { contents } = config.modResults;
    if (contents.includes('maxDiskAge')) return config;
    if (!contents.includes(IMPORT_AFTER) || !contents.includes(SET_BEFORE))
      throw new Error('keep-image-cache: AppDelegate has changed');
    config.modResults.contents = contents
      .replace(IMPORT_AFTER, `${IMPORT_AFTER}import SDWebImage\n`)
      .replace(SET_BEFORE, `    SDImageCache.shared.config.maxDiskAge = -1\n${SET_BEFORE}`);
    return config;
  });

module.exports = withKeepImageCache;
