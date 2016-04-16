define(function () {
    Bounds = function () {
        this.walls = [];

        this.wall_distance = 10;
    };

    Bounds.prototype.addWall = function (position, vertical, solid, greater) {
        this.walls.push({ position: position, vertical: vertical, solid: solid, greater: greater });

        return this;
    };

    Bounds.prototype.applyHardBounds = function (position) {
        for (var i = 0; i < this.walls.length; ++i) {
            var wall = this.walls[i];

            if (wall.vertical) {
                if (wall.solid) {
                    if (wall.greater && position.x > wall.position) position.x = wall.position;
                    else if (!wall.greater && position.x < wall.position) position.x = wall.position;
                }
            } else {
                if (wall.solid) {
                    if (wall.greater && position.y > wall.position) position.y = wall.position;
                    else if (!wall.greater && position.y < wall.position) position.y = wall.position;
                }
            }
        }
    };

    Bounds.prototype.applyBounds = function (position, vector) {
        for (var i = 0; i < this.walls.length; ++i) {
            var wall = this.walls[i];

            if (wall.vertical) {
                var x_dist = wall.position - position.x;

                if (Math.abs(x_dist) < this.wall_distance) {
                    vector.x -= x_dist/Math.abs(x_dist) * (this.wall_distance/Math.abs(x_dist) - 1);
                }
            } else {
                var y_dist = wall.position - position.y;

                if (Math.abs(y_dist) < this.wall_distance) {
                    vector.y -= y_dist/Math.abs(y_dist) * (this.wall_distance/Math.abs(y_dist) - 1);
                }
            }
        }
    };

    return Bounds;
});
