define(['common/pixi.min', 'controller', 'pixiwindow'],
        function (PIXI, Controller, PIXIWindow) {
    PixelStage = function (game) {
        this.name = "PixelStage";
        this.game = game;

        this.group = {
            logicgroup: [],
            gamewindows: []
        };
    };

    PixelStage.prototype.load = function () {
        var g = this.game;
        var grp = this.group;

        var controller = new Controller();
        controller.attach(g);

        this.container = new PIXI.Container();
        this.floor = new PIXI.Container();

        this.floor.x = window.innerWidth / 2;
        this.floor.y = window.innerHeight / 2;

        place = new PIXI.Sprite(g.assets.images.place);

        place.scale.x = 8;
        place.scale.y = 8;

        this.container.addChild(place);

        this.gamewindow = new PIXIWindow(undefined, undefined, this.container);
        grp.gamewindows.push(this.gamewindow);

        g.createGroup(this.name, this.group);
        g.activateGroup(this.name);
    };

    PixelStage.prototype.unload = function () {
        var g = this.game;

        g.deleteGroup(this.name);
    };

    return PixelStage;
});
