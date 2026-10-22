import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const flavor = process.env.APP_FLAVOR || 'play';
  const isDirect = flavor === 'direct';

  return {
    ...config,
    name: isDirect ? 'KRNL Core (Direct)' : 'KRNL Core',
    slug: 'krnl-core',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'krnl',
    android: {
      package: isDirect ? 'com.krnl.core.direct' : 'com.krnl.core',
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.MANAGE_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.PACKAGE_USAGE_STATS',
        'android.permission.REQUEST_DELETE_PACKAGES',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
    plugins: [
      'expo-router',
      'expo-status-bar',
      'expo-sqlite',
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 30,
            targetSdkVersion: 36,
            compileSdkVersion: 36,
            enableProguardInReleaseBuilds: true,
          },
        },
      ],
    ],
    extra: {
      flavor,
      isDirect,
      eas: {
        projectId: 'krnl-core-app',
      },
    },
  };
};
