define(['common/cannon.min', 'common/three.min', 'statebinder'], function (CANNON, THREE, StateBinder) {
    CannonThreeBinder = function (scaling1to2) {
        StateBinder.call(this, scaling1to2);
    }

    CannonThreeBinder.prototype = Object.create(StateBinder.prototype);
    CannonThreeBinder.prototype.constructor = CannonThreeBinder;
});
