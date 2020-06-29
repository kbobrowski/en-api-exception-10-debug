Java.perform(function() {
    console.log("input_stream_read_patch.js");
    try {
        var inputStream = Java.use("java.io.InputStream");
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

    } catch (e) {
        console.log(e);
    }
});
