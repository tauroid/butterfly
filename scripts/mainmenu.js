define(['common/pixi.min', 'menu', 'club1'], function (PIXI, Menu, Club1) {
    MainMenu = function (game, butterfly) {
        Menu.call(this, game);

        this.butterfly = butterfly;
    };

    MainMenu.prototype = Object.create(Menu.prototype);
    MainMenu.prototype.constructor = MainMenu;

    MainMenu.prototype.load = function () {
        Menu.prototype.load.apply(this);

        var g = this.game;

        this.container = new PIXI.Container();

        this.container.position.x = window.innerWidth/2;
        this.container.position.y = window.innerHeight/2;

        this.background = new PIXI.Sprite(g.assets.images.menu);

        this.container.pivot.x = this.background.width/2;
        this.container.pivot.y = this.background.height/2;

        this.container.addChild(this.background);

        this.createEntry({ thing: this.background,
                           rect: new PIXI.Rectangle(142, 234, 272, 165),
                           callback: () => { this.butterfly.changeClub(Club1); } });
    };

    return MainMenu;
});
