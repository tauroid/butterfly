/* Abstract class for extracting coordinates from physics engines */

define(function () {
    PhysicsBinder = function (bodyToActorScaling) {
        this.bodyToActorScaling = bodyToActorScaling;

        this.bodyActorBindings = [];
    };

    PhysicsBinder.prototype.bindBodyToActor = function (body, actor) {
        this.bodyActorBindings.push([body, actor]);
    };

    PhysicsBinder.prototype.syncActorsToPhysicsBodies = function () {
        for (var i = 0; i < this.bodyActorBindings.length; ++i) {
            var body = this.bodyActorBindings[i][0];
            var actor = this.bodyActorBindings[i][1];

            this.syncBodyToActor(body, actor);
        }
    };

    PhysicsBinder.prototype.syncPhysicsBodiesToActors = function () {
        for (var i = 0; i < this.bodyActorBindings.length; ++i) {
            var body = this.bodyActorBindings[i][0];
            var actor = this.bodyActorBindings[i][1];

            this.syncActorToBody(actor, body);
        }
    };

    PhysicsBinder.prototype.syncBodyToActor = undefined; /* function (body, actor) {} */
    PhysicsBinder.prototype.syncActorToBody = undefined; /* function (actor, body) {} */

    return PhysicsBinder;
});
