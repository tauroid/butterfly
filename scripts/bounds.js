define(function () {
    Bounds = function () {
        this.walls = [];

        this.wall_distance = 10;
    };

    Bounds.prototype.addWall = function (options) {
        this.walls.push(options);

        return this;
    };

    Bounds.prototype.applyHardBounds = function (position, width, height) {
        for (var i = 0; i < this.walls.length; ++i) {
            var wall = this.walls[i];

            if (wall.vertical) {
                if (wall.extents && (position.y > Math.max.apply(null, wall.extents)
                        || position.y < Math.min.apply(null, wall.extents))) {
                    continue;
                }

                if (wall.solid) {
                    if (wall.greater && position.x + width/2 > wall.position) position.x = wall.position - width/2;
                    else if (!wall.greater && position.x - width/2 < wall.position) position.x = wall.position + width/2;
                }
            } else {
                if (wall.extents && (position.x > Math.max.apply(null, wall.extents)
                        || position.x < Math.min.apply(null, wall.extents))) {
                    continue;
                }

                if (wall.solid) {
                    if (wall.greater && position.y + height/2 > wall.position) position.y = wall.position - height/2;
                    else if (!wall.greater && position.y - height/2 < wall.position) position.y = wall.position + height/2;
                }
            }
        }
    };

    Bounds.prototype.applyBounds = function (position, vector) {
        for (var i = 0; i < this.walls.length; ++i) {
            var wall = this.walls[i];

            if (wall.vertical) {
                if (wall.extents && (position.y > Math.max.apply(null, wall.extents)
                        || position.y < Math.min.apply(null, wall.extents))) {
                    continue;
                }

                var x_dist = wall.position - position.x;

                if (Math.abs(x_dist) < this.wall_distance) {
                    vector.x -= x_dist/Math.abs(x_dist) * (this.wall_distance/Math.abs(x_dist) - 1);
                }
            } else {
                if (wall.extents && (position.x > Math.max.apply(null, wall.extents)
                        || position.x < Math.min.apply(null, wall.extents))) {
                    continue;
                }

                var y_dist = wall.position - position.y;

                if (Math.abs(y_dist) < this.wall_distance) {
                    vector.y -= y_dist/Math.abs(y_dist) * (this.wall_distance/Math.abs(y_dist) - 1);
                }
            }
        }

        return this;
    };

    return Bounds;
});
