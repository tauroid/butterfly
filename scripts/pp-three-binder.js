define(['statebinder'], function (StateBinder) {
    PPTHREEBinder = function (scaling1to2) {
        StateBinder.call(this, scaling1to2);
    };

    PPTHREEBinder.prototype = Object.create(StateBinder.prototype);
    PPTHREEBinder.prototype.constructor = PPTHREEBinder;

    PPTHREEBinder.prototype.sync1to2 = function (ppobj, mesh) {
        //console.log("Before: "+ppobj.position._data[2]);
        mesh.position.fromArray(ppobj.position._data);
        //console.log("After: "+ppobj.position._data[2]);
    };

    PPTHREEBinder.prototype.sync2to1 = function (mesh, ppobj) {
        ppobj.position._data[0] = mesh.position.x;
        ppobj.position._data[1] = mesh.position.y;
        ppobj.position._data[2] = mesh.position.z;
    };

    return PPTHREEBinder;
});
