define(['common/pixi.min', 'controller', 'pixiwindow', 'mainmenu', 'club1'],
        function (PIXI, Controller, PIXIWindow, MainMenu, Club1) {
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

        this.container = new PIXI.Container();

        var cross = new PIXI.Graphics();

        cross.lineStyle(1, 0xFFFFFF, 1)
             .moveTo(0, window.innerHeight/2)
             .lineTo(window.innerWidth, window.innerHeight/2)
             .moveTo(window.innerWidth/2, 0)
             .lineTo(window.innerWidth/2, window.innerHeight);

        this.container.addChild(cross);

        this.mainmenu = new MainMenu(this.game, this);
        this.mainmenu.load();

        this.container.addChild(this.mainmenu.container);

        this.gamewindow = new PIXIWindow(undefined, undefined, this.container);
        grp.gamewindows.push(this.gamewindow);

        g.createGroup(this.name, this.group);
        g.activateGroup(this.name);
    };

    Butterfly.prototype.unload = function () {
        var g = this.game;

        g.deleteGroup(this.name);
    };

    Butterfly.prototype.enterMainMenu = function () {
        if (this.club) this.clearClub();
        if (!this.mainmenu.container.visible) {
            this.mainmenu.container.visible = true;
            this.mainmenu.controller.unblock();
        }
    };

    Butterfly.prototype.changeClub = function (Blueprint) {
        if (this.club) this.clearClub();
        if (this.mainmenu.container.visible) {
            this.mainmenu.container.visible = false;
            this.mainmenu.controller.block();
        }

        this.club = new Blueprint(this.game, this);
        this.club.load();
        this.container.addChild(this.club.container);
    };

    Butterfly.prototype.clearClub = function () {
        this.container.removeChild(this.club.container);
        this.club.unload();
        delete this.club;
    };

    return Butterfly;
});
