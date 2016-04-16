define(function () {
    Throng = function (game, gamegroup, floorcontainer, bounds, toilets) {
        this.game = game;
        this.dancers = [];

        this.gamegroup = gamegroup;
        this.floorcontainer = floorcontainer;
        this.bounds = bounds;
        this.toilets = toilets;
    };

    Throng.prototype.createClique = function (number, point, colour) {
        if (number == 0) return this;

        var g = this.game;

        var startID = this.dancers.length;

        for (var i = 0; i < number; ++i) {
            var dancer = new Dancer(g.assets.images.place, this, this.bounds, this.toilets, colour);
            for (var j = 0; j < number; ++j) {
                if (j == i) continue;

                dancer.updateOpinion(startID + j, 1);
            }

            dancer.graphics.position.x = Math.random()*80 + point.x - 40;
            dancer.graphics.position.y = Math.random()*80 + point.y - 40;
            this.addDancer(dancer);
        }
    };

    Throng.prototype.addDancer = function (dancer) {
        this.floorcontainer.addChild(dancer.graphics);
        this.gamegroup.logicgroup.push(dancer);

        var dancerID = this.dancers.push(dancer) - 1;

        dancer.setID(dancerID);

        return dancerID;
    };

    Throng.prototype.getDancerAt = function (position) {
        for (var i = 0; i < this.dancers.length; ++i) {
            var dancer = this.dancers[i];

            var wt = this.dancers[i].graphics.worldTransform;

            var mappedpoint = wt.applyInverse(position);

            var rect = new PIXI.Rectangle(0, 0, dancer.sprite.width, dancer.sprite.height);
            if (rect.contains(mappedpoint.x, mappedpoint.y)) return i;
        }

        return null;
    };

    return Throng;
});
