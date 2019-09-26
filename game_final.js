// Global variables
var cnv,gridX,gridY,posX,posY;
var gridLength,squareSize,gridSize,brushSize,brushDim;
var shiftY,shiftX,mGridX,mGridY;
var hex,showGrid,hideGrid;
var wWidth,wHeight;

function calcGridSize(){
	$('#form1').css('display','none');

	var squareDim = $('#squareDim').val();

	if (wWidth < wHeight){
		var maxGridDim = int((wWidth)/squareDim);
	}
	else if (wHeight < wWidth){
		var maxGridDim = int(wHeight/squareDim);
	};

	$('#form2').css('display','block');
	$('#squareDimHidden').val(squareDim);
	$('#gridDim').attr('max',maxGridDim);
}

/* Tool and Palette Functions -----------------------*/
//On one click, select current color
function changeColor(buttonId){
	hex = $('#' + buttonId).val();

	$('#brush0,#brush1,#brush2').css('color','#000000');
	$('#brush' + brushDim).css('color',hex);

	$('.flaticon-016-bucket').css('color',hex);
};

//On dbl click, let user select custom color
function customColor(inputId){
	var inputColor = $('#' + inputId);
	inputColor.focus();
	inputColor.click();

	hex = inputColor.val();
};

//On change of color, set current color and save swatch
function currentColor(inputId){
	hex = $('#' + inputId).val();

	var buttonId = inputId.replace('in','btn');
	$('#' + buttonId).val(hex);
	$('#' + buttonId).css('background-color',hex);

	$('#brush0,#brush1,#brush2').css('color','#000000');
	$('#brush' + brushDim).css('color',hex);

	$('.flaticon-016-bucket').css('color',hex);
};

//Brush size tool
function changeBrush(size){
	brushDim = size;

	$('#brush0,#brush1,#brush2').css('color','#000000');
	$('#brush' + brushDim).css('color',hex);
};

//Fill canvas tool
function fillGrid(){
	for (var i=0; i<gridLength; i++){
		for (var j=0; j<gridLength; j++){
			gridY[i][j].squareFill();
		}
	}
};

//Eraser tool
function eraser(){
	hex = '#ffffff';
};

//Toggle gridlines tool
function toggleGrid(){
	if (showGrid){
		showGrid = false;
		hideGrid = true;
	}
	else if (hideGrid){
		showGrid = true;
		hideGrid = false;
	}
};

//Reset canvas tool
function gridReset(){
	for (var i=0; i<gridLength; i++){
		for (var j=0; j<gridLength; j++){
			gridY[i][j].squareReset();
		}
	}

	hex = '#ffffff';

	$('#brush0,#brush1,#brush2').css('color','#000000');
	$('#brush' + brushDim).css('color',hex);

	$('.flaticon-016-bucket').css('color',hex);
};

// Reset palette tool
function paletteReset(){
	var defaultPalette = {
		'#btn01':'#7d0006',
		'#btn02':'#ff0000',
		'#btn03':'#f5aec0',
		'#btn04':'#ed891f',
		'#btn05':'#fab914',
		'#btn06':'#ffdd00',
		'#btn07':'#00874f',
		'#btn08':'#8cc740',
		'#btn09':'#c2d930',
		'#btn10':'#0067a3',
		'#btn11':'#67c7c2',
		'#btn12':'#7fb2c9',
		'#btn13':'#682e8f',
		'#btn14':'#863b8f',
		'#btn15':'#c1c5de',
		'#btn16':'#000000',
		'#btn17':'#a64b0f',
		'#btn18':'#ffffff'
	};

	for (var key in defaultPalette){
		$(key).val(defaultPalette[key]);
		$(key).css('background-color',defaultPalette[key]);

		in_key = key.replace('btn','in');
		$(in_key).val(defaultPalette[key]);
		$(in_key).css('background-color',defaultPalette[key]);
	};
};

//Save image tool: Pt. 1
function saveImage(){
	showGrid = false;
	hideGrid = true;

	$('#saveModal').css('display','block');
};

