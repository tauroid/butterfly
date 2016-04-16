/**
 * Moves entities according to inertia / gravity,
 * collides stuff
 */

define(['common/math.min'], function (math) {
    PseudoPhysics = function (gravity, dimensions) {
        this.gravity = gravity; 

        if (dimensions) this.dimensions = dimensions;
        else this.dimensions = 2;

        this.staticAABBs = [];
        this.dynamicAABBs = [];
        this.staticSpheres = [];
        this.dynamicSpheres = [];
        this.walls = [];

        this.deltahistory = [];
    };

    PseudoPhysics.prototype.addAABB = function (corner1, corner2, options) {
        if (!options) options = {};
        var AABBs = options.isDynamic ? this.dynamicAABBs : this.staticAABBs;

        var aabb = new PseudoPhysics.AABB(corner1, corner2, options);

        AABBs.push(aabb);

        return aabb;
    };

    PseudoPhysics.prototype.addSphere = function (position, radius, options) {
        if (!options) options = {};
        var Spheres = options.isDynamic ? this.dynamicSpheres : this.staticSpheres;

        position = math.matrix(position);

        var sphere = {
            radius: radius,
            position: position,
            anchor: options.anchor ? options.anchor : math.zeros(this.dimensions),
            velocity: options.velocity ? options.velocity : math.zeros(this.dimensions),
            AABB: new PseudoPhysics.AABB
                ( math.multiply(math.ones(this.dimensions), -radius),
                  math.multiply(math.ones(this.dimensions), radius),
                  { position: position } )
        };

        Spheres.push(sphere);

        return sphere;
    };

    /* Only 3D for now */
    PseudoPhysics.prototype.addWall = function (position1, height1, position2, height2) {
        this.walls.push({
            position1: position1,
            position2: position2,
            height1: height1,
            height2: height2,
            AABB: new PseudoPhysics.AABB
                ( position1, math.add(position2, [0, 0, height2]) )
        });
    };

    PseudoPhysics.prototype.adjustTime = function (delta) {
        delta = Math.max(Math.min(delta, 50), 10);
        this.deltahistory.push(delta);
        if (this.deltahistory.length > 5) this.deltahistory.splice(0, 1);
        delta = this.deltahistory.reduce((prev, curr) => prev + curr)/this.deltahistory.length;
        return delta;
    };

    PseudoPhysics.prototype.update = function (delta, time) {
        delta = this.adjustTime(delta);

        this.move(delta);

        var i;
        /*
        for (i = 0; i < this.dynamicAABBs.length; ++i) {
            this.collideAABB(this.dynamicAABBs[i]);
        }
        */

        for (i = 0; i < this.dynamicSpheres.length; ++i) {
            this.collideSphere(this.dynamicSpheres[i]);
        }
    };

    PseudoPhysics.prototype.move = function (delta) {
        var i;
        /*for (i = 0; i < this.dynamicAABBs.length; ++i) {
            var aabb = this.dynamicAABBs[i];
            aabb.position = math.add(aabb.position, math.multiply(aabb.velocity, delta));
            aabb.velocity = math.add(aabb.velocity, math.multiply(this.gravity, delta));
        }*/

        for (i = 0; i < this.dynamicSpheres.length; ++i) {
            var aabb = this.dynamicSpheres[i];
            aabb.position = math.add(aabb.position, math.multiply(aabb.velocity, delta));
            aabb.velocity = math.add(aabb.velocity, math.multiply(this.gravity, delta));
        }
    };

    PseudoPhysics.prototype.collideAABB = function (AABB) {

    };

    PseudoPhysics.prototype.collideSphere = function (sphere) {
        for (var i = 0; i < this.staticAABBs.length; ++i) {
            this.collideSphereWithAABB(sphere, this.staticAABBs[i]);
        }
    };

    PseudoPhysics.prototype.collideAABBWithAABB = function (AABB1, AABB2) {

    };

    // more like cube but leave it for now
    PseudoPhysics.prototype.collideSphereWithAABB = function (sphere, AABB) {
        var relcorner1 = math.subtract(sphere.position, math.add(AABB.position, AABB.corner1));
        var relcorner2 = math.subtract(sphere.position, math.add(AABB.position, AABB.corner2));

        var m1 = Infinity;
        var dim1;
        var m2 = -Infinity;
        var dim2;

        for (var i = 0; i < this.dimensions; ++i) {
            if (relcorner1._data[i] <= -sphere.radius) return;
            var rc1i = relcorner1._data[i];
            if (rc1i < m1) {
                m1 = rc1i;
                dim1 = i;
            }
        }

        for (var i = 0; i < this.dimensions; ++i) {
            if (relcorner2._data[i] >= sphere.radius) return;
            var rc2i = relcorner2._data[i];
            if (rc2i > m2) {
                m2 = rc2i;
                dim2 = i;
            }
        }

        if (-m1 > m2) {
            sphere.position.subset(math.index(dim1), AABB.corner1._data[dim1] + AABB.position._data[dim1] - sphere.radius);
            sphere.velocity.subset(math.index(dim1), -sphere.velocity._data[dim1]);
        } else {
            sphere.position.subset(math.index(dim2), AABB.corner2._data[dim2] + AABB.position._data[dim2] + sphere.radius);
            sphere.velocity.subset(math.index(dim2), Math.abs(sphere.velocity._data[dim2]) < 0.0025 ? 0 : -sphere.velocity._data[dim2] * 0.8);
        }
    };

    PseudoPhysics.AABB = function (corner1, corner2, options) {
        this.corner1 = math.matrix(corner1);
        this.corner2 = math.matrix(corner2);
        this.centre = options.centre ? options.centre : math.zeros(math.size(this.corner1));
        this.position = options.position ? options.position : math.zeros(math.size(this.corner1));
        this.velocity = options.velocity ? options.velocity : math.zeros(math.size(this.corner1));
    };

    return PseudoPhysics;
});
