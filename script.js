var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var canvasW, canvasH, centre;
canvasW = canvas.width = window.innerWidth;
canvasH = canvas.height = window.innerHeight;
centre = canvasW / 2;

var landBorder = canvasH * 0.3,
    heightMin = canvasH * 0.065,
    holeSize = 4,
    lineThickness = 1;

// Gradient for water
var water = ctx.createLinearGradient(0, 0, 0, canvasH - landBorder);
water.addColorStop(0, "#B8D9E4");
water.addColorStop(1, "#4A82C8");

// ---- Stats ----
var coins = 0, fish = 0, worms = 3;

// ---- Entities ----
var Entities = {}, EntityCount = 0;

// ---- Rod ----
var Rod = {
  x1: -20, y1: 0, x2: 15, y2: 35,
  x_pos: centre, y_pos: heightMin * 2,
  colour: "#FFCACA",
  bitten: false, baitless: false, fish: undefined, stage: 0,
  hook_x_offset: -30, hook_y_offset: 0,

  default: function () {
    this.bitten = false; this.baitless = false;
    this.x1 = -20; this.y1 = 0; this.x2 = 15; this.y2 = 15;
    this.colour = "#FFCACA";
  },
  bite: function (type) {
    var colours = { fluffy: "#FCCB2D", grey: "#A09BA0", mullet: "#D74C42" };
    this.colour = colours[type] || "#FCCB2D";
    this.fish = type;
    this.bitten = true;
    if (type === "mullet") {
      this.x1 = -100; this.y1 = -15; this.x2 = 100; this.y2 = 405;
    } else {
      this.x1 = -30; this.y1 = 0; this.x2 = 30; this.y2 = 130;
    }
    this.stage = 3;
  },
  reeled: function () {
    fish++;
    this.default(); this.fish = undefined; this.stage = 0;
  },
  release: function () {
    this.default(); this.fish = undefined; this.stage = 2;
  },
  zap: function () {
    this.bitten = false; this.baitless = true;
    this.x1 = 0; this.y1 = 0; this.x2 = 0; this.y2 = 0;
    this.fish = undefined; this.stage = 3;
  },
  bait: function () {
    this.baitless = false; this.default(); this.stage = 2;
  }
};

// ---- Helper functions ----
function calcSize(v1, v2) { return v2 - v1; }
function despawn(e) { e.x_pos = canvas.width * 3; }
function genDirect() { return Math.random() < 0.5 ? -1 : 1; }
function genYPos(type) {
  return Math.floor(
    (Math.random() * (canvas.height - landBorder - (type.y2 - type.y1) * 2 - ((canvas.width - type.x1) / 8)) + 1)
    + landBorder + (type.y2 - type.y1) + ((canvas.width - type.x1) / 16)
  );
}

// ---- Entity constructors ----
function CreateFish() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -130; this.y1 = -30; this.x2 = 0; this.y2 = 30;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 5;
  this.colour = "#FCCB2D";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "fluffy";
  this.collide = function () {
    if (Rod.bitten || Rod.baitless) return;
    Rod.bite("fluffy"); despawn(this);
  };
}

function CreateGreyFish() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -130; this.y1 = -30; this.x2 = 0; this.y2 = 30;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 8;
  this.colour = "#A09BA0";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "greyfish";
  this.collide = function () {
    if (Rod.bitten || Rod.baitless) return;
    Rod.bite("grey"); despawn(this);
  };
}

function CreateMullet() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -420; this.y1 = -100; this.x2 = 0; this.y2 = 100;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 2;
  this.colour = "#D74C41";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "mullet";
  this.collide = function () {
    if (!Rod.bitten || Rod.baitless || Rod.fish === "mullet") return;
    Rod.bite("mullet"); despawn(this);
  };
}

function CreateBoot() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -45; this.y1 = -45; this.x2 = 45; this.y2 = 45;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 6;
  this.colour = "#996502";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "boot";
  this.collide = function () {
    if (!Rod.bitten) return;
    Rod.release();
  };
}

function CreateBarrel() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -85; this.y1 = -105; this.x2 = 85; this.y2 = 105;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 7;
  this.colour = "#D0976A";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "barrel";
  this.collide = function () {
    if (!Rod.bitten) return;
    Rod.release();
  };
}

function CreateJellyfish() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -50; this.y1 = -50; this.x2 = 50; this.y2 = 50;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 6;
  this.colour = "#2643AC";
  this.collision_type = "cut";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "jellyfish";
  this.collide = function () { Rod.zap(); };
}

function CreateCan() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -25; this.y1 = -25; this.x2 = 25; this.y2 = 25;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 5;
  this.colour = "#CCCBD0";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "can";
  this.collide = function () { worms++; despawn(this); };
}

