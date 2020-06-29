Java.perform(function() {
  console.log("creating dk array");
  var fileClass = Java.use('java.io.File');
  var array = Java.use('java.util.ArrayList').$new();
  array.add(fileClass.$new("/data/local/tmp/key-export/81a2d7a0-6d15-31eb-b89b-8b648347aaaa.zip"));
  var token = "randomtoken";
  console.log("creating default exposure configuration");
  var conf = Java.use('com.google.android.gms.nearby.exposurenotification.ExposureConfiguration$ExposureConfigurationBuilder').$new().build();
  var OnSuccessListenerInterface = Java.use('com.google.android.gms.tasks.OnSuccessListener');
  var OnFailureListenerInterface = Java.use('com.google.android.gms.tasks.OnFailureListener');
  var OnSuccessCallback = Java.registerClass({
    name: 're.callback.Success',
    implements: [OnSuccessListenerInterface],
    methods: {
      onSuccess: function(result) {
        console.log("on success listener: " + result);
      }
    }
  });
  var OnFailureCallback = Java.registerClass({
    name: 're.callback.Failure',
    implements: [OnFailureListenerInterface],
    methods: {
      onFailure: function(result) {
        console.log("on failure listener: " + result);
      }
    }
  });
  var successCallback = OnSuccessCallback.$new();
  var failureCallback = OnFailureCallback.$new();
  console.log("looking for en instance");
  Java.choose('com.google.android.gms.internal.nearby.zzp', {
    onMatch: function(enClient) {
      var maxcalls = 20;
      var currentCalls = 0;
      function inter() {
        currentCalls += 1;
        if (currentCalls > maxcalls) {
          return
        }
        console.log("provideDiagnosisKeys(keys=" + array + ")");
        enClient.provideDiagnosisKeys(array, conf, token)
            .addOnSuccessListener(successCallback)
            .addOnFailureListener(failureCallback);
      }
      setInterval(inter, 1);
      return 'stop';
    },
    onComplete: function() {}
  });
});
