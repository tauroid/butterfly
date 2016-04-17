define(function () {
    Throng = function (game, gamegroup, club) {
        this.game = game;
        this.dancers = [];
        this.cliques = [];

        this.club = club;
        this.gamegroup = gamegroup;
    };

    Throng.prototype.createClique = function (number, point, colour) {
        if (number == 0) return this;

        var g = this.game;

        var clique = this.cliques.push([]) - 1;

        var startID = this.dancers.length;

        for (var i = 0; i < number; ++i) {
            var dancer = new Dancer(g, g.assets.images.place, this, this.club, colour);

            for (var j = 0; j < number; ++j) {
                if (j == i) continue;

                dancer.updateOpinion(startID + j, 1);
            }

            dancer.graphics.position.x = Math.random()*80 + point.x - 40;
            dancer.graphics.position.y = Math.random()*80 + point.y - 40;
            var dancerID = this.addDancer(dancer);

            dancer.setClique(clique);
            this.cliques[clique].push(dancerID);
        }
    };

    Throng.prototype.addDancer = function (dancer) {
        this.club.floorcontainer.addChild(dancer.graphics);
        this.gamegroup.logicgroup.push(dancer);

        var dancerID = this.dancers.push(dancer) - 1;

        dancer.setID(dancerID);

        return dancerID;
    };

    Throng.prototype.getDancerAt = function (position) {
        for (var i = 0; i < this.dancers.length; ++i) {
            var dancer = this.dancers[i];

            var wt = dancer.graphics.worldTransform;

            var mappedpoint = wt.applyInverse(position);

            var rect = new PIXI.Rectangle(0, 0, dancer.sprite.width, dancer.sprite.height);
            if (rect.contains(mappedpoint.x, mappedpoint.y)) return i;
        }

        return null;
    };

    Throng.prototype.findNearest = function (ID) {
        var position = this.dancers[ID].graphics.position;
        var nearest_dist = null;
        var nearest = null;

        for (var i = 0; i < this.dancers.length; ++i) {
            if (i == ID) continue;

            var d_pos = this.dancers[i].graphics.position;

            var dist = Math.sqrt(Math.pow(d_pos.x - position.x, 2) +
                                 Math.pow(d_pos.y - position.y, 2));

            if (nearest_dist == null || dist < nearest_dist) {
                nearest_dist = dist;
                nearest = i;
            }
        }

        return nearest;
    };

    Throng.prototype.cliqueLeaves = function (cliqueID) {
        for (var i = 0; i < this.cliques[cliqueID].length; ++i) {
            var dancerID = this.cliques[cliqueID][i];
            var dancer = this.dancers[dancerID];
            var callback = function () {
                this.dancer.idle = true
            };

            var data = {
                dancerID: dancerID,
                dancer: dancer
            };

            dancer.setGoal(this.club.exit, callback.bind(data));
            dancer.noavoid = true;
        }
    };

    Throng.prototype.hasLineOfSight = function (ID1, ID2) {
        var pos1 = this.dancers[ID1].graphics.position;
        var pos2 = this.dancers[ID2].graphics.position;

        var diffvec_x = pos2.x - pos1.x; var diffvec_y = pos2.y - pos1.y;
        var diffvec_norm = Math.sqrt(Math.pow(diffvec_x, 2) + Math.pow(diffvec_y, 2));

        for (var i = 0; i < this.dancers.length; ++i) {
            if (i == ID1 || i == ID2) continue;

            var pos3 = this.dancers[i].graphics.position;

            var diffvec2_x = pos3.x - pos1.x; var diffvec2_y = pos3.y - pos1.y;
            var diffvec2_norm = Math.sqrt(Math.pow(diffvec2_x, 2) + Math.pow(diffvec2_y, 2));

            var dot_diff = diffvec_x * diffvec2_x + diffvec_y * diffvec2_y;
            var cross_diff = diffvec_x * diffvec2_y - diffvec_y * diffvec2_x;

            var dist_along_line = dot_diff / diffvec_norm;
            var dist_from_line = Math.abs(cross_diff / diffvec_norm);

            if (dist_along_line > 0 && dist_along_line < diffvec_norm &&
                    dist_from_line < this.dancers[i].sprite.width/2) {
                return false;
            }
        }

        return true;
    };

    return Throng;
});