function CreateShark() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -200; this.y1 = -50; this.x2 = 200; this.y2 = 50;
  this.x_pos = this.direction2 === 1 ? (0 + this.x1) : (canvas.width - this.x1);
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 5;
  this.colour = "#CCCBD0";
  this.collision_type = "cut";
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "shark";
  this.collide = function () { Rod.zap(); };
}

// ---- Spawn ----
function spawn() {
  var seed = Math.floor(Math.random() * 10 + 1);
  EntityCount++;
  switch (seed) {
    case 1: Entities[EntityCount] = new CreateBoot(); break;
    case 2: Entities[EntityCount] = new CreateBarrel(); break;
    case 3: Entities[EntityCount] = new CreateJellyfish(); break;
    case 4: Entities[EntityCount] = new CreateGreyFish(); break;
    case 5: Entities[EntityCount] = new CreateMullet(); break;
    case 6: Entities[EntityCount] = new CreateCan(); break;
    case 7: Entities[EntityCount] = new CreateShark(); break;
    default: Entities[EntityCount] = new CreateFish(); break;
  }
}

// ---- Collision ----
function checkCollision(Obj) {
  var a = { x: Rod.x_pos + Rod.x1, y: Rod.y_pos + Rod.y1, width: calcSize(Rod.x1, Rod.x2), height: calcSize(Rod.y1, Rod.y2) };
  var b = { x: Obj.x_pos + Obj.x1, y: Obj.y_pos + Obj.y1, width: calcSize(Obj.x1, Obj.x2), height: calcSize(Obj.y1, Obj.y2) };
  return !(((a.y + a.height) < b.y) || (a.y > (b.y + b.height)) || ((a.x + a.width) < b.x) || (a.x > (b.x + b.width)));
}

function checkLine(Obj) {
  var a = { x: Rod.x_pos - lineThickness / 2, width: lineThickness };
  var b = { x: Obj.x_pos + Obj.x1, width: calcSize(Obj.x1, Obj.x2) };
  if (Rod.y_pos >= Obj.y_pos + Obj.y1 && !(((a.x + a.width) < b.x) || (a.x > (b.x + b.width)))) return true;
}

// ---- Update ----
function update() {
  for (var entity in Entities) {
    var Entity = Entities[entity];
    Entity.x_pos += Entity.speed * Entity.direction2;
    Entity.y_pos = (1 / (canvas.width - Entity.x1) * Math.pow(Entity.x_pos, 2) - Entity.x_pos) / (4 * Entity.direction) + Entity.init_y_pos;
    if (Entity.collision_type === "cut") {
      if (checkLine(Entity)) Entity.collide();
    } else {
      if (checkCollision(Entity)) Entity.collide();
    }
    if (Entity.x_pos + Entity.x1 > canvas.width * 2 || Entity.x_pos < -canvas.width * 2) {
      delete Entities[entity];
    }
  }
}

