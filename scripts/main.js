const elemSize = 30;
const canvasWidth = 30*elemSize;
const canvasHeight = 35*elemSize;
const startX = 15*elemSize;
const startY = 17*elemSize;
const prize_value = 10;

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
    this.score = 0;
    this.gameOver = false;
    this.snakeHead = snakeHead;
    this.tail = snakeTail;
    this.length = 1;
    this.prize = new Square("red", getRandomInt(canvasWidth/elemSize)*elemSize, getRandomInt(canvasHeight/elemSize)*elemSize);
  }

  checkRectContainsOtherRect(a, b) {
    console.log("NOT IMPLEMENTED")
    return !(
      b.getX() < a.getX() ||
      b.getY() < a.getY() ||
      b.getX() + elemSize > a.getX() + elemSize ||
      b.getY() + elemSize > a.getY() + elemSize
    )
  }

  checkGameOver() {
    // Hit a wall
    if((this.snakeHead.getX() == 0) || (this.snakeHead.getX() + elemSize == canvasWidth) || (this.snakeHead.getY() == 0) || (this.snakeHead.getY() + elemSize == canvasHeight)) {
      this.gameOver = true;
      console.log("game over")
    }
    // Hit the tail if any part of the tail contains the head
    // for(i=0; i<this.getNumTails; i++) {
    //   if(this.checkRectContainsOtherRect(this.tails[i], this.snakeHead)) {
    //     return true;
    //   }
    // }
    else {
      this.gameOver = false;
    }
  }

  checkPrize() {
    // Check if there is a prize where the snakehead went, generate new prize if necessary
    if((this.snakeHead.getX() == this.prize.getX()) && (this.snakeHead.getY() == this.prize.getY())) {
      // Update score value
      this.score += prize_value;
      document.getElementById("score").innerHTML = this.score;
      // Update length of last tail
      this.tails[this.tails.length-1].length += 1;
      // Generate new prize
      this.prize = new Square("red", getRandomInt(canvasWidth/elemSize)*elemSize, getRandomInt(canvasHeight/elemSize)*elemSize);
    }
  }

  updatePrize() {
    this.prize.updateSquare("red", this.prize.getX(), this.prize.getY(), elemSize, elemSize)
  }

  drawSnake() {
    console.log(this.snakeHead)
    console.log(this.tail)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    while(!!tail.parent) {
      tail.updateSquare("black", tail.parent.getX(), tail.parent.getY(), tail.getWidth(), tail.getHeight());
      tail = tail.parent;
      console.log(tail)
    }
  this.snakeHead.updateHead()
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

  updateHead() {
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

class SnakeBody extends Square {
  constructor(x, y, parent) {
    super("black", x, y);
    this.parent = parent;
    this.length = 1;
    this.alignment = "vertical";
  }

  // getX() {
  //   if(this.parent.direction === "left") {
  //     return this.parent.x+this.length*elemSize;
  //   }
  //   if(this.parent.direction === "right") {
  //     return this.parent.x-this.length*elemSize;
  //   }
  //   else {
  //     return this.parent.x;
  //   }
  // }

  // getY() {
  //   if(this.parent.direction === "down") {
  //     return this.parent.y-this.length*elemSize;
  //   }
  //   if(this.parent.direction === "up") {
  //     return this.parent.y+this.length*elemSize;
  //   }
  //   else {
  //     return this.parent.y;
  //   }
  // }

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

  updateTail() {
    this.updateSquare("black", this.getX(), this.getY(), this.getWidth(), this.getHeight());
  }
}



let c = document.getElementById("snakeCanvas");
let ctx = c.getContext("2d");

function calculateSnakeDirection(mouseX, mouseY, snakeHead) {
  const xDiff = Math.abs(mouseX - snakeHead.getX());
  const yDiff = Math.abs(mouseY - snakeHead.getY());
  let newDirection;
  if((mouseX - snakeHead.getX() < 0) && (xDiff > yDiff)) {
    newDirection = "left";
  }
  // Upper left half
  else if((mouseY - snakeHead.getY() < 0) && (mouseX - snakeHead.getX() < 0) && xDiff < yDiff) {
    newDirection = "up";
  }
  // Upper right half
  else if((mouseY - snakeHead.getY() < 0) && (mouseX - snakeHead.getX() > 0) && xDiff < yDiff) {
    newDirection = "up";
  }
  else if((mouseX - snakeHead.getX() > 0) && xDiff > yDiff) {
    newDirection = "right";
  }
  // Lower left half
  else if((mouseY - snakeHead.getY() > 0) && (mouseX - snakeHead.getX() < 0) && xDiff < yDiff) {
    newDirection = "down";
  }
  // Lower right half
  else if((mouseY - snakeHead.getY() > 0) && (mouseX - snakeHead.getX() > 0) && xDiff < yDiff) {
    newDirection = "down";
  }
  // Can't turn backwards
  const newDirectionIsValid = oppositeDirectionLookup(newDirection) === snakeHead.direction ? false : true
  return newDirectionIsValid ? newDirection : snakeHead.direction
}

async function main() {
  let snakeHead = new SnakeHead(startX, startY);
  let snakeBody = new SnakeBody(snakeHead.getX(), snakeHead.getY()+30, snakeHead);
  snakeBody.child = snakeBody;
  let game = new Game(snakeHead, snakeBody);
  c.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    snakeHead.setDirection(calculateSnakeDirection(x, y, snakeHead));
    // TODO: Fiks ledd (legg til Tail i Game hver gang man snur, hvor forelder er siste eksisterende Tail)
    // new tail etter head, hook sammen med
    let snakeBody2 = new SnakeBody(snakeBody.getX(), snakeBody.getY()+30, snakeBody);
  });
  while(!game.gameOver) {
    await sleep(800);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // snakeHead.updateHead();
    // snakeBody.updateTail();
    // game.checkGameOver();
    // game.checkPrize();
    // game.updatePrize();
    let snakeBody2 = new SnakeBody(snakeBody.getX(), snakeBody.getY()+30, snakeBody);
    game.addTail(snakeBody2)
    let snakeBody3 = new SnakeBody(snakeBody2.getX(), snakeBody2.getY()+30, snakeBody2);
    game.addTail(snakeBody3)
    let snakeBody4 = new SnakeBody(snakeBody3.getX()+30, snakeBody3.getY(), snakeBody3);
    game.addTail(snakeBody4)
    // snakeBody2.updateTail();
    game.drawSnake();
    break

    await sleep(800);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    snakeHead.updateHead();
    snakeBody.updateTail();
    await sleep(800);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    snakeHead.updateHead();
    snakeBody.updateTail();
  }
}

main()


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

