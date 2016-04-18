// Receive user input, output actions

define(function () {
    Controller = function () {
        this.channels = ["touchstart", "touchend", "click",
                         "mousemove", "keydown", "keyup"];
        this.transmitChannel = "action";
        this.messagebus = new MessageBus();

        this.blocked = false;
    };

    Controller.prototype.block = function () {
        this.blocked = true;
    };

    Controller.prototype.unblock = function () {
        this.blocked = false;
    };

    Controller.prototype.attach = function (game) {
        var mb = game.messagebus;

        for (var i = 0; i < this.channels.length; ++i) {
            mb.registerOnChannel(this.channels[i], this);
        }
    };

    Controller.prototype.detach = function (game) {
        game.messagebus.unsubscribe(this);
    };

    Controller.prototype.receiveMessage = function (channel, message) {
        if (this.blocked) return;

        var process = this [ "process" + channel[0].toUpperCase() +
                             channel.substr(1)].bind(this);

        if (process != undefined) {
            process(message);
        }
    };

    Controller.prototype.processTouchstart = function (touchevent) {
        if (touchevent.touches.length > 0) {
            this.messagebus.sendMessage("control", { 
                action: "activate",
                x: touchevent.touches.item(0).pageX,
                y: touchevent.touches.item(0).pageY
            });
        };
    };

    Controller.prototype.processTouchend = function (touchevent) {
    };

    Controller.prototype.processClick = function (mouseevent) {
        this.messagebus.sendMessage("mouseclick",
                new PIXI.Point(mouseevent.clientX, mouseevent.clientY));
    };

    Controller.prototype.processMousemove = function (mouseevent) {
        this.messagebus.sendMessage("mouseposition", new PIXI.Point(mouseevent.clientX, mouseevent.clientY));
    };

    Controller.prototype.processKeydown = function (keyevent) {
        var cmd;

        if (keyevent.key) {
            cmd = this.mapKey(keyevent.key);
        } else if (keyevent.code) {
            cmd = this.mapKey(keyevent.code);
        }

        if (["up", "down", "left", "right", "shift", "talk"].indexOf(cmd) != -1) {
            this.messagebus.sendMessage("control", { control: cmd, active: true });
        }
    };

    Controller.prototype.processKeyup = function (keyevent) {
        var cmd;

        if (keyevent.key) {
            cmd = this.mapKey(keyevent.key);
        } else if (keyevent.code) {
            cmd = this.mapKey(keyevent.code);
        }

        if (["up", "down", "left", "right", "shift", "talk"].indexOf(cmd) != -1) {
            this.messagebus.sendMessage("control", { control: cmd, active: false });
        }
    };

    Controller.prototype.mapKey = function (key) {
        var cmd = null;

        switch (key) {
            case "ArrowUp":
            case "KeyW":
            case "w":
            case "W":
                cmd = "up";
                break;
            case "ArrowDown":
            case "KeyS":
            case "s":
            case "S":
                cmd = "down";
                break;
            case "ArrowLeft":
            case "KeyA":
            case "a":
            case "A":
                cmd = "left";
                break;
            case "ArrowRight":
            case "KeyD":
            case "d":
            case "D":
                cmd = "right";
                break;
            case "Shift":
            case "ShiftLeft":
            case "ShiftRight":
                cmd = "shift";
                break;
            case "Space":
            case " ":
                cmd = "talk";
                break
        }

        return cmd;
    }

    return Controller;
});