// ---- Draw helpers (no sprites, pure canvas shapes) ----
function drawFish(x, y, w, h, color, flipped, type) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (flipped) ctx.scale(-1, 1);

  var darkColor, lightColor, finColor;
  if (type === "greyfish") {
    // Lil' Blues — ko'k-moviy
    darkColor  = "#1a3a8a";
    lightColor = "#4a90d9";
    finColor   = "#2255bb";
  } else if (type === "mullet") {
    // Huge Reds — to'q qizil
    darkColor  = "#8B0000";
    lightColor = "#E03030";
    finColor   = "#C02020";
  } else {
    // Big Oranges — to'q sariq/orange
    darkColor  = "#b85c00";
    lightColor = "#f5a623";
    finColor   = "#d47a10";
  }

  // Dum (tail)
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.38, 0);
  ctx.lineTo(-w * 0.62, -h * 0.55);
  ctx.lineTo(-w * 0.55, 0);
  ctx.lineTo(-w * 0.62,  h * 0.55);
  ctx.closePath();
  ctx.fill();

  // Tana gradient
  var bodyGrad = ctx.createLinearGradient(-w * 0.4, -h * 0.5, -w * 0.4, h * 0.5);
  bodyGrad.addColorStop(0,   lightColor);
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1,   darkColor);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(w * 0.05, 0, w * 0.46, h * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yon chiziq (lateral line)
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = h * 0.07;
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.05);
  ctx.quadraticCurveTo(w * 0.1, -h * 0.18, w * 0.42, -h * 0.05);
  ctx.stroke();

  // Orqa (dorsal) qanat
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.05, -h * 0.48);
  ctx.lineTo( w * 0.05, -h * 0.9);
  ctx.lineTo( w * 0.22, -h * 0.48);
  ctx.closePath();
  ctx.fill();

  // Qorin (pectoral) qanat
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.15);
  ctx.lineTo(w * 0.0,  h * 0.65);
  ctx.lineTo(w * 0.2,  h * 0.3);
  ctx.closePath();
  ctx.fill();

  // Ko'z
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(w * 0.28, -h * 0.08, h * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(w * 0.30, -h * 0.08, h * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Ko'z yaltiroq nuqtasi
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(w * 0.32, -h * 0.11, h * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Og'iz
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = h * 0.06;
  ctx.beginPath();
  ctx.moveTo(w * 0.48, h * 0.04);
  ctx.quadraticCurveTo(w * 0.52, h * 0.12, w * 0.44, h * 0.18);
  ctx.stroke();

  ctx.restore();
}

function drawHook(x, y, stage) {
  // Simple hook shape
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 18);
  ctx.arc(x + 6, y + 18, 6, Math.PI, Math.PI * 2, false);
  ctx.stroke();
  // Worm / bait
  if (stage < 3) {
    ctx.fillStyle = "#FF6600";
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 10, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObject(x, y, w, h, color, shape) {
  ctx.fillStyle = color;
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
}

// ---- Render ----
function render() {
  // Background
  ctx.fillStyle = "#DDEEFF";
  ctx.fillRect(0, 0, canvasW, landBorder);

  // Ice texture lines
  ctx.strokeStyle = "rgba(180,220,255,0.6)";
  ctx.lineWidth = 1;
  for (var i = 0; i < canvasW; i += 60) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 30, landBorder); ctx.stroke();
  }

  // Water
  ctx.fillStyle = water;
  ctx.fillRect(0, landBorder, canvasW, canvasH - landBorder);

  // Ice border
  ctx.fillStyle = "#A8D8EA";
  ctx.fillRect(0, landBorder - 8, canvasW, 12);

  // Hole in ice
  var holeW = 80, holeH = 30;
  ctx.fillStyle = "#4A82C8";
  ctx.beginPath();
  ctx.ellipse(centre, landBorder, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#A8D8EA";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(centre, landBorder, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Penguin (simple shape)
  var px = centre - 30, py = heightMin;
  // Body
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.ellipse(px + 30, py + 50, 28, 45, 0, 0, Math.PI * 2); ctx.fill();
  // Belly
  ctx.fillStyle = "#FFF";
  ctx.beginPath(); ctx.ellipse(px + 30, py + 55, 16, 30, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(px + 30, py + 12, 20, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = "#FFF";
  ctx.beginPath(); ctx.arc(px + 23, py + 9, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 37, py + 9, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.arc(px + 24, py + 9, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 38, py + 9, 2.5, 0, Math.PI * 2); ctx.fill();
  // Beak
  ctx.fillStyle = "#FFA500";
  ctx.beginPath(); ctx.moveTo(px + 30, py + 16); ctx.lineTo(px + 24, py + 21); ctx.lineTo(px + 36, py + 21); ctx.closePath(); ctx.fill();

  // Fishing rod (stick)
  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(px + 55, py + 20);
  ctx.lineTo(Rod.x_pos, heightMin);
  ctx.stroke();

  // Fishing line
  ctx.strokeStyle = "#000";
  ctx.lineWidth = lineThickness;
  ctx.beginPath();
  ctx.moveTo(Rod.x_pos, heightMin);
  ctx.lineTo(Rod.x_pos, Rod.y_pos);
  ctx.stroke();

  // Hook
  if (Rod.y_pos > landBorder) {
    drawHook(Rod.x_pos - 6, Rod.y_pos - 5, Rod.stage);
  }
  // Fish on hook (if bitten)
  if (Rod.bitten) {
    var fc = Rod.fish === "grey" ? "#4a90d9" : Rod.fish === "mullet" ? "#E03030" : "#f5a623";
    var ft = Rod.fish === "grey" ? "greyfish" : Rod.fish === "mullet" ? "mullet" : "fluffy";
    drawFish(Rod.x_pos - 40, Rod.y_pos - 25, 80, 40, fc, false, ft);
  }

  // Entities
  for (var entity in Entities) {
    var E = Entities[entity];
    var ex = E.x_pos + E.x1, ey = E.y_pos + E.y1;
    var ew = calcSize(E.x1, E.x2), eh = calcSize(E.y1, E.y2);

    if (E.name === "fluffy") {
      drawFish(ex, ey, ew, eh, "#f5a623", E.direction2 !== 1, "fluffy");
    } else if (E.name === "greyfish") {
      drawFish(ex, ey, ew, eh, "#4a90d9", E.direction2 !== 1, "greyfish");
    } else if (E.name === "mullet") {
      drawFish(ex, ey, ew, eh, "#E03030", E.direction2 !== 1, "mullet");
    } else if (E.name === "jellyfish") {
      // Jellyfish
      ctx.fillStyle = "rgba(38,67,172,0.6)";
      ctx.beginPath(); ctx.arc(ex + ew/2, ey + eh*0.4, ew/2, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "rgba(38,67,172,0.8)";
      ctx.lineWidth = 1;
      for (var t = 0; t < 5; t++) {
        ctx.beginPath();
        ctx.moveTo(ex + ew*0.2 + t*ew*0.15, ey + eh*0.5);
        ctx.lineTo(ex + ew*0.15 + t*ew*0.15, ey + eh);
        ctx.stroke();
      }
    } else if (E.name === "shark") {
      ctx.fillStyle = "#778899";
      ctx.beginPath();
      ctx.moveTo(ex, ey + eh/2);
      ctx.lineTo(ex + ew*0.7, ey + eh*0.3);
      ctx.lineTo(ex + ew, ey + eh/2);
      ctx.lineTo(ex + ew*0.7, ey + eh*0.7);
      ctx.closePath(); ctx.fill();
      // Fin
      ctx.beginPath();
      ctx.moveTo(ex + ew*0.4, ey + eh*0.3);
      ctx.lineTo(ex + ew*0.5, ey);
      ctx.lineTo(ex + ew*0.6, ey + eh*0.3);
      ctx.closePath(); ctx.fill();
    } else if (E.name === "boot") {
      ctx.fillStyle = "#996502";
      ctx.fillRect(ex, ey, ew, eh);
      ctx.fillStyle = "#7a5000";
      ctx.fillRect(ex, ey + eh*0.6, ew*1.2, eh*0.4);
    } else if (E.name === "barrel") {
      ctx.fillStyle = "#D0976A";
      ctx.beginPath(); ctx.ellipse(ex + ew/2, ey + eh/2, ew/2, eh/2, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#8B4513"; ctx.lineWidth = 3;
      for (var r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.ellipse(ex + ew/2, ey + eh*0.25 + r*eh*0.25, ew/2, ew*0.15, 0, 0, Math.PI*2);
        ctx.stroke();
      }
    } else if (E.name === "can") {
      ctx.fillStyle = "#CCCBD0";
      ctx.beginPath(); ctx.ellipse(ex + ew/2, ey + eh/2, ew/2, eh/2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(ex + ew*0.1, ey + eh*0.3, ew*0.8, eh*0.4);
    } else {
      ctx.fillStyle = E.colour;
      ctx.fillRect(ex, ey, ew, eh);
    }
  }

  // HUD
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(10, 10, 340, 44);
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#FFD700";
  ctx.fillText("🐟 " + fish + "   🪱 " + worms + "   🪙 " + coins, 20, 40);

  // Status message
  if (Rod.baitless) {
    ctx.fillStyle = "rgba(200,0,0,0.8)";
    ctx.fillRect(centre - 140, canvasH * 0.5, 280, 45);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Yem yo'q! Yuqoriga bosing 🪱", centre - 130, canvasH * 0.5 + 30);
  }
  if (Rod.bitten && Rod.y_pos < landBorder) {
    ctx.fillStyle = "rgba(0,150,0,0.85)";
    ctx.fillRect(centre - 130, canvasH * 0.15, 260, 45);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Bosing! Baliqni oling! 🎣", centre - 120, canvasH * 0.15 + 30);
  }
}

// ---- Input ----
canvas.addEventListener("mousemove", function (e) {   
  var rect = e.target.getBoundingClientRect();
  var y = e.clientY - rect.top;
  if (y <= heightMin) return;
  if (!Rod.baitless && !Rod.bitten) {
    if (y <= landBorder) Rod.stage = 0;
    else if (y < Rod.y_pos) {
      Rod.stage = 1;
      setTimeout(function () { if (Rod.y_pos > landBorder) Rod.stage = 2; }, 250);
    } else Rod.stage = 2;
  }
  Rod.x_pos = e.clientX - rect.left;
  Rod.y_pos = y;
});

canvas.addEventListener("mousedown", function (e) {
  if (Rod.y_pos < landBorder) {
    if (Rod.bitten) {
      var prize = { fluffy: 4, grey: 8, mullet: 100 };
      coins += prize[Rod.fish] || 0;
      Rod.reeled();
    }
    if (Rod.baitless && worms > 0) {
      worms--;
      Rod.bait();
    }
  } else if (Rod.bitten) {
    Rod.release();
  }
});

// ---- Game loop ----
setInterval(spawn, 3000);
setInterval(function () { update(); render(); }, 1000 / 60);
