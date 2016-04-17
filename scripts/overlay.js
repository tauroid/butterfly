define(['common/pixi.min', 'menu'], function (PIXI, Menu) {
    Overlay = function (game, club, butterfly) {
        Menu.call(this, game);

        this.club = club;
        this.butterfly = butterfly;
    };

    Overlay.prototype = Object.create(Menu.prototype);
    Overlay.prototype.constructor = Overlay;

    Overlay.prototype.load = function (clubblueprint) {
        Menu.prototype.load.apply(this);

        var g = this.game;

        this.container = new PIXI.Container();

        this.background = new PIXI.Sprite(g.assets.images.overlay);

        this.container.pivot.x = this.background.width/2;
        this.container.pivot.y = this.background.height/2;

        this.container.addChild(this.background);

        this.createEntry({ thing: this.background,
                           rect: new PIXI.Rectangle(108, 159, 294, 65),
                           callback: () => { this.hide(); this.club.resume(); } });

        this.createEntry({ thing: this.background,
                           rect: new PIXI.Rectangle(177, 255, 410-177, 313-255),
                           callback: () => { this.butterfly.changeClub(clubblueprint); } });

        this.createEntry({ thing: this.background,
                           rect: new PIXI.Rectangle(68, 355, 467-68, 421-355),
                           callback: () => { this.butterfly.enterMainMenu(); } });

    };

    Overlay.prototype.hide = function () {
        this.container.visible = false;
        this.controller.block();
    };

    Overlay.prototype.show = function () {
        this.container.visible = true;
        this.controller.unblock();
    };

    return Overlay;
});
