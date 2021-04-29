// create canvas for any display size********************************************************
let bodyw = document.body.offsetWidth; //....................................................*
let bodyh = document.body.offsetHeight; //...................................................*
const elem = document.createElement("canvas"); //............................................*
document.body.appendChild(elem); //....................Made By Sourav Barui..................*
elem.id = "canvas"; //.......................................................................*
elem.setAttribute("width", bodyw); //........................................................*
elem.setAttribute("height", bodyh); //.......................................................*
// ******************************************************************************************

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
const FIRE = document.getElementById("fire");
const THRUST = document.getElementById("thrust");

// fore mobile *********************************
const jyt = document.getElementById("joystick");
const cen = document.getElementById("thum");
const bostOn = document.getElementById("bustOn");
let centerTouch = false;
let THUMX = cen.offsetLeft;
let THUMY = cen.offsetTop;
let THUMW = cen.offsetWidth;
let THUMH = cen.offsetHeight;
let JSX = jyt.offsetLeft + cen.offsetLeft + THUMW / 2; // this is the top of center thum x position
let JSY = jyt.offsetTop + cen.offsetTop + THUMH / 2; // this is the top of center thum y position
let jx, jy, sjx, sjy, nx, ny;
let thrusterPower = 0.3;
//  ***************************************************************

const ASTD_NUM = 3; // strting number of asteroid
const ASTD_VET = 11; // average number of vertices on each asteroid
const ASTD_SIZE = 50; // starting size of asteroid in pixels
const ASTD_PTS_LRG = 20; // pointe score for a large asteroid
const ASTD_PTS_MED = 30; // pointe score for a medium asteroid
const ASTD_PTS_SML = 50; // pointe score for a small asteroid
const ASTD_SPEED = 50; // max starting speed of asteroid in pixels per secends
const ASTD_JAG = 0.4; // jaggedness of the asteroid (0 = none, 1 = lots)
const FPS = 30; // frames per secends
const FRICTION = 0.7; // sriction coefficient of space (0 = no friction, 1 = lots of friction)
const GAME_LIVES = 3; // starting number of lives
const LASER_MAX = 10; // miximum number of lasers on screen at one
const LASER_SPEED = 500; // speed fo laser in pixels per secend
const LASER_DIS = 0.4; // max distance laser can travle as fraction of screen width
const LASER_EXPLODE_DEU = 0.1; // duration of the laser's explosion
const MOBILE_PLAY = true; // for swiching mobile to pc
const ROTATE_SPEED = 360; // rotate speed i degrees per secends
const SAVE_SCORE_KEY = 'highScore'; // save key for local storage of high score
const SHIP_SIZE = 20; // ship size in pixels
const SHIP_THRUST = 5; // acceletation of the ship in pixels per secend
const SHOW_BOUNDING = false; // show or hide collisition bounding
const SHIP_EXPLODE_DEU = 0.3; // duration of the ship explosion
const SHIP_INV_DEU = 3; // duration of the ship invisibility in secends
const SHIP_BLINK_DEU = 0.1; // duration of the ship blink during invisibility in secends
const TEXT_FADE_TIME = 2.5; // text fade time in secends
const TEXT_SIZE = 40; // text font height in pixels
// **********************game parameters**************

let ship, astd, level, text, textAlpha, lives, score, highScore;
newGame();

// ***************************************************
function newShip() {
  return {
    x: cvs.width / 2,
    y: cvs.height / 2,
    r: SHIP_SIZE / 2,
    a: (90 / 180) * Math.PI, // convert to radians
    explodeTime: 0,
    dead: false,
    blinkNum: Math.ceil(SHIP_INV_DEU / SHIP_BLINK_DEU),
    blinkTime: Math.ceil(SHIP_BLINK_DEU * FPS),
    rotate: 0,
    canShoot: true,
    lasers: [],
    thrusting: false,
    thrust: {
      x: 0,
      y: 0,
    },
  };
}

