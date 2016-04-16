define(['common/pixi.min', 'controller', 'pixiwindow',
        'dancer', 'throng', 'shapeshifter', 'bounds'],
        function (PIXI, Controller, PIXIWindow, Dancer, Throng, Shapeshifter, Bounds) {
    Butterfly = function (game) {
        this.name = "Butterfly";
        this.game = game;

        this.group = {
            logicgroup: [],
            gamewindows: []
        };
    };

    Butterfly.prototype.load = function () {
        var g = this.game;
        var grp = this.group;

        var controller = new Controller();
        controller.attach(g);

        this.container = new PIXI.Container();
        this.floor = new PIXI.Container();

        this.floor.x = window.innerWidth / 2;
        this.floor.y = window.innerHeight / 2;

        this.floor.scale.x = 4;
        this.floor.scale.y = 4;

        var floorside = 128;

        this.floor.pivot.x = floorside / 2;
        this.floor.pivot.y = floorside / 2;

        var floorbackfill = new PIXI.Graphics();

        floorbackfill.beginFill(0x00FF00, 1)
                     .drawRect(0, 0, floorside, floorside)
                     .endFill();

        this.floor.addChild(floorbackfill);

        this.bounds = new Bounds();

        this.bounds.addWall(0, true, true, false)
                   .addWall(0, false, true, false)
                   .addWall(floorside, true, true, true)
                   .addWall(floorside, false, true, true);

        var cross = new PIXI.Graphics();

        cross.lineStyle(1, 0xFFFFFF, 1)
             .moveTo(0, this.floor.y)
             .lineTo(window.innerWidth, this.floor.y)
             .moveTo(this.floor.x, 0)
             .lineTo(this.floor.x, window.innerHeight);

        this.container.addChild(cross);

        this.throng = new Throng(g, this.group, this.floor, this.bounds);
        this.container.addChild(this.floor);

        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside/2), 0xFF0000);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside/2), 0x00FFFF);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside/2), 0x0000FF);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside/2), 0xFFFF00);

        this.shapeshifter = new Shapeshifter(g.assets.images.place, this.floor, this.throng, this.bounds, controller);
        this.throng.addDancer(this.shapeshifter);

        this.gamewindow = new PIXIWindow(undefined, undefined, this.container);
        grp.gamewindows.push(this.gamewindow);

        g.createGroup(this.name, this.group);
        g.activateGroup(this.name);
    };

    Butterfly.prototype.unload = function () {
        var g = this.game;

        g.deleteGroup(this.name);
    };

    return Butterfly;
});
