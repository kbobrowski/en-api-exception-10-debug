
Java.perform(function() {
    console.log("trace_all_exceptions.js");
    try {
        var ex = Java.use('java.lang.Exception');
        ex.$init.overload('java.lang.String').implementation = function(msg){
            console.log("Exception(msg="+msg+")");
            this.$init(msg);
        }
    } catch (e) {
        console.log(e);
    }
});
