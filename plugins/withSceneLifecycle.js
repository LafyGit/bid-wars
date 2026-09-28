/**
 * Adopt the UIScene lifecycle on iOS.
 * iOS 27 traps at launch (EvaluateRuntimeIssueForNoSceneLifecycleAdoption) for apps that still
 * create their window from the app delegate. Expo 57 ships ExpoAppSceneDelegate but prebuild does
 * not wire it in yet, so this plugin:
 *   1. adds UIApplicationSceneManifest to Info.plist,
 *   2. writes ios/<App>/SceneDelegate.swift and adds it to the Xcode target,
 *   3. rewrites AppDelegate.swift to expose the factory instead of starting React Native itself.
 */
const fs = require('fs');
const path = require('path');
const { withInfoPlist, withXcodeProject, withDangerousMod, IOSConfig } = require('expo/config-plugins');

const SCENE_DELEGATE = `internal import Expo
import UIKit

/// Creates the window and starts React Native for each scene. See ExpoAppSceneDelegate.
class SceneDelegate: ExpoAppSceneDelegate {}
`;

function patchAppDelegate(src) {
  if (src.includes('ExpoReactNativeFactoryProvider')) return src;
  let out = src.replace('class AppDelegate: ExpoAppDelegate {', 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
  // The scene delegate owns the window now; the app delegate only builds the factory.
  out = out.replace(/#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\(\n\s*withModuleName: "main",\n\s*in: window,\n\s*launchOptions: launchOptions\)\n#endif\n/, '');
  if (!out.includes('ExpoReactNativeFactoryProvider') || out.includes('startReactNative(')) {
    throw new Error('withSceneLifecycle: AppDelegate.swift did not match the expected template');
  }
  return out;
}

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return c;
  });

  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(c.modRequest.projectRoot);
      const dir = path.join(c.modRequest.platformProjectRoot, projectName);
      fs.writeFileSync(path.join(dir, 'SceneDelegate.swift'), SCENE_DELEGATE);
      const appDelegatePath = path.join(dir, 'AppDelegate.swift');
      fs.writeFileSync(appDelegatePath, patchAppDelegate(fs.readFileSync(appDelegatePath, 'utf8')));
      return c;
    },
  ]);

  config = withXcodeProject(config, (c) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(c.modRequest.projectRoot);
    const rel = `${projectName}/SceneDelegate.swift`;
    if (!c.modResults.hasFile(rel)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath: rel, groupName: projectName, project: c.modResults });
    }
    return c;
  });

  return config;
};
