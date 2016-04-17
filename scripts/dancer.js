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

        this.default_opinion = 0;

        this.targetvec = new PIXI.Point();
        this.movevec = new PIXI.Point();

        this.walkspeed = 10;

        this.personalspace = 30;

        this.idle = false;

        this.goal = null;
        this.goalcallback = null;

        this.toilets = toilets;
        this.toiletbreak = null;

        this.toilettime = 30000;
        this.toiletinterval = 500000;

        this.noavoid = false;
        this.noseek = false;

        this.returnpoint = null;
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

        if (this.idle) return;

        var x = this.graphics.x; var y = this.graphics.y;

        this.targetvec.x = 0;
        this.targetvec.y = 0;

        this.movevec.x = 0;
        this.movevec.y = 0;

        if (!this.goal && this.toiletbreak != null && time > this.toiletbreak) {
            this.returnpoint = this.graphics.position.clone();

            if (this.toilets.length == 0) return;

            var toilet_dist = null;
            var ti = null;

            for (var i = 0; i < this.toilets.length; ++i) {
                var tdx = this.toilets[i].x - x;
                var tdy = this.toilets[i].y - y;

                var td = Math.sqrt(Math.pow(tdx, 2) + Math.pow(tdy, 2));

                if (toilet_dist == null || td < toilet_dist) {
                    toilet_dist = td;
                    ti = i;
                }
            }

            this.noseek = true;
            this.setGoal(this.toilets[ti], () => {
                this.noavoid = true;
                this.idle = true;
                setTimeout(() => {
                    this.idle = false;
                    this.noavoid = false;
                    this.setGoal(this.returnpoint, () => {
                        this.noseek = false;
                        this.toiletbreak = null;
                    });
                }, this.toilettime);
            });

        }

        if (this.toiletbreak == null) {
            this.toiletbreak = time + this.toiletinterval * Math.random();
        }

        if (this.goal) {
            this.seekGoal(delta);
        } else {
            this.seekGroup(delta);
        }

        this.bounds.applyHardBounds(this.graphics);
    };

    Dancer.prototype.setGoal = function (goal, callback) {
        this.goal = goal;
        this.goalcallback = callback;

        console.log("Dancer "+this.ID+" set goal to "+this.goal.x+" "+this.goal.y);
    }

    Dancer.prototype.seekGoal = function (delta) {
        var x = this.graphics.x; var y = this.graphics.y;
        
        var dist_x = this.goal.x - x; var dist_y = this.goal.y - y;

        var dist = Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));

        if (dist < this.graphics.width/4) {
            if (this.goalcallback) this.goalcallback();
            this.goal = this.goalcallback = null;

            return;
        }

        this.movevec.x = dist_x / dist; this.movevec.y = dist_y / dist;

        this.move(delta);
    }

    Dancer.prototype.seekGroup = function (delta) {
        var x = this.graphics.x; var y = this.graphics.y;

        var opinionmass = Math.max(this.opinion.reduce((a,b)=>a+b,0) +
            (this.throng.dancers.length - this.num_opinions)
             * this.default_opinion, 1);
        
        for (var i = 0; i < this.throng.dancers.length; ++i) {
            if (i == this.ID) continue;

            var opinion;
            if (this.opinion[i] && !this.throng.dancers[i].noseek) {
                opinion = this.opinion[i];
            } else {
                opinion = this.default_opinion;
            }

            var dist_x = this.throng.dancers[i].graphics.x - x;
            var dist_y = this.throng.dancers[i].graphics.y - y;

            var dist = Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));

            var personalspacemvmt = 0;

            if (this.throng.dancers[i].noavoid) {
                personalspacemvmt = 0;
            } else if (dist < this.personalspace) {
                personalspacemvmt = - 2 * (this.personalspace/dist - 1);
            }

            this.movevec.x += (dist_x) * (opinion + personalspacemvmt) / (dist) / opinionmass;
            this.movevec.y += (dist_y) * (opinion + personalspacemvmt) / (dist) / opinionmass;

            this.targetvec.x += (dist_x) * opinion / (dist) / opinionmass;
            this.targetvec.y += (dist_y) * opinion / (dist) / opinionmass;
        }

        this.bounds.applyBounds(this.graphics, this.movevec);

        var targetnorm = Math.sqrt(Math.pow(this.targetvec.x, 2) + Math.pow(this.targetvec.y, 2));
        var movenorm = Math.sqrt(Math.pow(this.movevec.x, 2) + Math.pow(this.movevec.y, 2));

        if (movenorm < 0.04 * opinionmass) movenorm = 0.04 * opinionmass;

        if (targetnorm > 0.08 * opinionmass || movenorm > 0.04 * opinionmass) {
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
