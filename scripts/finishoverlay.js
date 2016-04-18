define(['common/pixi.min', 'menu'], function (PIXI, Menu) {
    FinishOverlay = function (game, club, butterfly) {
        Menu.call(this, game);

        this.club = club;
        this.butterfly = butterfly;
    };

    FinishOverlay.prototype = Object.create(Menu.prototype);
    FinishOverlay.prototype.constructor = FinishOverlay;

    FinishOverlay.prototype.load = function (clubblueprint) {
        Menu.prototype.load.apply(this);

        var g = this.game;

        this.container = new PIXI.Container();

        this.background = new PIXI.Sprite(g.assets.images.finishoverlay);

        this.container.pivot.x = this.background.width*2;
        this.container.pivot.y = this.background.height*2;

        this.background.scale.x = this.club.floorcontainer.scale.x;
        this.background.scale.y = this.club.floorcontainer.scale.y;

        this.container.addChild(this.background);

        this.yourscoretext = new PIXI.Text("Your score was:",
                { font: "35px EightBitOperator", align: "center",
                  wordWrap: true, wordWrapWidth: this.background.width/2 });
        this.yourscoretext.pivot.x = this.yourscoretext.width/2;
        this.yourscoretext.position.x = this.background.width/2;
        this.yourscoretext.position.y = 80;

        this.container.addChild(this.yourscoretext);

        this.scoretext = new PIXI.Text("",
                { font: "60px EightBitOperator", align: "center" });

        this.scoretext.position.x = this.background.width/2;
        this.scoretext.position.y = 180;

        this.container.addChild(this.scoretext);

        this.restarttext = new PIXI.Text("RESTART",
                { font: "42px EightBitOperator", align: "center", fill: '#FF0000' });

        this.restarttext.pivot.x = this.restarttext.width/2;
        this.restarttext.position.x = this.background.width/2;
        this.restarttext.position.y = 290;

        this.createEntry({ thing: this.restarttext, 
            rect: new PIXI.Rectangle(0, 0,
                                     this.restarttext.width, this.restarttext.height),
            callback: () => { this.butterfly.changeClub(clubblueprint); },
            mouseovercallback: () => { this.restarttext.style.fill = "#DD0000"; },
            mouseoutcallback: () => { this.restarttext.style.fill = "#FF0000"; } });

        this.container.addChild(this.restarttext);

        this.mainmenutext = new PIXI.Text("MAIN MENU",
                { font: "35px EightBitOperator", align: "center", fill: "#FF0000" });

        this.mainmenutext.pivot.x = this.mainmenutext.width/2;
        this.mainmenutext.position.x = this.background.width/2;
        this.mainmenutext.position.y = 350;

        this.createEntry({ thing: this.mainmenutext, 
            rect: new PIXI.Rectangle(0, 0,
                                     this.mainmenutext.width, this.mainmenutext.height),
            callback: () => { this.butterfly.enterMainMenu(); },
            mouseovercallback: () => { this.mainmenutext.style.fill = "#DD0000"; },
            mouseoutcallback: () => { this.mainmenutext.style.fill = "#FF0000"; } });

        this.container.addChild(this.mainmenutext);

        this.hide();
    };

    FinishOverlay.prototype.hide = function () {
        this.container.visible = false;
        this.controller.block();
    };

    FinishOverlay.prototype.show = function () {
        this.container.visible = true;
        this.controller.unblock();
        this.updateScoretext();
    };

    FinishOverlay.prototype.updateScoretext = function () {
        var score = Math.ceil(this.club.calculateScore());

        this.scoretext.text = score.toString();
        this.scoretext.pivot.x = this.scoretext.width/2;
    };

    return FinishOverlay;
});