function shootLaser() {
  // create the laser object
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    // shooting form the nose of the ship
    ship.lasers.push({
      x: ship.x + ship.r * (4 / 3) * Math.cos(ship.a),
      y: ship.y - ship.r * (4 / 3) * Math.sin(ship.a),
      vx: (LASER_SPEED * Math.cos(ship.a)) / FPS,
      vy: -(LASER_SPEED * Math.sin(ship.a)) / FPS,
      dist: 0,
      explodeTime: 0,
    });
  }
  // prevent further shooting
  ship.canShoot = false;
}

// remove joystick for pc (if mobilePlay = false)
if (!MOBILE_PLAY) {
  const body = document.getElementById("body");
  body.removeChild(jyt);
  body.removeChild(FIRE);
}

function newAsteroid(x, y, r) {
  let lvlMult = 1 + 0.1 * level;
  let roid = {
    x: x,
    y: y,
    xv:
      ((Math.random() * ASTD_SPEED * lvlMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    yv:
      ((Math.random() * ASTD_SPEED * lvlMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    r: r,
    a: Math.random() * Math.PI * 2, // in radian
    vet: Math.floor(Math.random() * (ASTD_VET + 1) + ASTD_VET / 2),
    offs: [],
  };

  // create the vertex offets array
  for (let i = 0; i < roid.vet; i++) {
    roid.offs.push(Math.random() * ASTD_JAG * 2 + 1 - ASTD_JAG);
  }
  return roid;
}
function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// draw ships and lives
function drawShip(x, y, a, color = "#ffffff20", color2 = "#ffffff") {
  ctx.fillStyle = color;
  ctx.strokeStyle = color2;
  ctx.lineWidth = SHIP_SIZE / 20;
  ctx.beginPath();
  ctx.moveTo(
    // nose of the ship
    x + ship.r * (4 / 3) * Math.cos(a),
    y - ship.r * (4 / 3) * Math.sin(a)
  );
  ctx.lineTo(
    // rear left
    x - ship.r * (Math.cos(a) + Math.sin(a)),
    y + ship.r * (Math.sin(a) - Math.cos(a))
  );
  ctx.lineTo(
    // rear right
    x - ship.r * (Math.cos(a) - Math.sin(a)),
    y + ship.r * (Math.sin(a) + Math.cos(a))
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function explodeShip() {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DEU * FPS);
}

function gameOver() {
  ship.dead = true;
  text = "Game Over!";
  textAlpha = 1.0;
}

function createAsteroideBelt() {
  astd = [];
  let x, y;
  for (let i = 0; i < ASTD_NUM + level; i++) {
    do {
      x = Math.floor(Math.random() * cvs.width);
      y = Math.floor(Math.random() * cvs.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTD_SIZE * 2 + ship.r);
    astd.push(
      newAsteroid(
        x,
        y,
        (random =
          Math.random() < 0.05
            ? Math.ceil(ASTD_SIZE / 8)
            : Math.random() < 0.1
            ? Math.ceil(ASTD_SIZE / 4)
            : ASTD_SIZE / 2)
      )
    );
  }
}

function destroyAsteroid(i) {
  let x = astd[i].x;
  let y = astd[i].y;
  let r = astd[i].r;

  // split the asteroid in two of necessary
  if (r == ASTD_SIZE / 2) {
    astd.push(newAsteroid(x, y, Math.ceil(ASTD_SIZE / 4)));
    astd.push(newAsteroid(x, y, Math.ceil(ASTD_SIZE / 4)));
    score += ASTD_PTS_LRG;
  } else if (r == Math.ceil(ASTD_SIZE / 4)) {
    astd.push(newAsteroid(x, y, Math.ceil(ASTD_SIZE / 8)));
    astd.push(newAsteroid(x, y, Math.ceil(ASTD_SIZE / 8)));
    score += ASTD_PTS_MED;
  } else {
    score += ASTD_PTS_SML;
  }

  if (highScore < score) {
    highScore = score;
    localStorage.setItem(SAVE_SCORE_KEY, highScore);
  }
  //destroy the asteroid
  astd.splice(i, 1);

  // new level when on more asteroid
  if (astd.length == 0) {
    level++;
    newLevel();
  }
}

// set up event handlers
document.addEventListener("keydown", (e) => {
  if (ship.dead) {
    return;
  }
  switch (e.keyCode) {
    case 32: // space bar (shoot laser)
      shootLaser();
      break;
    case 37: // left arrow (rotate ship left)
      ship.rotate = ((ROTATE_SPEED / 180) * Math.PI) / FPS;
      break;
    case 38: // up arrow (theust the ship forward)
      ship.thrusting = true;
      break;
    case 39: // right arrow (rotate ship right)
      ship.rotate = -((ROTATE_SPEED / 180) * Math.PI) / FPS;
      break;
  }
});

document.addEventListener("keyup", (e) => {
  if (ship.dead) {
    return;
  }
  switch (e.keyCode) {
    case 32: // space bar (stop shoot laser)
      ship.canShoot = true;
      break;
    case 37: // left arrow (stop rotate left)
      ship.rotate = 0;
      break;
    case 38: // up arrow (stop thrusting)
      ship.thrusting = false;
      thrusterPower = 0.3;
      break;
    case 39: // right arrow (stop rotate right)
      ship.rotate = 0;
      break;
  }
});

function newGame() {
  level = 0;
  score = 0;
  lives = GAME_LIVES;
  ship = newShip();
 
  // get the high score form local storage
  let scoreString = localStorage.getItem(SAVE_SCORE_KEY);
  if (scoreString == null) {
    highScore = 0;
  } else {
    highScore = parseInt(scoreString);
  }

  newLevel();
}
function newLevel() {
  text = "Level " + (level + 1);
  textAlpha = 1.0;
  createAsteroideBelt();
}

const update = () => {
  let blinkOn = ship.blinkNum % 2 == 0;
  let exploding = ship.explodeTime > 0;

  // draw space
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = SHIP_SIZE / 60;
  ctx.strokeRect(0, 0, cvs.width, cvs.height);
 
  // thrusr the ship ************************************************
  if (ship.thrusting && !ship.dead) {
    ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FPS;
    ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FPS;

    // draw the thruster
    if (!exploding && blinkOn) {
      // part 2
      ctx.fillStyle = "#ffffff20";
      ctx.strokeStyle = "#ffffff10";
      ctx.lineWidth = SHIP_SIZE / 3;
      ctx.beginPath();
      ctx.moveTo(
        // real left
        ship.x -
          ship.r * (Math.cos(ship.a) + 0.4 * thrusterPower * Math.sin(ship.a)),
        ship.y +
          ship.r * (Math.sin(ship.a) - 0.4 * thrusterPower * Math.cos(ship.a))
      );
      ctx.lineTo(
        // rear center behind the ship
        ship.x - ship.r * (6 / (3 - thrusterPower)) * Math.cos(ship.a),
        ship.y + ship.r * (6 / (3 - thrusterPower)) * Math.sin(ship.a)
      );
      ctx.lineTo(
        // rear right
        ship.x -
          ship.r * (Math.cos(ship.a) - 0.4 * thrusterPower * Math.sin(ship.a)),
        ship.y +
          ship.r * (Math.sin(ship.a) + 0.4 * thrusterPower * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // incrige thruster power
      if (thrusterPower <= 2) {
        thrusterPower += 0.02;
      }

      // part 1
      ctx.fillStyle = "#ff0000";
      ctx.strokeStyle = "#f0f000";
      ctx.lineWidth = SHIP_SIZE / 10;
      ctx.beginPath();
      ctx.moveTo(
        // real left
        ship.x - ship.r * (Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo(
        // rear center behind the ship
        ship.x - ship.r * (6 / (4 - thrusterPower / 1.2)) * Math.cos(ship.a),
        ship.y + ship.r * (6 / (4 - thrusterPower / 1.2)) * Math.sin(ship.a)
      );
      ctx.lineTo(
        // rear right
        ship.x - ship.r * (Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
  }

  // draw the asteroid **********************************************
  ctx.lineWidth = SHIP_SIZE / 20;
  let x, y, r, a, vet, offs;

  for (let i = 0; i < astd.length; i++) {
    ctx.fillStyle = "#00d9ff10";
    ctx.strokeStyle = "#00d9ff";

    // get the asteroid properties
    x = astd[i].x;
    y = astd[i].y;
    r = astd[i].r;
    a = astd[i].a;
    vet = astd[i].vet;
    offs = astd[i].offs;

    // draw a path
    ctx.beginPath();
    ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));
    // draw the polygon
    for (let j = 1; j < vet; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vet),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vet)
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = "#f0f000";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // draw ship *******************************************
  if (!exploding) {
    if (blinkOn && !ship.dead) {
      drawShip(ship.x, ship.y, ship.a);
    }

    // hanble blinking
    if (ship.blinkNum > 0) {
      // reduce the blink time
      ship.blinkTime--;

      // reduce the blink time
      if (ship.blinkTime == 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DEU * FPS);
        ship.blinkNum--;
      }
    }
  } else {
    // draw the explosion *******************************
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (SHOW_BOUNDING) {
    ctx.strokeStyle = "#f0f000";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // draw the laser
  for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 15,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.strokeStyle = "#f0f000";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 13,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
    } else {
      // draw the explosion
      ctx.fillStyle = "#ffee00";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.9,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.strokeStyle = "#4400ff";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.7,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = "#f0f000";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.3,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
    }
  }
  // draw the game text
  if (textAlpha >= 0) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
    ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(text, cvs.width / 2, cvs.height * 0.75);
    textAlpha -= 1.0 / TEXT_FADE_TIME / (FPS * 1.5);
  } else if (ship.dead) {
    newGame();
  }

  // draw the lives
  let liveColor;
  for (let i = 0; i < lives; i++) {
    liveColor = exploding && i == lives - 1 ? "#ff0000" : "#00000000";
    drawShip(
      SHIP_SIZE + i * SHIP_SIZE * 1.2,
      SHIP_SIZE,
      0.5 * Math.PI,
      liveColor,
      "#ffffffaa"
    );
  }

  // draw the score
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.font = TEXT_SIZE / 1.4 + "px dejavu sans mono";
  ctx.fillText(score, cvs.width - SHIP_SIZE / 2, SHIP_SIZE);

  // draw the high score
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff77";
  ctx.font = TEXT_SIZE / 1.8 + "px dejavu sans mono";
  ctx.fillText('Best  ' + highScore, cvs.width / 2, SHIP_SIZE);

  // detect laser hits on asteroid
  let ax, ay, ar, lx, ly;
  for (let i = astd.length - 1; i >= 0; i--) {
    // grab the asteroid properties
    ax = astd[i].x;
    ay = astd[i].y;
    ar = astd[i].r;

    // loop over the laser
    for (let j = ship.lasers.length - 1; j >= 0; j--) {
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      // detect hits
      if (
        ship.lasers[j].explodeTime == 0 &&
        distBetweenPoints(ax, ay, lx, ly) < ar
      ) {
        // remove the asteroid and activate the laser exploding
        destroyAsteroid(i);
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DEU * FPS);

        break;
      }
    }
  }

  // chack for asteroid colisition
  if (!exploding) {
    // chack for asteroid collisions (when not exploding)
    if (ship.blinkNum == 0 && !ship.dead) {
      for (let i = 0; i < astd.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, astd[i].x, astd[i].y) <
          ship.r + astd[i].r
        ) {
          explodeShip();
          destroyAsteroid(i);
          break;
        }
      }
    }

    if (!MOBILE_PLAY) {
      // rotate the ship
      ship.a += ship.rotate;
    }

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    ship.explodeTime--;
    if (ship.explodeTime == 0) {
      lives--;
      if (lives == 0) {
        gameOver();
      } else {
        ship = newShip();
      }
    }
  }

  // handle end of screen
  if (ship.x < 0 - ship.r) {
    ship.x = cvs.width + ship.r;
  } else if (ship.x > cvs.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = cvs.height + ship.r;
  } else if (ship.y > cvs.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  // move the lasers
  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    // chack distence travelled
    if (ship.lasers[i].dist > LASER_DIS * cvs.width) {
      ship.lasers.splice(i, 1);
      continue;
    }

    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      // destroy the laser after the duration is up
      if (ship.lasers[i].explodeTime == 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      // increase velocity
      ship.lasers[i].x += ship.lasers[i].vx;
      ship.lasers[i].y += ship.lasers[i].vy;

      //calculate the distence travelled
      ship.lasers[i].dist += Math.sqrt(
        Math.pow(ship.lasers[i].vx, 2) + Math.pow(ship.lasers[i].vy, 2)
      );
    }

    // handle edge of screen
    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = cvs.width;
    } else if (ship.lasers[i].x > cvs.width) {
      ship.lasers[i].x = 0;
    }
    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = cvs.height;
    } else if (ship.lasers[i].y > cvs.height) {
      ship.lasers[i].y = 0;
    }
  }

  // move the asteroid
  for (let i = 0; i < astd.length; i++) {
    astd[i].x += astd[i].xv;
    astd[i].y += astd[i].yv;

    // hendle end of the screen
    if (astd[i].x < 0 - astd[i].r) {
      astd[i].x = cvs.width + astd[i].r;
    } else if (astd[i].x > cvs.width + astd[i].r) {
      astd[i].x = 0 - astd[i].r;
    }
    if (astd[i].y < 0 - astd[i].r) {
      astd[i].y = cvs.height + astd[i].r;
    } else if (astd[i].y > cvs.height + astd[i].r) {
      astd[i].y = 0 - astd[i].r;
    }
  }
};

// set up for game loop
// setInterval(update, 1000 / FPS);

//  ***************************************************************

// for joystick
const touchStart = (e) => {
  sjx = e.touches[0].clientX;
  sjy = e.touches[0].clientY;
};
const joystick = (e) => {
  if (centerTouch) {
    jx = e.touches[0].clientX;
    jy = e.touches[0].clientY;
    nx = jx - sjx; // new angle
    ny = jy - sjy; // new angle
  }
};
jyt.addEventListener("touchend", () => {
  bustOn.classList.remove("bustOn");
  ship.thrusting = false;
  thrusterPower = 0.3; 
});

// for center
const Start = (e) => {
  centerTouch = true;
};
const center = (e) => {
  cen.style.transition = "none";
  if (THUMX * -5 < nx && THUMX * 5 > nx && THUMY * -5 < ny && THUMY * 5 > ny) {
    cen.style.left = THUMX + nx + "px";
    cen.style.top = THUMY + ny + "px";
    if (nx > 50 || nx < -50 || ny > 50 || ny < -50) {
      ship.thrusting = true;
      bustOn.classList.add("bustOn");
    } else {
      ship.thrusting = false;
      thrusterPower = 0.3;
      bustOn.classList.remove("bustOn");
    }
    let diffX = jx - JSX;
    let diffY = jy - JSY;
    ship.a = Math.atan2(diffX, diffY) + (270 / 180) * Math.PI;
  }
};
const End = (e) => {
  centerTouch = false;
  nx = 0;
  ny = 0;
  cen.style.left = THUMX + "px";
  cen.style.top = THUMY + "px";
  cen.style.transition = "0.2s";
};

FIRE.addEventListener("touchstart", () => {
  shootLaser();
});
FIRE.addEventListener("touchend", () => {
  ship.canShoot = true;
});
// mobile ***************************************
