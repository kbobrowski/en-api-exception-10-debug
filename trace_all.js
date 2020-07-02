console.log("tracing");
Java.perform(function() {
    console.log("trace_all.js");
    try {
        var expected = [69, 75, 32, 69, 120, 112, 111, 114, 116, 32, 118, 49, 32, 32, 32, 32];

        var pipedInput = Java.use("java.io.PipedInputStream");
        var inputStream = Java.use("java.io.InputStream");
        pipedInput.$init.overload('java.io.PipedOutputStream').implementation = function(pipedOutputStream) {
            var t = new Date();
            this.$init(pipedOutputStream);
            console.log((t.getTime() % 10000000) + ": " + this + ' <- PipedInputStream(output_stream=' + pipedOutputStream + ")");
        };
        var pipedOutput = Java.use("java.io.PipedOutputStream");
        pipedOutput.$init.overload().implementation = function () {
            var t = new Date();
            this.$init();
            console.log((t.getTime() % 10000000) + ": " + this + ' <- PipedOutputStream()');
        };
        pipedOutput.close.implementation = function() {
            var t = new Date();
            console.log((t.getTime() % 10000000) + ": " + this + " :: close()")
            this.close();
        }
        pipedInput.close.implementation = function() {
            var t = new Date();
            console.log((t.getTime() % 10000000) + ": " + this + " :: close()")
            this.close();
        }

        var bufferName = "";
        var currentPipedInputStream = null;

        inputStream.read.overload('[B').implementation = function(buffer) {
            var t = new Date();
            if (this.toString().includes("Piped")) {
                var bufferAsBytes = Java.cast(buffer, bytesClass);
                console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer={instance=" + bufferAsBytes + ", length=" + buffer.length + "})")
                bufferName = bufferAsBytes.toString();
                currentPipedInputStream = this;
            }

            return this.read(buffer);
        }

        pipedOutput.write.overload('[B', 'int', 'int').implementation = function(buffer, off, len) {
            var t = new Date();
            console.log((t.getTime() % 10000000) + ": " + this + " :: write(buffer={length=" + buffer.length + "}, offset=" + off + ", length=" + len + ")");
            this.write(buffer, off, len);
        }

        var bytesClass = Java.use('[B');
        pipedInput.read.overload('[B', 'int', 'int').implementation = function (buffer, off, len) {
            var bufferAsBytes = Java.cast(buffer, bytesClass);
            var t = new Date();
            if (len === 16) {
                console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer={instance=" + bufferAsBytes + ", length=" + buffer.length + "}, offset=" + off + ", length=" + len + ")");
            }
            var ret = this.read(buffer, off, len);
            if (len === 16) {
                console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer={instance=" + bufferAsBytes + ", length=" + buffer.length + "}, offset=" + off + ", length=" + len + ") = " + ret);
            }
            return ret;
        }

        var curByte = 0;

        pipedInput.receive.implementation = function(oneByte) {
            if (oneByte === expected[curByte]) {
                console.log(oneByte);
                curByte += 1;
                if (curByte === 16) {
                    curByte = 0;
                }
            } else {
                curByte = 0;
            }
            this.receive(oneByte);
        }

        var ex = Java.use('java.lang.Exception');
        ex.$init.overload('java.lang.String').implementation = function(msg){
            var t = new Date();
            if (msg.startsWith("Invalid") || msg.startsWith("Pipe") || msg.startsWith("Unable")) {
                console.log((t.getTime() % 10000000) + ": Exception: " + msg);
            }
            this.$init(msg);
        }


        var system = Java.use('java.lang.System');
        system.arraycopy.overload('[B', 'int', '[B', 'int', 'int').implementation = function(src, srcPos, dest, destPos, length) {
            if (dest.length === 16){
                var destName = Java.cast(dest, bytesClass).toString();
                if (destName === bufferName) {
                    console.log("System.arraycopy(src=" + src + ", srcPos=" + srcPos + ", dest=" + destName + ", destPost=" + destPos + ", length=" + length + ")");
                }

            }

            this.arraycopy(src, srcPos, dest, destPos, length);
        }
    } catch (e) {
        console.log(e);
    }
});
