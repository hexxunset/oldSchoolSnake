function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function oppositeDirectionLookup(direction) {
  return {
    "up": "down",
    "down": "up",
    "left": "right",
    "right": "left"
  }[direction]
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class Game {
  constructor(snakeHead, snakeTail) {
    this.sleepTime = 800;
    this.totalScore = 0;
    this.gameOver = false;
    this.snakeHead = snakeHead;
    this.snakeTail = snakeTail;
    this.length = 1;
    this.prize = new Square("red", getRandomInt(canvasWidth/elemSize)*elemSize, getRandomInt(canvasHeight/elemSize)*elemSize);
  }

  isSamePos(square1, square2) {
    return (square1.x == square2.x && square1.y == square2.y);
  }
  
  checkGameOver() {
    // Hit a wall
    if((this.snakeHead.x == -elemSize) || (this.snakeHead.x == canvasWidth) || (this.snakeHead.y == -elemSize) || (this.snakeHead.y == canvasHeight)) {
      this.gameOver = true;
      console.log("game over");
    }
    // Hit the tail if any part of the tail contains the head
    let tail = this.snakeTail;
    while(!!tail.parent){
      if (this.isSamePos(this.snakeHead, tail)) {
        this.gameOver = true;
        console.log("game over");
        break;
      }
      else {
        tail = tail.parent;
      }
    }
  }

  checkPrize() {
    // Check if there is a prize where the snakehead went, generate new prize if necessary
    if((this.snakeHead.x == this.prize.x) && (this.snakeHead.y == this.prize.y)) {
      return true;
    }
    return false
  }

  movePrize(validPrizePos) {
    // Move prize (if too slow, add hashmap: board-state, for each move remove tail and add new head pos)
    // Find legal coords. while snake is less than 2/3 the board, get a pos and check valid, if not get new one
    let tempPos = {"x": getRandomInt(canvasWidth/elemSize)*elemSize, "y": getRandomInt(canvasHeight/elemSize)*elemSize};

    // Check that the prize isn't on an already occupied square
    let tail = this.snakeTail;
    while(!!tail){
      if (this.isSamePos(tempPos, tail)) {
        validPrizePos = false;
        break;
      }
      else {
        validPrizePos = true;
        tail = tail.parent;
      }
    }
    // Use current position for prize
    if (validPrizePos) {
      this.prize = new Square("red", tempPos.x, tempPos.y);
      return
    }
      this.movePrize(false)
  }
}

class Square {
  constructor(color, x, y) {
    this.updateSquare(color, x, y, elemSize, elemSize);
  }

  setTail(newTail) {
    this.tail = newTail;
  }

  getWidth() {
    return elemSize;
  }

  getHeight() {
    return elemSize;
  }

  updateSquare(color, x, y, width, height) {
    ctx.fillStyle = color;
    this.x = x;
    this.y = y;
    ctx.fillRect(x, y, width, height);
  }
}

class SnakeHead extends Square {
  constructor(x, y) {
    super("darkblue", x, y)
    this.direction = "up";
    this.child;
  }

  setDirection(newDirection) {
    this.direction = newDirection;
  }

  moveHead() {
    const newX = {
      "up": this.x,
      "down": this.x,
      "left": this.x-elemSize,
      "right": this.x+elemSize
    }[this.direction]
    const newY = {
      "up": this.y-elemSize,
      "down": this.y+elemSize,
      "left": this.y,
      "right": this.y
    }[this.direction]
    this.updateSquare("darkblue", newX, newY, elemSize, elemSize)
  }
}

class SnakeTail extends Square {
  constructor(x, y, parent) {
    super("black", x, y);
    this.parent = parent;
    this.length = 1;
    this.alignment = "vertical";
  }

  getWidth() {
    // Horizontal tails are wide
    if(this.alignment == "horizontal") {
      return this.length*elemSize;
    }
    else {
      return elemSize;
   }
  }

  getHeight() {
    // Vertical tails are high
    if(this.alignment == "vertical") {
      return this.length*elemSize;
    }
    else {
      return elemSize;
    }
  }
}



let c = document.getElementById("snakeCanvas");
let ctx = c.getContext("2d");

const elemSize = 100;
const canvasWidth = c.width;
const canvasHeight = c.height;
const startX = Math.floor(canvasWidth/(2*elemSize))*elemSize;
const startY = Math.floor(canvasWidth/(2*elemSize))*elemSize;
const prize_value = 10;

function calculateSnakeDirection(mouseX, mouseY, snakeHead) {
  // på vei opp: click til høyre -> høyer, klikk til venstre -> venstre
  // på vei ned: klikk til høyre -> høyre, klikk til venstre -> venstre
  // på vei til venstre: klikk over -> opp, klikk under -> ned
  // på vei til høyre: klikk over -> opp, klikk under -> ned
  let newDirection;
  // klikk over hodet: klikk-y mindre enn hodet-y
  if ((snakeHead.direction == "left") || (snakeHead.direction == "right")) {
    if (mouseY < snakeHead.y) {
      newDirection = "up";
    } else {
      newDirection = "down";
    }
  }
  // klikk til høyre: klikk-x større enn hodet-x
  if ((snakeHead.direction == "up") || (snakeHead.direction == "down")) {
    if (mouseX > snakeHead.x) {
      newDirection = "right";
    } else {
      newDirection = "left";
    }
  }
  return newDirection;
}

async function main() {
  let snakeHead = new SnakeHead(startX, startY);
  let snakeTail = new SnakeTail(snakeHead.x, snakeHead.y+elemSize, snakeHead);
  snakeHead.child = snakeTail;
  let game = new Game(snakeHead, snakeTail);

  c.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    snakeHead.setDirection(calculateSnakeDirection(x, y, snakeHead));
  });

  while(!game.gameOver) {
    await sleep(game.sleepTime);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Won prizes, add square
    // kep old tail position -> calculate and draw new positions -> if head grabs prize, add tail
    // add tail: snakeTail, old tail position, link to old tail, link game to new tail
    const tempTail = game.snakeTail;
    tail = game.snakeTail;
    while(!!tail.parent) {
      tail.updateSquare("black", tail.parent.x, tail.parent.y, tail.getWidth(), tail.getHeight());
      tail = tail.parent;
    }
    snakeHead.moveHead();
    // Update score and add to snake if it found a prize
    if (game.checkPrize()) {
      // Update score
      game.totalScore += prize_value;
      document.getElementById("score").innerHTML = game.totalScore;
      // Add new square
      let snakeTail = new SnakeTail(tempTail.x, tempTail.y, tempTail);
      game.snakeTail = snakeTail;
      // Move prize
      game.movePrize(validPrizePos=false);
      // Increase speed
      game.sleepTime -= 10;
      console.log(game.sleepTime);
    }
    // Draw prize
    game.prize.updateSquare("red", game.prize.x, game.prize.y, elemSize, elemSize)
    // Check if dead
    game.checkGameOver();
  }
}

main()


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

