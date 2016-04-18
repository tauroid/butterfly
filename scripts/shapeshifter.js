define(['common/pixi.min', 'dancer'], function (PIXI, Dancer) {
    Shapeshifter = function (game, image, club, throng, controller) {
        Dancer.apply(this, [game, throng, club, 0xAAAAAA]);

        this.shiftindicator = new PIXI.Graphics();

        this.shiftindicator.beginFill(0xFF00FF, 0.6)
                           .drawRect(-2*this.sprite.width/16, -2*this.sprite.height/16,
                                     this.sprite.width*(19/16), this.sprite.height*(19/16))
                           .endFill();

        this.shiftindicator.pivot = new PIXI.Point(this.sprite.width/2, this.sprite.height/2);
        
        this.shiftindicator.visible = false;

        this.club.floorcontainer.addChild(this.shiftindicator);

        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false
        };

        this.walkspeed = 20;

        this.mouseposition = new PIXI.Point();

        this.currentselection = null;

        this.backupopinions = [];

        this.talkClique = null;
        this.startedTalking = null;
        this.talkBar = new PIXI.Graphics();

        this.impersonating = null;
        this.hasSpottedMe = [];

        this.talkBar.beginFill(0xFF00FF, 1)
                    .drawRect(0, -2/16*(this.sprite.height), this.sprite.width, this.sprite.height/16)
                    .endFill();

        this.talkBar.visible = false;

        this.graphics.addChild(this.talkBar);

        controller.messagebus.registerOnChannel("control", this);
        controller.messagebus.registerOnChannel("mouseposition", this);
        controller.messagebus.registerOnChannel("mouseclick", this);
    };

    Shapeshifter.prototype = Object.create(Dancer.prototype);
    Shapeshifter.prototype.constructor = Shapeshifter;

    Shapeshifter.prototype.receiveMessage = function (channel, message) {
        if (channel == "control") this.updateControl(message);
        if (channel == "mouseposition") this.updateMouse(message);
        if (channel == "mouseclick") this.impersonate(this.currentselection);
    };

    Shapeshifter.prototype.updateControl = function (cmd) {
        this.controls[cmd.control] = cmd.active;

        if (cmd.control == "talk") {
            if (cmd.active) this.talk();
            else this.stopTalking();
        }
    };

    Shapeshifter.prototype.updateMouse = function (position) {
        this.mouseposition.x = position.x; this.mouseposition.y = position.y;
    };

    Shapeshifter.prototype.impersonate = function (ID) {
        if (ID == null) return this;

        for (var i = 0; i < this.throng.dancers.length; ++i) {
            var dancer = this.throng.dancers[i];

            dancer.updateOpinion(this.ID, dancer.opinion[ID]);
        }

        var dancer = this.throng.dancers[ID];

        this.impersonating = ID;
        this.clique = dancer.clique;

        this.walk_f_tex = dancer.walk_f_tex;
        this.walk_b_tex = dancer.walk_b_tex;
        this.f_tex = dancer.f_tex;
        this.b_tex = dancer.b_tex;
        this.hat_f_tex = dancer.hat_f_tex;
        this.hat_b_tex = dancer.hat_b_tex;
        this.top_f_tex = dancer.top_f_tex;
        this.top_b_tex = dancer.top_b_tex;
        this.leg_f_tex = dancer.leg_f_tex;
        this.leg_b_tex = dancer.leg_b_tex;

        this.label.text = this.ID.toString()+"/"+this.impersonating.toString();

        this.border.clear()
                   .beginFill(dancer.colour, 1)
                   .drawRect(-this.sprite.width/16, -this.sprite.height/16,
                             this.sprite.width*(17/16), this.sprite.height*(17/16))
                   .endFill();

        return this;
    };

    Shapeshifter.prototype.talk = function () {
        if (this.talkClique != null) return;

        var nearest = this.throng.findNearest(this.ID);

        console.log("start talk");

        this.talkClique = this.throng.cliques[this.throng.dancers[nearest].clique];
        this.startedTalking = this.game.getTime();

        this.talkBar.visible = true;

        for (var i = 0; i < this.talkClique.length; ++i) {
            this.throng.dancers[this.talkClique[i]].listen(this.ID);
        }
    };

    Shapeshifter.prototype.stopTalking = function () {
        if (this.talkClique == null) return;

        console.log("stop talk");

        for (var i = 0; i < this.talkClique.length; ++i) {
            this.throng.dancers[this.talkClique[i]].stopListening();
        }

        this.talkClique = null;
        this.startedTalking = null;

        this.talkBar.visible = false;
    };

    Shapeshifter.prototype.updateTalkBar = function (time) {
        this.talkBar.scale.x = (time - this.startedTalking) / 15000;
    };

    Shapeshifter.prototype.detectSpotted = function () {
        if (this.impersonating != null && this.throng.hasLineOfSight(this.ID, this.impersonating)) {
            this.throng.dancers[this.impersonating].spotImpersonator(this.ID);
            this.hasSpottedMe.push(this.impersonating);
        }
    };

    Shapeshifter.prototype.update = function (delta, time) {
        this.movevec.x = 0;
        this.movevec.y = 0;

        if (this.controls.up) this.movevec.y -= 1;
        if (this.controls.down) this.movevec.y += 1;
        if (this.controls.left) this.movevec.x -= 1;
        if (this.controls.right) this.movevec.x += 1;

        if (this.startedTalking) this.updateTalkBar(time);

        var norm = Math.sqrt(Math.pow(this.movevec.x, 2) + Math.pow(this.movevec.y, 2));

        if (norm > 0) {
            this.movevec.x /= norm; this.movevec.y /= norm;

            this.graphics.x += this.movevec.x * this.walkspeed * delta/1000;
            this.graphics.y += this.movevec.y * this.walkspeed * delta/1000;
        }

        this.club.bounds.applyHardBounds(this.graphics, this.sprite.width, this.sprite.height);

        if (this.hasSpottedMe.indexOf(this.impersonating) == -1) this.detectSpotted();

        var clearselection = false;

        if (this.controls.shift) {
            var dancerID = this.throng.getDancerAt(this.mouseposition);

            if (dancerID != null) {            
                var dancer = this.throng.dancers[dancerID];

                if (dancer && dancer != this) {
                    this.shiftindicator.visible = true;
                    this.shiftindicator.position = dancer.graphics.position;
                    this.currentselection = dancerID;
                }
            } else {
                clearselection = true;
            }
        } else {
            clearselection = true;
        }

        if (clearselection) {
            this.shiftindicator.visible = false;
            this.currentselection = null;
        }

        var move_x = this.movevec.x * this.walkspeed;
        var move_y = this.movevec.y * this.walkspeed;

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
            } else if (this.sprite.texture == this.b_tex) {
                this.sprite.texture = this.walk_b_tex;
                this.hat_sprite.texture = this.hat_b_tex;
                this.top_sprite.texture = this.top_b_tex;
                this.leg_sprite.texture = this.leg_b_tex;
                this.clothescontainer.y = -1;
            } else if (this.sprite.texture == this.f_tex) {
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

    return Shapeshifter;
});
