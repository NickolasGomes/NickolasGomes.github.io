

//var R_MIN = document.getElementById("r_min").value;
//var R_MAX = document.getElementById("r_max").value;

// DEFINE RAIO MAXIMO E MINIMO -- COLOQUEI UM VALOR SETADO AO INVES DE PERGUNTAR AO USUARIO
const MIN_R = 2;
const MAX_R = 48;

// DEFINE TAMANHO DO QUADRO -- AREA UTIL PARA DESENHO DOS CIRCULOS, FOI DEFINIDA COMO O TAMANHO DE UMA TELA EM HD
const WIDTH = 1280;
const HEIGHT = 720;
const SIZE = WIDTH * HEIGHT;

// BUFFER PARA ARMAZENAR POSICOES DO QUADRO EM QUE NÃO PODEMOS PREENCHER COM CIRCULOS
var buffer = new ArrayBuffer(SIZE);
var area = new Int8Array(buffer);

// CALCULA TAMANHO DOS PIXELS BASEADO NO TAMANHO DO QUADRO
const pixel_SIZE = MAX_R * 2;
const pixel_COLS = Math.ceil(WIDTH / pixel_SIZE);
const pixel_ROWS = Math.ceil(HEIGHT / pixel_SIZE);

// CRIA ARRAY PARA ARMAZENAR TODAS AS POSICOES POSIVEIS
var pixels = [];

// CRIA O OBJETO CIRCULO
function Circle(x, y, radius) {

  this.x = x;
  this.y = y;
  this.radius = radius;

  this.show = function () {

    fill(random(0, 255), random(0, 255), random(0, 255));
    ellipse(x, y, radius * 2, radius * 2);

  }
}

// CRIA VETOR DE COORDENADAS COM TODAS AS POSICOES LIVRES
function getPos(index) {

  return createVector(index % WIDTH, floor(index / WIDTH));

}


// DEFINE COORDENADAS
function getIndex(x, y) {

  return x + y * WIDTH;

}

// SELECIONA PIXEL LIVRE DE ACORDO COM AS COORDENADAS
function getpixel(x, y) {

  return {
    col: Math.floor(x / (pixel_SIZE)),
    row: Math.floor(y / (pixel_SIZE))
  };

}

// VARRE TODA A VIZINHANÇA DO PIXEL PARA IDENTIFICAR VIZINHOS
function getNeighborpixels(row, col) {

  var result = [];

  result.push(pixels[row][col]);

  if (col > 0) {
    result.push(pixels[row][col - 1]);

    if (row > 0) {
      result.push(pixels[row - 1][col - 1]);
    }
  }
  if (col < pixel_COLS - 1) {
    result.push(pixels[row][col + 1]);

    if (row < pixel_ROWS - 1) {
      result.push(pixels[row + 1][col + 1]);
    }
  }
  if (row > 0) {
    result.push(pixels[row - 1][col]);

    if (col < pixel_COLS - 1) {
      result.push(pixels[row - 1][col + 1]);
    }
  }
  if (row < pixel_ROWS - 1) {
    result.push(pixels[row + 1][col]);

    if (col > 0) {
      result.push(pixels[row + 1][col - 1]);
    }
  }

  return result;

}

// GERA INTEIRO ALEATORIO QUE SERA USADO PARA DEFINIR POSICOES POSIVEIS DE CRIACAO DE CIRCULOS
function getRandomInt(min, max) {

  return Math.floor(Math.random() * (max - min)) + min;

}

// SELECIONA UM RAIO DE CIRCULO ALEATORIO ENTRE OS VALORES MAXIMOS E MINIMOS, COMPARANDO COM OS VIZINHOS PARA DETECTAR COLISAO
// RETORNA FALSO SE COLISAO DETECTADA
function getRadius(x, y) {

  var pixel = getpixel(x, y);
  var neighbors = getNeighborpixels(pixel.row, pixel.col);

  // DISTANCIA MAXIMA PARA O CIRCULO MAIS PROXIMO
  var max = MAX_R;

  // PARA CADA CIRCULO VIZINHO
  for (var i = 0; i < neighbors.length; ++i) {
    for (var j = 0; j < neighbors[i].length; ++j) {

      var circle = neighbors[i][j];

      // DISTANCIA ATE A BORDA DOS VIZINHOS
      var r = dist(x, y, circle.x, circle.y) - circle.radius;

      if (r < max) {

        max = r;

      }

      if (max < MIN_R) {
        // COLISAO DETECTADA
        return false;
      }
    }
  }

  if (max > MAX_R) {
    max = MAX_R;
  }

  // RETORNA MAXIMO ALEATORIO ENTRE O RAIO MINIMO E MAXIMO POSSIVEL
  return constrain(random(MIN_R, MAX_R), MIN_R, max);

}
const SQRT = 1 / Math.sqrt(2);

