// Receive user input, output actions

define(function () {
    Controller = function () {
        this.channels = ["touchstart", "touchend", "click",
                         "mousemove", "keydown", "keyup"];
        this.transmitChannel = "action";
        this.messagebus = new MessageBus();
    };

    Controller.prototype.attach = function (game) {
        var mb = game.messagebus;

        for (var i = 0; i < this.channels.length; ++i) {
            mb.registerOnChannel(this.channels[i], this);
        }
    };

    Controller.prototype.receiveMessage = function (channel, message) {
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
        var cmd = this.mapKey(keyevent.key);

        if (["up", "down", "left", "right", "shift"].indexOf(cmd) != -1) {
            this.messagebus.sendMessage("control", { control: cmd, active: true });
        }
    };

    Controller.prototype.processKeyup = function (keyevent) {
        var cmd = this.mapKey(keyevent.key);

        if (["up", "down", "left", "right", "shift"].indexOf(cmd) != -1) {
            this.messagebus.sendMessage("control", { control: cmd, active: false });
        }
    };

    Controller.prototype.mapKey = function (key) {
        var cmd = null;

        switch (key) {
            case "ArrowUp":
            case "w":
            case "W":
                cmd = "up";
                break;
            case "ArrowDown":
            case "s":
            case "S":
                cmd = "down";
                break;
            case "ArrowLeft":
            case "a":
            case "A":
                cmd = "left";
                break;
            case "ArrowRight":
            case "d":
            case "D":
                cmd = "right";
                break;
            case "Shift":
                cmd = "shift";
                break;
        }

        return cmd;
    }

    return Controller;
});
