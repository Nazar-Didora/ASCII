'use strict'

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const fileInput = document.getElementById("fileInput");

fileInput.addEventListener('change', e =>{
    const file=fileInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', ()=>{
      image1.src=(reader.result);

    });
    reader.readAsDataURL(file);
})

const image1 = new Image();
const inputSlider = document.getElementById('resolution');
const inputLabel = document.getElementById('resolutionLabel');
inputSlider.addEventListener('change', handleSlider);

let colorMode = 'color';

const colorButton = document.getElementById('colorButton');

colorButton.addEventListener('click', () => {
  colorMode = colorMode === 'color' ? 'black-and-white' : 'color';
  handleSlider();
});

class Cell {
   constructor(x, y, symbol, color){
     this.x=x;
     this.y=y;
     this.symbol=symbol;
     this.color=color;
     
   }
   draw(ctx){

    if (colorMode === 'color') {
      ctx.fillStyle = this.color;
    } else {
      ctx.fillStyle = 'white';
    }
    ctx.fillText(this.symbol, this.x, this.y)
   }
}

class AsciiEffect{
  #imageCellArray = [];
  #pixels = [];
  #ctx;
  #width;
  #height;
  constructor(ctx, width, height){
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    console.log(this.#pixels.data);
  }
  #convertToSymbol(g){
    const pointer = Math.round(g / 10)*10;
    let res;
    const symbols ={250:'N', 240:'@', 230: '#', 220: 'W', 210: '$', 200: '9', 190:'8', 180: '7', 170: '6'
    , 160: '5', 150: '4', 140: '3', 130: '2', 120: '1', 110: '0', 100: '?', 90: '!', 80: 'a', 70: 'b', 60: 'c',
    50:';', 40:':', 30:'+', 20:'=', 10:'-',};
    res = symbols[pointer] || '';
    console.log(res);
    return res;
  }
  #scanImage(cellSize){
    this.#imageCellArray = [];
    for(let y = 0; y<this.#pixels.height; y +=cellSize){
        for(let x = 0; x<this.#pixels.width; x+=cellSize){
          const posX = x * 4;
          const posY = y * 4;
          const pos = (posY * this.#pixels.width) + posX;

          if(this.#pixels.data[pos + 3]>128){
            const red = this.#pixels.data[pos];
            const green = this.#pixels.data[pos+1];
            const blue = this.#pixels.data[pos+2];
            const total = red + green + blue;
            const averageColorValue = total/3;
            const color = "rgb(" + red + "," + green + "," + blue +")";
            const symbol = this.#convertToSymbol(averageColorValue);
           if (total >200) this.#imageCellArray.push(new Cell(x, y, symbol, color));
          }
        }
    }
      console.log(this.#imageCellArray);
  }
  #drawAscii(){
    this.#ctx.clearRect(0, 0, this.#width, this.#height)
    for (let i = 0; i < this.#imageCellArray.length; i++){
      this.#imageCellArray[i].draw(this.#ctx);
    }
  }
  draw(cellSize){
      this.#scanImage(cellSize);
      this.#drawAscii();
  }
}

let effect;

function  handleSlider(){
  if(inputSlider.value == 1){
    inputLabel.innerHTML = 'Original image';
    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
  }else{
    inputLabel.innerHTML = 'Resolution: ' + inputSlider.value + ' px';
    ctx.font = parseInt(inputSlider.value)*2 + 'px Courier';
    effect.draw(parseInt(inputSlider.value));
  }
}

image1.onload = function initialize(){
  canvas.width = image1.width;
  canvas.height = image1.height;  
  effect = new AsciiEffect(ctx, image1.width, image1.height);
  handleSlider();
}

const downloadButton = document.getElementById('download');

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'ascii_image.png';

  const canvas2 = document.createElement('canvas');
  const ctx2 = canvas2.getContext('2d');
  canvas2.width = canvas.width;
  canvas2.height = canvas.height;
  ctx2.fillStyle = 'black';
  ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

  ctx2.drawImage(canvas, 0, 0);

  link.href = canvas2.toDataURL('image/png');
  link.click();
});