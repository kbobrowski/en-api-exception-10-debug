Device info
-----------

- Motorola G2, Android 6.0
- Play Services: 20.21.17

Bug description
---------------

`PipedInputStream.read(byte[] buffer)` seems to be broken. It is used for checking that header of Diagnosis Key file is equal to padded `EK Export v1    `:

```java
/* class aion */
public static void a(InputStream inputStream) {
  byte[] buffer = new byte[16];
  byte[] validHeader = "EK Export v1    ".getBytes(StandardCharsets.UTF_8)
  if (inputStream.read(buffer) == 16) {
    if (!Arrays.equals(buffer, validHeader)) {
      throw new IOException("Unsupported file format");
    }
  } else {
    throw new IOException("Invalid file header length");
  }
}
```

When `provideDiagnosisKeys` is executed frequently then `read(byte[] buffer)` method sometimes returns number of read bytes less than 16 (see [pipe_0ms_delay_read.txt](pipe_0ms_delay_read.txt)) and `IOException("Invalid file header length")` is thrown.

This exception is caught in `aiob.call()` and as a result `PipedInputStream` is closed early. `PipedOutputStream` is still open and sending data, which results in `Pipe is closed` exception. The latter exception is passed further to `onFailureListener` of `provideDiagnosisKeys`.

Possible solution
----------------

Possible solution is to use `PipedInputStream.read()` instead. Following implementation (as a [frida](https://frida.re/) hook)  solves this issue on my device (see [`input_stream_read_patch.js`](input_stream_read_patch.js) for full script):

```javascript
inputStream.read.overload('[B').implementation = function(buffer) {
    var t = new Date();
    var bufferIndex = 0;
    // patch only PipedInputStream
    if (this.toString().includes("Piped")) {
        var readResult = 0;
        while (bufferIndex < buffer.length) {
            readResult = this.read();
            if (readResult >= 0) {
                buffer[bufferIndex] = readResult;
                bufferIndex += 1;
            } else {
                break;
            }
        }
        console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer=" + buffer + ") = " + bufferIndex)
    } else {
        bufferIndex = this.read(buffer);
    }
    return bufferIndex;
}
```

File description
----------------

#### scripts

##### de.rki.coronawarnapp
- `call_provideDiagnosisKeys.js` - frida script to call `provideDiagnosisKeys` with specified interval between calls
- `call_provideDiagnosisKeys_serial.js` - similar to previous one, but execute next call only when previous one was successful

##### com.google.android.gms.persistent
- `trace_exception.js` - capture stack trace of exception inside GMS (Pipe is closed)
- `trace_all_exceptions.js` - trace all exceptions initialized with string
- `trace_pipe.js` - monitor operations with PipedInputStream / PipedOutputStream inside GMS
- `input_stream_read_patch.js` - patch input stream according to the description above

#### input files
- 81a2d7a0-6d15-31eb-b89b-8b648347aaaa.zip - file which is passed to `provideDiagnosisKeys` as single-element batch (these are Diagnosis Keys published by Germany for one day) [not published on GitHub]

#### results
- `calls_with_intervals_log` - directory which contains output of `call_provideDiagnosisKeys.js`, file name is exponent, time interval is 2^exponent
- `plot_errors_vs_delay.py` - script to plot data from `calls_with_intervals_log`
- `errors_vs_delay.png` - output of `plot_errors_vs_delay.py`
- `adb_bugreport.txt` - full bug report which captures ApiException(10) [not published on GitHub]
- `stack_trace.txt` - stack trace of "Pipe is closed" error, result of `trace_exception.js`
- `all_exceptions.txt` - result of `trace_all_exceptions.js`
- `pipes_0ms_delay_read.txt` - result of running `call_provideDiagnosisKeys_serial.js` and `trace_pipe.js` in parallel, with 0 ms delay and tracing `PipedInputStream.read(byte[] buffer)`
- `pipes_10000ms_delay.txt` - result of running `call_provideDiagnosisKeys_serial.js` and `trace_pipe.js` in parallel, with 10000 ms delay

How to reproduce
----------------

- upload 81a2d7a0-6d15-31eb-b89b-8b648347aaaa.zip to /data/local/tmp/key-export
- run frida 12.8.12 on the device together with German app (Corona-Warn-App), after the app is started inject `call_provideDiagnosisKeys.js`,
it should execute `provideDiagnosisKeys` 20 times with short intervals. You can change interval in the script.
- observe that if `provideDiagnosisKeys` is executed with very short intervals it throws the ApiException(10)
- run other scripts on GMS as described in file description to capture error stack trace, monitor pipe operations and patch buggy read method

