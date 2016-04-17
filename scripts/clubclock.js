define(function () {
    ClubClock = function (game, starttime, endtime, callback) {
        this.gamestarttime = game.getTime();
        this.starttime = starttime;
        this.endtime = endtime;
        this.callback = callback;

        this.microsecondsperminute = 1000;

        this.graphics = new PIXI.Container();

        this.display = new PIXI.Text("", { fill: "#00FF00", font: "60px EightBitOperator" });

        this.graphics.addChild(this.display);

        this.done = false;
    };

    ClubClock.prototype.update = function (delta, time) {
        if (this.done) return;

        var clocktime = Math.floor((time - this.gamestarttime) / this.microsecondsperminute)
            + this.starttime;

        if (clocktime > this.endtime) {
            this.callback();
            this.done = true;
            clocktime = this.endtime;
        }

        var hours = (Math.floor(clocktime/60) % 24).toString();
        var minutes = (clocktime % 60).toString();

        if (hours.length == 1) hours = "0"+hours[0];
        if (minutes.length == 1) minutes = "0"+minutes[0];

        this.display.text = hours+":"+minutes;

        this.graphics.pivot.x = this.display.width/2;
        this.graphics.pivot.y = this.display.height/2;
    };

    return ClubClock;
});
