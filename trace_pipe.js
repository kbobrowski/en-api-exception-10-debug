Java.perform(function() {
    console.log("trace_pipe.js");
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
            if (this.toString().includes("Piped")) {
                console.log((t.getTime() % 10000000) + ": " + this + " :: read(buffer=" + buffer + ") = " + ret)
            }
            return ret;
        }

    } catch (e) {
        console.log(e);
    }
});
