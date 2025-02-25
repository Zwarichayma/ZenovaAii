const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function androidManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    // Ajouter la permission READ_STEPS
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    androidManifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.health.READ_STEPS',
      },
    });

    // Ajoutez éventuellement d'autres permissions nécessaires comme WRITE_STEPS, etc.
    androidManifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.health.WRITE_STEPS',
      },
    });

    // Ajoutez d'autres actions ou intent-filter si nécessaire
    androidManifest.application[0].activity[0]['intent-filter'].push({
      action: [
        {
          $: {
            'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
          },
        },
      ],
    });

    return config;
  });
};
