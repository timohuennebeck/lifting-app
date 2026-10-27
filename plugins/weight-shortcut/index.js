const fs = require('fs');
const path = require('path');
const { IOSConfig, withXcodeProject } = require('expo/config-plugins');

const SWIFT_FILE = 'WeightShortcut.swift';
const STRINGS = require('./strings.json');

/** A `.strings` line, with both sides quoted: the keys are English sentences. */
const quote = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const stringsFile = (entries) =>
  Object.entries(entries)
    .map(([key, value]) => `${quote(key)} = ${quote(value)};`)
    .join('\n') + '\n';

/**
 * The "Log weight" App Shortcut (iOS): copies WeightShortcut.swift into the app target, with the
 * build's link scheme (app.config.ts), and writes its translations next to Expo's
 * InfoPlist.strings, one `<lang>.lproj` per language. The intent opens <scheme>://body-weight/today.
 * Localizable.strings is written here, so the app's `locales` must not add one of their own.
 */
const withWeightShortcut = (config) =>
  withXcodeProject(config, async (config) => {
    const { platformProjectRoot, projectName } = config.modRequest;
    const project = config.modResults;
    const appDir = path.join(platformProjectRoot, projectName);

    const scheme = [config.scheme].flat()[0] ?? 'loqqa';
    const swift = await fs.promises.readFile(path.join(__dirname, SWIFT_FILE), 'utf8');
    const placed = swift.replace('appScheme = "loqqa"', `appScheme = ${JSON.stringify(scheme)}`);
    if (placed === swift && scheme !== 'loqqa')
      throw new Error(`${SWIFT_FILE}: no appScheme to set`);
    await fs.promises.writeFile(path.join(appDir, SWIFT_FILE), placed);
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${projectName}/${SWIFT_FILE}`,
      groupName: projectName,
      project,
    });

    const supportingDir = path.join(appDir, 'Supporting');
    for (const [lang, files] of Object.entries(STRINGS)) {
      const dir = path.join(supportingDir, `${lang}.lproj`);
      await fs.promises.mkdir(dir, { recursive: true });
      const groupName = `${projectName}/Supporting/${lang}.lproj`;
      const group = IOSConfig.XcodeUtils.ensureGroupRecursively(project, groupName);
      for (const [fileName, entries] of Object.entries(files)) {
        await fs.promises.writeFile(path.join(dir, fileName), stringsFile(entries));
        // As Expo adds InfoPlist.strings, and only once.
        if (group?.children.some(({ comment }) => comment === fileName)) continue;
        IOSConfig.XcodeUtils.addResourceFileToGroup({
          filepath: `${lang}.lproj/${fileName}`,
          groupName,
          project,
          isBuildFile: true,
        });
      }
    }
    return config;
  });

module.exports = withWeightShortcut;
