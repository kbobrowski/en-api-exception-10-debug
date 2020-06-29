
Java.perform(function() {
    console.log("trace_exception.js");
    try {
        var ex = Java.use('java.lang.Exception');
        ex.getMessage.implementation = function() {
            const msg = this.getMessage();
            if (msg.startsWith("Pipe")) {
                console.log(this.getStackTrace())
            }
            return msg;
        };
    } catch (e) {
        console.log(e);
    }
});
