device info
-----------

Motorola G2, Android 6.0
Play Services: 20.21.17

file description
----------------

#### scripts

##### de.rki.coronawarnapp
- `call_provideDiagnosisKeys.js` - frida script to call `provideDiagnosisKeys` with specified interval between calls
- `call_provideDiagnosisKeys_serial.js` - similar to previous one, but execute next call only when previous one was successful

##### com.google.android.gms.persistent
- `trace_exception.js` - capture stack trace of exception inside GMS
- `trace_pipe.js` - monitor operations with PipedInputStream / PipedOutputStream inside GMS


#### input files
- 81a2d7a0-6d15-31eb-b89b-8b648347aaaa.zip - file which is passed to `provideDiagnosisKeys` as single-element batch (these are Diagnosis Keys published by Germany for one day) [not published on GitHub]

#### results
- `calls_with_intervals_log` - directory which contains output of `call_provideDiagnosisKeys.js`, file name is exponent, time interval is 2^exponent
- `plot_errors_vs_delay.py` - script to plot data from `calls_with_intervals_log`
- `errors_vs_delay.png` - output of `plot_errors_vs_delay.py`
- `adb_bugreport.txt` - full bug report which captures ApiException(10) [not published on GitHub]
- `stack_trace.txt` - stack trace of "Pipe is closed" error, result of `trace_exception.js`
- `pipes_0ms_delay.txt` - result of running `call_provideDiagnosisKeys_serial.js` and `trace_pipe.js` in parallel, with 0 ms delay
- `pipes_10000ms_delay.txt` - result of running `call_provideDiagnosisKeys_serial.js` and `trace_pipe.js` in parallel, with 10000 ms delay

how to reproduce
----------------

- upload 81a2d7a0-6d15-31eb-b89b-8b648347aaaa.zip to /data/local/tmp/key-export
- run frida 12.8.12 on the device together with German app (Corona-Warn-App), after the app is started inject `call_provideDiagnosisKeys.js`,
it should execute `provideDiagnosisKeys` 20 times with short intervals. You can change interval in the script.
- observe that if `provideDiagnosisKeys` is executed with very short intervals it throws the ApiException(10)
- run other scripts on GMS as described in file description to capture error stack trace and monitor pipe operations

observations
------------

ApiException 10 happens consistently only when PipedInputStream is closed before PipedOutputStream
