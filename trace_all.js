Java.perform(function() {
    console.log("trace_all.js");
    try {
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
        inputStream.read.overload('[B').implementation = function(buffer) {
            var t = new Date();
            var ret = this.read(buffer);
            if (this.toString().includes("Piped") || this.toString().includes("File")) {
                console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer={length=" + buffer.length + "}) = " + ret)
            }
            return ret;
        }
        pipedOutput.write.overload('[B', 'int', 'int').implementation = function(buffer, off, len) {
            var t = new Date();
            console.log((t.getTime() % 10000000) + ": " + this + " :: write(buffer={length=" + buffer.length + "}, offset=" + off + ", length=" + len + ")");
            this.write(buffer, off, len);
        }
        var ex = Java.use('java.lang.Exception');
        ex.$init.overload('java.lang.String').implementation = function(msg){
            var t = new Date();
            if (msg.startsWith("Invalid") || msg.startsWith("Pipe") || msg.startsWith("Unable")) {
                console.log((t.getTime() % 10000000) + ": Exception: " + msg);
            }
            this.$init(msg);
        }
    } catch (e) {
        console.log(e);
    }
});
