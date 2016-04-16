requirejs.config({
    baseUrl: "scripts",
    paths: {
        common: "/scripts/common",
        jquery: "/scripts/common/jquery"
    },
    shim: {
        "common/sylvester": {
            exports: "SylvesterWrap"
        },
        "common/three.min": {
            exports: "THREE"
        }
    },
    urlArgs: "bust=" + (new Date()).getTime(),
    waitSeconds: 0
});

function start(Game, Config) {
    var game = new Game();
    var config = new Config(game);
    game.ready(function () {
        document.body.innerHTML = "";
        game.load(config);
    });
}

require(['jquery','game','butterfly'], function ($, Game, Config) {
    $(document).ready(function () { start(Game, Config); });
});
