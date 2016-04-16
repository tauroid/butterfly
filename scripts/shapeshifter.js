define(['common/pixi.min', 'dancer'], function (PIXI, Dancer) {
    Shapeshifter = function (image, floor, throng, bounds, controller) {
        Dancer.apply(this, [image, throng, bounds, 0xAAAAAA]);

        this.floor = floor;

        this.shiftindicator = new PIXI.Graphics();

        this.shiftindicator.beginFill(0xFF00FF, 0.6)
                           .drawRect(-2*this.sprite.width/16, -2*this.sprite.height/16,
                                     this.sprite.width*(19/16), this.sprite.height*(19/16))
                           .endFill();

        this.shiftindicator.pivot = new PIXI.Point(this.sprite.width/2, this.sprite.height/2);
        
        this.shiftindicator.visible = false;

        this.floor.addChild(this.shiftindicator);

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

        this.border.clear()
                   .beginFill(dancer.colour, 1)
                   .drawRect(-this.sprite.width/16, -this.sprite.height/16,
                             this.sprite.width*(17/16), this.sprite.height*(17/16))
                   .endFill();

    };

    Shapeshifter.prototype.update = function (delta, time) {
        this.movevec.x = 0;
        this.movevec.y = 0;

        if (this.controls.up) this.movevec.y -= 1;
        if (this.controls.down) this.movevec.y += 1;
        if (this.controls.left) this.movevec.x -= 1;
        if (this.controls.right) this.movevec.x += 1;
        
        var norm = Math.sqrt(Math.pow(this.movevec.x, 2) + Math.pow(this.movevec.y, 2));

        if (norm > 0) {
            this.movevec.x /= norm; this.movevec.y /= norm;

            this.graphics.x += this.movevec.x * this.walkspeed * delta/1000;
            this.graphics.y += this.movevec.y * this.walkspeed * delta/1000;
        }

        this.bounds.applyHardBounds(this.graphics);

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
    };

    return Shapeshifter;
});
