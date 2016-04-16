define(['common/pixi.min'], function (PIXI) {
    Dancer = function (image, throng, bounds, toilets, colour) {
        this.graphics = new PIXI.Container();
        this.sprite = new PIXI.Sprite(image);

        this.colour = colour;
        this.border = new PIXI.Graphics();

        this.border.beginFill(colour, 1)
                   .drawRect(-this.sprite.width/16, -this.sprite.height/16,
                             this.sprite.width*(17/16), this.sprite.height*(17/16))
                   .endFill();
        
        this.graphics.addChild(this.border);
        this.graphics.addChild(this.sprite);

        this.graphics.pivot = new PIXI.Point(this.sprite.width/2, this.sprite.height/2);

        this.throng = throng;
        this.bounds = bounds;

        this.opinion = [];
        this.num_opinions = 0;

        this.default_opinion = 0.01;

        this.targetvec = new PIXI.Point();
        this.movevec = new PIXI.Point();

        this.walkspeed = 10;

        this.personalspace = 30;

        this.disengaged = false;

        this.toilets = toilets;
        this.toiletbreak = null;

        this.toilettime = 30000;
        this.toiletinterval = 180000;
    };

    Dancer.prototype.setID = function (ID) {
        this.ID = ID;
    };

    Dancer.prototype.updateOpinion = function (ID, opinion) {
        if (this.opinion[ID] == undefined && opinion != undefined) ++this.num_opinions;
        else if (this.opinion[ID] != undefined && opinion == undefined) --this.num_opinions;

        if (opinion != undefined) this.opinion[ID] = opinion;
        else delete this.opinion[ID];
    };

    Dancer.prototype.disengage = function () {
        this.disengaged = true;
    };

    Dancer.prototype.engage = function () {
        this.disengaged = false;
    };

    Dancer.prototype.update = function (delta, time) {
        if (this.ID == undefined) return;

        var x = this.graphics.x; var y = this.graphics.y;

        this.targetvec.x = 0;
        this.targetvec.y = 0;

        this.movevec.x = 0;
        this.movevec.y = 0;

        if (!this.disengaged && time > this.toiletbreak) {
            this.disengage();
            this.toiletbreak = time + this.toilettime;
        }

        if (this.disengaged) {
            if (time > this.toiletbreak) {
                this.engage();
                this.toiletbreak = null;
            }
            
            var toilet_dist_x, toilet_dist_y, toilet_dist;
            toilet_dist_x = toilet_dist_y = toilet_dist = null;

            for (var i = 0; i < this.toilets.length; ++i) {
                var tdx = this.toilets[i].x - x;
                var tdy = this.toilets[i].y - y;

                var td = Math.sqrt(Math.pow(tdx, 2) + Math.pow(tdy, 2));

                if (toilet_dist == null || td < toilet_dist) {
                    toilet_dist_x = tdx; toilet_dist_y = tdy;
                    toilet_dist = td;
                }
            }

            this.movevec.x = toilet_dist_x / toilet_dist;
            this.movevec.y = toilet_dist.y / toilet_dist;

            this.move(delta);

            return;
        }

        if (this.toiletbreak == null) {
            this.toiletbreak = time + this.toiletinterval * Math.random();
        }

        var opinionmass = Math.max(this.opinion.reduce((a,b)=>a+b,0) +
            (this.throng.dancers.length - this.num_opinions)
             * this.default_opinion, 1);
        
        for (var i = 0; i < this.throng.dancers.length; ++i) {
            if (i == this.ID) continue;

            var opinion;
            if (this.opinion[i] && !this.throng.dancers[i].disengaged) {
                opinion = this.opinion[i];
            } else {
                opinion = this.default_opinion;
            }

            var dist_x = this.throng.dancers[i].graphics.x - x;
            var dist_y = this.throng.dancers[i].graphics.y - y;

            var dist = Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));

            var personalspacemvmt = 0;

            if (dist < this.personalspace) {
                personalspacemvmt = - 2 * (this.personalspace/dist - 1);
            }

            this.movevec.x += (dist_x) * (opinion + personalspacemvmt) / (dist) / opinionmass;
            this.movevec.y += (dist_y) * (opinion + personalspacemvmt) / (dist) / opinionmass;

            this.targetvec.x += (dist_x) * opinion / (dist*2) / opinionmass;
            this.targetvec.y += (dist_y) * opinion / (dist*2) / opinionmass;
        }

        this.bounds.applyBounds(this.graphics, this.movevec);

        var targetnorm = Math.sqrt(Math.pow(this.targetvec.x, 2) + Math.pow(this.targetvec.y, 2));
        var movenorm = Math.sqrt(Math.pow(this.movevec.x, 2) + Math.pow(this.movevec.y, 2));

        if (movenorm < 0.04 * opinionmass) movenorm = 0.04 * opinionmass;

        if (targetnorm > 0.04 * opinionmass || movenorm > 0.04 * opinionmass) {
            this.movevec.x /= movenorm; this.movevec.y /= movenorm;

            this.move(delta);
        }
    };

    Dancer.prototype.move = function (delta) {
        this.graphics.x += this.movevec.x * this.walkspeed * delta/1000;
        this.graphics.y += this.movevec.y * this.walkspeed * delta/1000;
    };

    return Dancer;
});
