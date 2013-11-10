(function () {
  'use strict';

  var mobileUserAgentRe = /iPod|iPhone|iPad|Android/i;

  window.config = {
    mobile: mobileUserAgentRe.test(navigator.userAgent),
    world: {
      left: 70, //considered dead if you're less than this, regardless of your Y location,
      right: 1220, //considered dead if you're greater than this, regardless of your Y location,
      leftEdge: 100, //if your x less than this when your y is 0, you die
      rightEdge: 1200, //if your x greater than this when your y is 0, you die
      gravity: 3000, // amount of gravity applied per second
      jumpPower: 1500,
      kickPower: 700,
      multiTime: 2000,
      minStreak: 3,
      fps: 60,
      boxes: {
        "1": {
          standing: [
            { x: -10, y: -185, x2: 10, y2: -160 },
            { x: -30, y: -155, x2: 20, y2: -100 },
            { x: -25, y: -100, x2: 17.5, y2: -55 },
            { x: -35, y: -52.5, x2: 30, y2: -17.5 }
          ],
          jumping: [
            { x: -5, y: -180, x2: 20, y2: -152.5 },
            { x: -18.5, y: -147.5, x2: 14, y2: -97.5 },
            { x: -5, y: -100, x2: 7.5, y2: -12.5 },
            { x: 7.5, y: -85, x2: 25, y2: -67.5 },
            { x: -25, y: -65, x2: 12.5, y2: -55 }
          ],
          kicking: [
            { x: -10, y: -160, x2: 10, y2: -130 },
            { x: -28.5, y: -135, x2: -3.5, y2: -122.5 },
            { x: -40, y: -120, x2: -5, y2: -100 },
            { x: -35, y: -100, x2: 30, y2: -87.5 },
            { x: -30, y: -90, x2: 20, y2: -77.5 },
            { x: -8.5, y: -75, x2: 6.5, y2: -45 },
            { x: 10, y: -50, x2: 20, y2: -32.5 },
            { x: 25, y: -35, x2: 47.5, y2: -12.5 }
          ]
        },
        "-1": {
          standing: [
            { x: -10, y: -185, x2: 10, y2: -160 },
            { x: -20, y: -155, x2: 30, y2: -100 },
            { x: -17.5, y: -100, x2: 25, y2: -55 },
            { x: -30, y: -52.5, x2: 35, y2: -17.5 }
          ],
          jumping: [
            { x: -20, y: -180, x2: 5, y2: -152.5 },
            { x: -14, y: -147.5, x2: 18.5, y2: -97.5 },
            { x: -7.5, y: -100, x2: 5, y2: -12.5 },
            { x: -25, y: -85, x2: -7.5, y2: -67.5 },
            { x: -12.5, y: -65, x2: 25, y2: -55 }
          ],
          kicking: [
            { x: -10, y: -160, x2: 10, y2: -130 },
            { x: 3.5, y: -135, x2: 28.5, y2: -122.5 },
            { x: 5, y: -120, x2: 40, y2: -100 },
            { x: -30, y: -100, x2: 35, y2: -87.5 },
            { x: -20, y: -90, x2: 30, y2: -77.5 },
            { x: -6.5, y: -75, x2: 8.5, y2: -45 },
            { x: -20, y: -50, x2: -10, y2: -32.5 },
            { x: -47.5, y: -35, x2: -25, y2: -12.5 }
          ]
        }
      }
    }
  };
})();
