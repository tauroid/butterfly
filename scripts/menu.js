define(function () {
    Menu = function (game) {
        this.game = game;

        this.entries = [];
    };

    Menu.prototype.load = function () {
        this.controller = new Controller();
        this.controller.attach(this.game);

        this.controller.messagebus.registerOnChannel("mouseclick", this);
        this.controller.messagebus.registerOnChannel("mouseposition", this);
    };

    Menu.prototype.unload = function () {
        this.controller.detach(this.game);
    };

    Menu.prototype.createEntry = function (options) {
        this.entries.push(options);
    };

    Menu.prototype.receiveMessage = function (channel, message) {
        if (channel == "mouseclick") this.processClick(message);
        else if (channel == "mouseposition") this.processMousemove(message);
    };

    Menu.prototype.processClick = function (position) {
        for (var i = 0; i < this.entries.length; ++i) {
            var entry = this.entries[i];
            var wt = entry.thing.worldTransform;

            var mappedpoint = wt.applyInverse(position);

            if (entry.rect.contains(mappedpoint.x, mappedpoint.y)) {
                entry.callback();
            }
        }
    };

    Menu.prototype.processMousemove = function (position) {
        for (var i = 0; i < this.entries.length; ++i) {
            var entry = this.entries[i];
            var wt = entry.thing.worldTransform;

            var mappedpoint = wt.applyInverse(position);

            if (entry.rect.contains(mappedpoint.x, mappedpoint.y)) {
                if (!entry.mousedover) {
                    entry.mousedover = true;
                    if (entry.mouseovercallback) entry.mouseovercallback();
                }
            } else if (entry.mousedover) {
                entry.mousedover = false;
                if (entry.mouseoutcallback) entry.mouseoutcallback();
            }
        }
    };

    return Menu;
});
