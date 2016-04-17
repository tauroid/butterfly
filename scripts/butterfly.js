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

        this.bounds.addWall({ position: 0, vertical: true, solid: true, greater: false })
                   .addWall({ position: 0, vertical: false, solid: true, greater: false })
                   .addWall({ position: floorside, vertical: true, solid: true, greater: true, extents: [0, 4*floorside/5] })
                   .addWall({ position: floorside, vertical: true, solid: true, greater: true, extents: [9*floorside/10, floorside] })
                   .addWall({ position: floorside, vertical: false, solid: true, greater: true, extents: [0, floorside/10] })
                   .addWall({ position: floorside, vertical: false, solid: true, greater: true, extents: [floorside/5, floorside] })
                   .addWall({ position: 4*floorside/5, vertical: false, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: 9*floorside/10, vertical: false, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside*(1+1.5/8), vertical: true })
                   .addWall({ position: floorside/10, vertical: true, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside/5, vertical: true, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside*(1+1.5/8), vertical: false });

        var cross = new PIXI.Graphics();

        cross.lineStyle(1, 0xFFFFFF, 1)
             .moveTo(0, this.floor.y)
             .lineTo(window.innerWidth, this.floor.y)
             .moveTo(this.floor.x, 0)
             .lineTo(this.floor.x, window.innerHeight);

        this.container.addChild(cross);

        this.toilets = [
            new PIXI.Point((1+1/8)*floorside, 17*floorside/20),
            new PIXI.Point(3*floorside/20, (1+1/8)*floorside)
        ];

        this.throng = new Throng(g, this.group, this.floor, this.bounds, this.toilets);
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
