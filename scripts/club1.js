define(['dancer', 'throng', 'shapeshifter', 'bounds', 'clubclock', 'overlay', 'finishoverlay', 'menu'],
        function (Dancer, Throng, Shapeshifter, Bounds, ClubClock, Overlay, FinishOverlay, Menu) {
    Club1 = function (game, butterfly) {
        this.game = game;
        this.butterfly = butterfly;
        this.name = "Club1";

        this.group = {
            logicgroup: [],
            gamewindows: []
        };
    };

    Club1.prototype.load = function () {
        var g = this.game;
        var grp = this.group;

        this.controller = new Controller();
        this.controller.attach(g);

        this.container = new PIXI.Container();

        this.floorcontainer = new PIXI.Container();

        this.container.addChild(this.floorcontainer);

        this.container.x = window.innerWidth / 2;
        this.container.y = window.innerHeight / 2;

        this.floorcontainer.scale.x = 4;
        this.floorcontainer.scale.y = 4;

        this.floorside = 128;
        var floorside = this.floorside;

        this.floorcontainer.pivot.x = floorside / 2;
        this.floorcontainer.pivot.y = floorside / 2;

        this.floorbackground = new PIXI.Sprite(g.assets.images.clubfloor);
        var floorbackground = this.floorbackground;

        this.floorcontainer.addChild(floorbackground);

        this.clubclock = new ClubClock(g, 1380, 1500, function () {}, this);
        this.floorcontainer.addChild(this.clubclock.graphics);
        this.clubclock.graphics.scale.x = 1/this.floorcontainer.scale.x;
        this.clubclock.graphics.scale.y = 1/this.floorcontainer.scale.y;
        this.clubclock.graphics.x = floorside/2;
        this.clubclock.graphics.y = -this.clubclock.display.height/2*this.clubclock.graphics.scale.y;
        grp.logicgroup.push(this.clubclock);

        this.bounds = new Bounds();

        this.bounds.addWall({ position: 0, vertical: true, solid: true, greater: false })
                   .addWall({ position: floorside/7, vertical: false, solid: true, greater: false })
                   .addWall({ position: floorside, vertical: true, solid: true, greater: true, extents: [0, 4*floorside/5] })
                   .addWall({ position: floorside, vertical: true, solid: true, greater: true, extents: [9*floorside/10, floorside] })
                   .addWall({ position: floorside, vertical: false, solid: true, greater: true, extents: [0, floorside/10] })
                   .addWall({ position: floorside, vertical: false, solid: true, greater: true, extents: [floorside/5, floorside*4/10] })
                   .addWall({ position: floorside, vertical: false, solid: true, greater: true, extents: [floorside*6/10, floorside] })
                   .addWall({ position: 4*floorside/5, vertical: false, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: 9*floorside/10, vertical: false, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside*(1+1.5/8), vertical: true })
                   .addWall({ position: floorside/10, vertical: true, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside/5, vertical: true, extents: [floorside, floorside*(1+1.5/8)] })
                   .addWall({ position: floorside*(1+1.5/8), vertical: false });

        this.toilets = [
            new PIXI.Point((1+1/8)*floorside, 17*floorside/20),
            new PIXI.Point(3*floorside/20, (1+1/8)*floorside)
        ];

        for (var i = 0; i < this.toilets.length; ++i) {
            var toilettext = new PIXI.Text("TOILET", { font: "20px EightBitOperator", fill: '#0000DD' });
            toilettext.x = this.toilets[i].x;
            toilettext.y = this.toilets[i].y - 8;
            toilettext.scale.x = 1/4;
            toilettext.scale.y = 1/4;

            this.floorcontainer.addChild(toilettext);
        }

        this.exit = new PIXI.Point(floorside/2, (1+1/8)*floorside);

        this.throng = new Throng(g, this.group, this);

        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside*4/7), 0xFF0000);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside*4/7), 0x00FFFF);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside*4/7), 0x0000FF);
        this.throng.createClique(6, new PIXI.Point(floorside/2, floorside*4/7), 0xFFFF00);

        this.shapeshifter = new Shapeshifter(g, g.assets.images.ex, this, this.throng, this.controller);
        this.shapeshifter.graphics.x = this.shapeshifter.graphics.width/2;
        this.shapeshifter.graphics.y = floorside/7 + this.shapeshifter.graphics.height/2;
        this.throng.addDancer(this.shapeshifter);

        this.overlay = new Overlay(this.game, this, this.butterfly);
        this.overlay.load(Club1);
        this.overlay.hide();
        this.container.addChild(this.overlay.container);

        this.menuicon = new PIXI.Sprite(g.assets.images.hamburger);
        this.iconmenu = new Menu(this.game);
        this.iconmenu.load();
        this.iconmenu.createEntry({ thing: this.menuicon,
                                    rect: new PIXI.Rectangle(0, 0, this.menuicon.width,
                                                             this.menuicon.height),
                                    callback: () => {
                                        this.overlay.show();
                                        this.pause();
                                    } });

        this.menuicon.position.x = -floorside/2*this.floorcontainer.scale.x;
        this.menuicon.position.y = -floorside/2*this.floorcontainer.scale.y
                                 - this.menuicon.height;

        this.container.addChild(this.menuicon);

        this.finishoverlay = new FinishOverlay(this.game, this, this.butterfly);
        this.finishoverlay.load(Club1);
        this.container.addChild(this.finishoverlay.container);

        g.createGroup(this.name, this.group);
        g.activateGroup(this.name);
    };

    Club1.prototype.finish = function () {
        this.pause();
        this.iconmenu.controller.block();
        this.finishoverlay.show();
        this.floorcontainer.visible = false;
    };

    Club1.prototype.calculateScore = function () {
        var score = 0;

        for (var i = 0; i < this.throng.dancers.length; ++i) {
            var dancer = this.throng.dancers[i];

            for (var j = 0; j < dancer.opinion.length; ++j) {
                if (dancer.opinion[j] != undefined) score += dancer.opinion[j];
            }
        }

        return score - 120;
    };

    Club1.prototype.unload = function () {
        this.controller.detach(this.game);
        this.game.deleteGroup(this.name);

        this.overlay.unload();
        this.iconmenu.unload();
        this.finishoverlay.unload();
    };

    Club1.prototype.pause = function () {
        this.game.pauseLogic(this.name);
        this.controller.block();
    };

    Club1.prototype.resume = function () {
        this.game.resumeLogic(this.name);
        this.controller.unblock();
    };

    return Club1;
});