// NAO PLOTA CIRCULOS OCUPANDO A MESMA AREA (REMOVENDO AS POSSIBILIDADES)
function reduceArea(circle) {

  var size = round((circle.radius + MIN_R - 1) * SQRT);

  var beginX = constrain(circle.x - size, 0, WIDTH);
  var beginY = constrain(circle.y - size, 0, HEIGHT);
  var endX = constrain(circle.x + size, 0, WIDTH);
  var endY = constrain(circle.y + size, 0, HEIGHT);

  var length = endX - beginX;
  var index = getIndex(beginX, beginY);
  for (var y = beginY; y <= endY; ++y) {
    area.fill(1, index, index + length);
    index += WIDTH;
  }

}


var start_clicks = 0;
var stop_clicks = 0;

// DETECTA CLICK PARA INICIAR
function onClickStart(){

  start_clicks = 1;
  stop_clicks = 0;

}

// DETECTA CLICK PARA PARAR
function onClickStop(){

  stop_clicks = 1;

}

var circlesCount = 0;
// DESENHA CIRCULO SOBRE AREA LIVRE E INCREMENTA CONTADOR DE CIRCULOS DESENHADOS
function drawCircle(circle){

  circle.show();
  circlesCount += 1;
  document.getElementById("circlesCount").innerHTML = circlesCount;

}

// GERA CIRCULOS
function generate() {

  var index;

  // PEGA UMA POSICAO LIVRE ALEATORIA
  do {
    index = getRandomInt(0, SIZE);
  } while (area[index] == 1);


  // SETA CENTRO DO CIRCULO
  var center = getPos(index);
  // SETA RAIO DO CIRCULO
  var radius = getRadius(center.x, center.y);

  // SE TENHO POSICAO LIVRE (RAIO !== DE FALSO) E CLIQUEI NO BOTAO DE START E NAO DO DE STOP (SE CLICAR NO BOTAO DE STOP, PARA DE GERAR CIRCULOS)
  if (radius !== false && start_clicks >= 1 && stop_clicks == 0 ) {

    var circle = new Circle(center.x, center.y, radius);
    var pixel = getpixel(center.x, center.y);

    // ALOCA CIRCULO NOS PIXELS LIVRES
    pixels[pixel.row][pixel.col].push(circle);

    // RETIRA AREA QUE ACABEI DE PLOTAR UM NOVO CIRCULO DO TOTAL DE AREA DISPONIVEL
    reduceArea(circle);
    // DESENHA CIRCULO CRIADO E ALOCADO
    drawCircle(circle);

  } else {
    // CIRCULO NAO PODE SER ALOCADO NESSA POSICAO, REINICIA O LOOP PARA UM NOVO CIRCULO
    area[index] = -1;
  }
}

// FUNCAO PRINCIPAL
function setup() {

  // SETA CONTADOR DE CIRCULO PARA 0 (AINDA NAO INICIEI OU RESETEI)
  circlesCount = 0;
  document.getElementById("circlesCount").innerHTML = circlesCount;
  // CRIA AREA DE PLOTAGEM
  createCanvas(WIDTH, HEIGHT);
  // DEFINE TAMANHO DA BORDA DOS CIRCULOS (1px)
  strokeWeight(1);

  // CRIA ARRAY DE PIXELS LIVRES PARA PLOTAGEM DENTRO DA AREA DISPONIVEL
  for (var j = 0; j < pixel_ROWS; ++j) {
    pixels[j] = [];
    for (var i = 0; i < pixel_COLS; ++i) {
      pixels[j][i] = [];
    }
  }

  // CRIA UM CIRCULO POR VEZ, CHAMANDO A FUNCAO DE CRIACAO A CADA 50ms (SE QUISER MAIS DE UM CIRCULO "SIMULTANEO", MUDAR i < 1 para i < numero_desejado)
  for (i = 0; i < 1; ++i) {

    // CHAMA FUNCAO DE CRIACAO DE CIRCULOS A CADA 50ms
    setInterval(generate, 50);

  }

  // PROFESSOR, UTILIZEI ESSE VÍDEO EM CONJUNTO COM O MATERIAL DO SENHOR: https://www.youtube.com/watch?v=XATr_jdh-44.

}