//Save image tool: Pt. 2
function saveImage2(form){
	name = $(form).children('#imageName').val();
	save(name + '.png');

	$('#saveModal').css('display','none');

	return false;
};

/* Canvas -------------------------------------------*/
function setup(){
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });

	squareDim = vars['squareDim'];
	gridDim = vars['gridDim'];
	squareSize = squareDim;
	gridLength = gridDim;

	brushDim = 0;

	gridSize = gridLength*squareSize + 1;
	brushSize = squareSize;

	// Create canvas according to user inputted grid length and square size
	cnv = createCanvas(gridSize,gridSize);
	cnv.position(((windowWidth - width)/2)+95, ((windowHeight - height)/2));

	showGrid = true;
	hideGrid = false;

	// Fill array with grid squares
	gridY = [];
	for (var i=0; i<gridLength; i++){
		gridX = [];
		var shiftY = (squareSize*i);

		for (var j=0; j<gridLength; j++){
			var shiftX = (squareSize*j);
			gridX[j] = new GridSquare(shiftY,shiftX);
		};

		gridY[i] = gridX;
	};

	//Set starting hex and empty grid
	hex = '#ffffff'
	gridReset();
	paletteReset();
};

function draw(){
	// Calculate user's position, grid by grid
	mGridX = int(mouseX/squareSize);
	mGridY = int(mouseY/squareSize);

	// Draw all squares in grid to screen
	for (var i=0; i<gridLength; i++){
		for (var j=0; j<gridLength; j++){
			gridY[i][j].display(hex);

			//Toggle grid
			if (showGrid){
				gridY[i][j].gridOn();
			};
			if (hideGrid){
				gridY[i][j].gridOff();
			};
		}
	}

	//Custom cursor
	noCursor();
	noStroke();
	if (hex == '#ffffff'){
		stroke(0);
	}
	fill(hex);
	triangle(mouseX,mouseY,mouseX,mouseY+20,mouseX+14,mouseY+14);
};

// Keep canvas centered
function windowResized(){
	cnv.position(((windowWidth - width)/2)+95, ((windowHeight - height)/2));
};

/* Classes ------------------------------------------*/
//Individual grid squares
class GridSquare{
	constructor(posX,posY){
		this.posX = posX;
		this.posY = posY;
		this.color = '#ffffff';
		this.gridLines = '#ffffff';
	}
	display(){
		//Series of functions for filling in squares according to brush size
		if (mouseIsPressed){
			if (mGridX*squareSize == this.posX){
				if (mGridY*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+brushDim)*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+int(brushDim/2))*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
			};
			if ((mGridX+brushDim)*squareSize == this.posX){
				if (mGridY*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+brushDim)*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+int(brushDim/2))*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
			};
			if ((mGridX+int(brushDim/2))*squareSize == this.posX){
				if (mGridY*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+brushDim)*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
				if ((mGridY+int(brushDim/2))*squareSize == this.posY){
					this.color = hex;
					this.gridLines = hex;
					fill(color(this.color));
				};
			};
		};
		//Draw squares and their fill colors to canvas
		fill(color(this.color));
		rect(this.posX,this.posY,squareSize,squareSize);
	}
	//Toggle gridlines tool
	gridOn(){
		strokeWeight(1);
		stroke('#aaaaaa');
		fill('rgba(0,0,0,0)');
		rect(this.posX,this.posY,squareSize,squareSize);
	}
	//Toggle gridlines tool
	gridOff(){
		strokeWeight(1);
		stroke(this.gridLines);
		fill('rgba(0,0,0,0)');
		rect(this.posX,this.posY,squareSize,squareSize);
	}
	//Reset canvas tool
	squareReset(){
		this.color = '#ffffff';
		this.gridLines = '#ffffff';
		fill(color(this.color));
		rect(this.posX,this.posY,squareSize,squareSize);
	}
	//Fill canvas tool
	squareFill(){
		this.color = hex;
		this.gridLines = hex;
		fill(color(this.color));
		rect(this.posX,this.posY,squareSize,squareSize);
	}
};
