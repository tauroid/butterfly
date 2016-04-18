define(['common/pixi.min'], function (PIXI) {
    Dancer = function (game, throng, club, colour) {
        this.game = game;
        var g = game;
        this.graphics = new PIXI.Container();

        var chooseperson = Math.floor(3*Math.random());
        var personimg, personimg_walk;

        if (chooseperson < 2) {
            personimg = game.assets.images.person1.baseTexture;
            personimg_walk = game.assets.images.person1_walk.baseTexture;
        } else {
            personimg = game.assets.images.person2.baseTexture;
            personimg_walk = game.assets.images.person2_walk.baseTexture;
        }

        var f_frame = new PIXI.Rectangle(0, 0, 11, 19);
        var b_frame = new PIXI.Rectangle(11, 0, 11, 19);

        this.f_tex = new PIXI.Texture(personimg, f_frame);
        this.b_tex = new PIXI.Texture(personimg, b_frame);
        this.walk_f_tex = new PIXI.Texture(personimg_walk, f_frame);
        this.walk_b_tex = new PIXI.Texture(personimg_walk, b_frame);

        this.sprite = new PIXI.Sprite(this.b_tex);

        this.spritecontainer = new PIXI.Container();
        this.spritecontainer.addChild(this.sprite);

        this.spritecontainer.pivot.x = this.sprite.width/2;
        this.spritecontainer.pivot.y = 2*this.sprite.height/3;

        this.spritecontainer.x = this.sprite.width/2;
        this.spritecontainer.y = this.sprite.height/2;

        this.clothescontainer = new PIXI.Container();
        this.spritecontainer.addChild(this.clothescontainer);

        var choosetop = Math.floor(4*Math.random());

        var top_f_frame = new PIXI.Rectangle(0, choosetop*19, 11, 19);
        var top_b_frame = new PIXI.Rectangle(11, choosetop*19, 11, 19);

        this.top_f_tex = new PIXI.Texture(g.assets.images.tops.baseTexture, top_f_frame);
        this.top_b_tex = new PIXI.Texture(g.assets.images.tops.baseTexture, top_b_frame);

        this.top_sprite = new PIXI.Sprite(this.top_b_tex);

        this.clothescontainer.addChild(this.top_sprite);

        var choosehat = Math.floor(4*Math.random());

        var hat_f_frame = new PIXI.Rectangle(0, choosehat*19, 11, 19);
        var hat_b_frame = new PIXI.Rectangle(11, choosehat*19, 11, 19);

        this.hat_f_tex = new PIXI.Texture(g.assets.images.hats.baseTexture, hat_f_frame);
        this.hat_b_tex = new PIXI.Texture(g.assets.images.hats.baseTexture, hat_b_frame);

        this.hat_sprite = new PIXI.Sprite(this.hat_b_tex);

        this.clothescontainer.addChild(this.hat_sprite);

        var chooseleg = Math.floor(4*Math.random());

        var leg_f_frame = new PIXI.Rectangle(0, chooseleg*19, 11, 19);
        var leg_b_frame = new PIXI.Rectangle(11, chooseleg*19, 11, 19);

        this.leg_f_tex = new PIXI.Texture(g.assets.images.legs.baseTexture, leg_f_frame);
        this.leg_b_tex = new PIXI.Texture(g.assets.images.legs.baseTexture, leg_b_frame);

        this.leg_sprite = new PIXI.Sprite(this.leg_b_tex);

        this.clothescontainer.addChild(this.leg_sprite);

        this.colour = colour;
        this.border = new PIXI.Graphics();

        this.border.beginFill(colour, 1)
                   .drawRect(-this.sprite.width/16, -this.sprite.height/16,
                             this.sprite.width*(17/16), this.sprite.height*(17/16))
                   .endFill();

        this.label = new PIXI.Text("", { fill: '#FFFFFF' });
        this.label.scale.x = this.label.scale.y = 1/8;
        this.label.position.y = -this.sprite.height/4;
        
        //this.graphics.addChild(this.border);
        this.graphics.addChild(this.spritecontainer);
        //this.graphics.addChild(this.label);

        this.graphics.pivot = new PIXI.Point(this.sprite.width/2, 2*this.sprite.height/3);

        this.throng = throng;
        this.club = club;

        this.opinion = [];
        this.num_opinions = 0;

        this.default_opinion = 0;
        this.max_opinion = 1;
        this.opinion_delay_time = 5000;
        this.appreciation_rate = 1/10;

        this.listeningTo = null;
        this.startedListening = null;
        this.default_talker_opinion = 1;
        this.backup_talker_opinion = null;

        this.targetvec = new PIXI.Point();
        this.movevec = new PIXI.Point();

        this.walkspeed = 10;

        this.personalspace = 30;

        this.idle = false;

        this.goal = null;
        this.goalcallback = null;
        this.goalrange = null;
        this.defaultgoalrange = 3;

        this.toiletbreak = null;

        this.toilettime = 30000;
        this.toiletinterval = 500000;

        this.noavoid = false;
        this.noseek = false;

        this.returnpoint = null;

        this.lookingOut = true;

        this.laststep = game.getTime();
        this.stepdelay = 200;
    };

    Dancer.prototype.setID = function (ID) {
        this.ID = ID;

        this.label.text = this.ID.toString();
    };

    Dancer.prototype.setClique = function (clique) {
        this.clique = clique;
    };

    Dancer.prototype.updateOpinion = function (ID, opinion) {
        if (this.opinion[ID] == undefined && opinion != undefined) ++this.num_opinions;
        else if (this.opinion[ID] != undefined && opinion == undefined) --this.num_opinions;

        if (opinion != undefined) this.opinion[ID] = opinion;
        else delete this.opinion[ID];
    };

    Dancer.prototype.listen = function (ID) {
        if (this.listeningTo != null) return;

        this.listeningTo = ID;
        this.startedListening = this.game.getTime();

        this.backup_talker_opinion = this.opinion[this.listeningTo];
        this.updateOpinion(this.listeningTo, this.default_talker_opinion);
    };

    Dancer.prototype.stopListening = function () {
        if (this.listeningTo == null) return;

        this.updateOpinion(this.listeningTo, this.backup_talker_opinion);
        this.listeningTo = null;
        this.startedListening = null;
    };

    Dancer.prototype.spotImpersonator = function (ID) {
        this.setGoal(this.throng.dancers[ID].graphics,
                     () => { this.throng.cliqueLeaves(this.clique); },
                     this.sprite.width*2);
    };

    Dancer.prototype.update = function (delta, time) {
        if (this.ID == undefined) return;

        if (this.idle) return;

        var x = this.graphics.x; var y = this.graphics.y;

        this.targetvec.x = 0;
        this.targetvec.y = 0;

        this.movevec.x = 0;
        this.movevec.y = 0;

        this.thinkAboutOpinions(delta);

        if (!this.goal && this.toiletbreak != null && time > this.toiletbreak) {
            this.returnpoint = this.graphics.position.clone();

            if (this.club.toilets.length == 0) return;

            var toilet_dist = null;
            var ti = null;

            for (var i = 0; i < this.club.toilets.length; ++i) {
                var tdx = this.club.toilets[i].x - x;
                var tdy = this.club.toilets[i].y - y;

                var td = Math.sqrt(Math.pow(tdx, 2) + Math.pow(tdy, 2));

                if (toilet_dist == null || td < toilet_dist) {
                    toilet_dist = td;
                    ti = i;
                }
            }

            this.noseek = true;
            this.setGoal(this.club.toilets[ti], () => {
                this.lookingOut = false;
                this.noavoid = true;
                this.idle = true;
                setTimeout(() => {
                    this.idle = false;
                    this.noavoid = false;
                    this.lookingOut = true;
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

        this.club.bounds.applyHardBounds(this.graphics, this.sprite.width, this.sprite.height);
    };

    Dancer.prototype.thinkAboutOpinions = function (delta) {
        if (this.listeningTo != null) {
            var listentime = this.game.getTime() - this.startedListening;

            if (listentime > this.opinion_delay_time) {
                var listenCliqueID = this.throng.dancers[this.listeningTo].clique;

                if (listenCliqueID != undefined) {
                    var listenClique = this.throng.cliques[listenCliqueID];

                    for (var i = 0; i < listenClique.length; ++i) {
                        var prevOpinion = this.opinion[listenClique[i]];
                        if (prevOpinion == undefined) {
                            this.updateOpinion(listenClique[i], this.default_opinion);
                        } else {
                            this.updateOpinion(listenClique[i], Math.min
                                        (prevOpinion + this.appreciation_rate * delta / 1000,
                                         this.max_opinion));
                        }
                    }
                }
            }
        }
    };

    Dancer.prototype.setGoal = function (goal, callback, range) {
        if (this.goalcallback) {
            var callback = this.goalcallback;
            this.goalcallback = null;
            callback();
        }

        this.goal = goal;
        this.goalcallback = callback;
        this.goalrange = range;
    }

    Dancer.prototype.seekGoal = function (delta) {
        var x = this.graphics.x; var y = this.graphics.y;
        
        var dist_x = this.goal.x - x; var dist_y = this.goal.y - y;

        var dist = Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));

        var range;
        if (this.goalrange) range = this.goalrange;
        else range = this.defaultgoalrange;

        if (dist < range) {
            this.goal = null;

            if (this.goalcallback) {
                var callback = this.goalcallback;
                this.goalcallback = null;
                callback();
            }

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
                personalspacemvmt = - 4 * (this.personalspace/dist - 1);
            }

            this.movevec.x += (dist_x) * (opinion + personalspacemvmt) / opinionmass;
            this.movevec.y += (dist_y) * (opinion + personalspacemvmt) / opinionmass;

            this.targetvec.x += (dist_x) * opinion / opinionmass;
            this.targetvec.y += (dist_y) * opinion / opinionmass;
        }

        this.club.bounds.applyBounds(this.graphics, this.movevec);

        var targetnorm = Math.sqrt(Math.pow(this.targetvec.x, 2) + Math.pow(this.targetvec.y, 2));
        var movenorm = Math.sqrt(Math.pow(this.movevec.x, 2) + Math.pow(this.movevec.y, 2));

        //if (movenorm < 0.06 * opinionmass) movenorm = 0.06 * opinionmass;
        var multiplier = 1;
        if (movenorm < this.sprite.width) multiplier = movenorm / (this.sprite.width);

        if ((targetnorm > this.sprite.width && movenorm > 0) || movenorm > this.sprite.width) {
            this.movevec.x *= multiplier / movenorm; this.movevec.y *= multiplier / movenorm;

            this.move(delta);
        }
    }; 

    Dancer.prototype.move = function (delta) {
        var move_x = this.movevec.x * this.walkspeed;
        var move_y = this.movevec.y * this.walkspeed;

        this.graphics.x += move_x * delta/1000;
        this.graphics.y += move_y * delta/1000;

        var speed = Math.sqrt(Math.pow(move_x, 2) + Math.pow(move_y, 2));

        var time = this.game.getTime();
        if (speed > 2) {
            if (time - this.laststep > this.stepdelay) {
                this.laststep = time;

                this.spritecontainer.scale.x *= -1;
            }

            if (this.movevec.y < 0 && this.sprite.texture != this.walk_b_tex) {
                this.sprite.texture = this.walk_b_tex;
                this.hat_sprite.texture = this.hat_b_tex;
                this.top_sprite.texture = this.top_b_tex;
                this.leg_sprite.texture = this.leg_b_tex;
                this.clothescontainer.y = -1;
            } else if (this.movevec.y > 0 && this.sprite.texture != this.walk_f_tex) {
                this.sprite.texture = this.walk_f_tex;
                this.hat_sprite.texture = this.hat_f_tex;
                this.top_sprite.texture = this.top_f_tex;
                this.leg_sprite.texture = this.leg_f_tex;
                this.clothescontainer.y = -1;
            }
        } else {
            if (this.sprite.texture == this.walk_f_tex) {
                this.sprite.texture = this.f_tex;
                this.hat_sprite.texture = this.hat_f_tex;
                this.top_sprite.texture = this.top_f_tex;
                this.leg_sprite.texture = this.leg_f_tex;
                this.clothescontainer.y = 0;
            } else if (this.sprite.texture == this.walk_b_tex) {
                this.sprite.texture = this.b_tex;
                this.hat_sprite.texture = this.hat_b_tex;
                this.top_sprite.texture = this.top_b_tex;
                this.leg_sprite.texture = this.leg_b_tex;
                this.clothescontainer.y = 0;
            }
        }
    };

    return Dancer;
});
