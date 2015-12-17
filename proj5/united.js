/* Name Sam Whitsett
 * FileName : p5.js
 */
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'attribute vec2 a_TexCoord;\n' + 
'varying vec2 v_TexCoord;\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
'  gl_Position = u_MvpMatrix * a_Position;\n' +
'  v_Color = a_Color;\n' +
'  v_TexCoord = a_TexCoord;\n' +
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'uniform int u_mode;\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec2 v_TexCoord;\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
'  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
'  if(u_mode==1) {\n' + 
'      gl_FragColor = color;\n' +
'  }else{\n' +
'  gl_FragColor = v_Color;\n' +
'  }\n' +
'}\n';

// Global Varibles---------------------------------------------------------------
// Contains 
// 	@camera : an object containing the varibles for viewing location and lookat point
//	@Rect : an object containing vertices, colors and index arrays used to draw the Rectangles
//	@TextC : an object containing the the points of how the map the texture object
//  Numerous global Varibles are added to keep track of movment and angles
var camera = {
	 eyeX     : 0.0,
	 eyeY     : 0.0,
	 eyeZ     : 10.0,
	 lapX     : 0.0,
	 lapY     : 0.0,
	 lapZ     : 0.0,
	 upX      : 0.0,
	 upY      : 1.0,
	 upZ      : 0.0,
};

var Rect = {
	 // Create a Cube
	 //    v6----- v5
	 //   /|      /|
	 //  v1------v0|
	 //  | |     | |
	 //  | |v7---|-|v4
	 //  |/      |/
	 //  v2------v3

	 vertexBuffer : 0,
	 colorBuffer  : 0,
	 indexBuffer  : 0,
	 colors       : [],

	 boxVertices : new Float32Array([   // Vertex coordinates
				 0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,  // v0-v1-v2-v3 front
				 0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,  // v0-v3-v4-v5 right
				 0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  // v0-v5-v6-v1 up
				 -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  // v1-v6-v7-v2 left
				 -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,  // v7-v4-v3-v2 down
				 0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5   // v4-v7-v6-v5 back
	 ]),
	 boxColors : new Float32Array([     // Colors
				 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
				0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
				1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
				1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
				1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
				0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
	 ]),
	 boxIndices : new Uint8Array([    // boxIndices of the boxVertices
				 0, 1, 2,   0, 2, 3,     // front
				 4, 5, 6,   4, 6, 7,     // right
				 8, 9,10,   8,10,11,     // up
				 12,13,14,  12,14,15,    // left
				 16,17,18,  16,18,19,    // down
				 20,21,22,  20,22,23     // back
	 ])
};

var textCoords = {
	 modelMatrix : new Matrix4(),
	 vertices : new Float32Array( [
				-1.0,  1.0, -1.0,
				1.0,  1.0, -1.0,
				-1.0,  1.0,  1.0,
				-1.0,  1.0,  1.0,
				1.0,  1.0, -1.0,
				1.0,  1.0,  1.0,
				]),
	 buffer : 0,
	 texture : 0,
	 image : 0,
	 texture : 0,
};

var modelMatrix = new Matrix4();
var mvpMatrix = new Matrix4();

var lastTime = 0;
var yaw = 0;
var yawRate = 0;
var angle = 0.0;
var chosenSpeed = 1;
var buildingsDrawn = false;
var randInt = 0.0;
var rotateY = 1.0;
var randInt2 = 1.0;
//-------------------------------------------------------------------------
// main
// 	Called via the html, begins the process of initilization and drawing of the sceene.
function main() {
	 // Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	Rect.colors.push(Rect.boxColors);
	// Set the vertex information
	var n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	// Set the clear color and enable the depth test
	gl.clearColor(0.0, 0.0, 0.1, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Get the storage location of u_MvpMatrix
	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	if (!u_MvpMatrix) {
		console.log('Failed to get the storage location of u_MvpMatrix');
		return;
	}
	var u_mode = gl.getUniformLocation(gl.program, 'u_mode');
	var vn = initTextureBuffer(gl, textCoords, u_mode, u_MvpMatrix);
	if (vn < 0) {
		console.log('Failed to set texture information');
	}

	document.onkeydown = function(ev){ handleKeyDown(ev);};
	document.onkeyup = function(ev){ handleKeyUp(ev); };
	var tick = function() {
		requestAnimationFrame(tick);
		handleKeys();
		draw(gl, n, u_MvpMatrix, mvpMatrix, canvas, u_mode);
		animate();

	};
	tick();
}

//-------------------------------------------------------------------------
// animate
//	This function will handle the changes in movment provided by user input.
//	The calculations below are based on keypresses and change in time. Calculations
//	include changes to : look at point, eye position and movment of objects
function animate() {
	var timeNow = new Date().getTime();
	if(lastTime!=0){
		var elapsed = timeNow - lastTime;
		if(speed != 0) {
			camera.eyeX -= Math.sin(degToRad(yaw)) * speed * elapsed;
			camera.eyeZ -= Math.cos(degToRad(yaw)) * speed * elapsed;
		}
		camera.lapX = Math.sin(degToRad(yaw))*1000;
		camera.lapZ = Math.cos(degToRad(yaw))*1000;
		yaw += yawRate*elapsed;

	}
	lastTime = timeNow;
	angle = chosenSpeed * (45.0 * lastTime) / 1000.0;
	angle %= 360;
}

//-------------------------------------------------------------------------
// handleKeyDown / handleKeyUp 
//	The 2 following functions will handle the up/down keypresses durring a 
//	key event, the codes are then stored and used for varible changes in the
// 	handleKeys function
//  Parameters 	@event : event object containg the keycode
var currentlyPressedKeys = {};
function handleKeyDown(event) {
		currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
}
//-------------------------------------------------------------------------
// degToRad
//	the Function takes the degrees value from movment and converts it to radians 
// 	to return
// 	Parameters @degrees : double value of an angle in degrees
//	Returns : double - value calucated from the radians
function degToRad(degrees) {
		return degrees * Math.PI / 180;
}

//-------------------------------------------------------------------------
// handleKeys
//	This function is called after keypress. it will handle the changes to :
// 	movment about the y axis, if the user is moving, rotation of the fan blades
//	and the roatation of the windmill around the y axis
function handleKeys() {

		if (currentlyPressedKeys[37])//left
			yawRate = 0.1;
		else if (currentlyPressedKeys[39]) //right
			yawRate = -0.1;
		else
			yawRate = 0;

		if (currentlyPressedKeys[38]) //up
			speed = -0.03;
		else if (currentlyPressedKeys[40]) //down
			speed = 0.03;
		else
			speed = 0;

		if(currentlyPressedKeys[87]){ // w key
			if(chosenSpeed == 0)
				chosenSpeed = 1;
			else
				chosenSpeed = 0;
		}

		if(currentlyPressedKeys[89]){ // y key
			rotateY = angle;
			console.log("Hello");
		}
		else{
			rotateY = rotateY;
		}
}
//-------------------------------------------------------------------------
// initVertexBuffers
//	Initlizes the buffers for the Rect object
//	Parameters : @gl : gl object created in main
//	Returns : int - Length of the indices in the array
function initVertexBuffers(gl) {
	 Rect.indexBuffer = gl.createBuffer();
	 Rect.colorBuffer = gl.createBuffer();
	 Rect.vertexBuffer = gl.createBuffer();
	 // Write the vertex coordinates and color to the buffer object
	 if (!setBufferData(gl, Rect.vertexBuffer, Rect.boxVertices, 3, gl.FLOAT, 'a_Position'))
			return -1;

	 if (!setBufferData(gl, Rect.colorBuffer, Rect.colors[0], 3, gl.FLOAT, 'a_Color'))
			return -1;

	 // Write the boxIndices to the buffer object
	 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Rect.indexBuffer);
	 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Rect.boxIndices, gl.STATIC_DRAW);

	 return Rect.boxIndices.length;
}
//-------------------------------------------------------------------------
// setBufferData
//	binds the data from rect to a buffer called from initVertexBuffers
// 	Parameters : @gl : gl object
//							 @buffer : Selected buffer from the rect object for assingment
//							 @data : Vertices that are to be bined to @buffer
//							 @num : number of vertices per row
//							 @type : type of variable being used
//							 @attribute: type of attribute being used from the shader
//	Returns : true : if none of the assingnments fail
function setBufferData(gl, buffer, data, num, type, attribute) {
	 // Write date into the buffer object
	 gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	 gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	 // Assign the buffer object to the attribute variable
	 var a_attribute = gl.getAttribLocation(gl.program, attribute);
	 if (a_attribute < 0) {
			console.log('Failed to get the storage location of ' + attribute);
			return false;
	 }
	 gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	 // Enable the assignment of the buffer object to the attribute variable
	 gl.enableVertexAttribArray(a_attribute);

	 return true;
}
//-------------------------------------------------------------------------
// draw
//	sets the perspective and begins to draw the sceen
// 	Parameters : @gl : gl object
//							 @u_MvpMatrix : Storage Location of the Matrix
//							 @mvpMatrix : vertex Strorage location of the Matrix
//							 @n : number of vertices per row
//							 @canvas : canvas object from main for aspect ratio
//							 @u_mode : Shadder opiton used to check if a texture map should be used
function draw(gl, n, u_MvpMatrix, mvpMatrix, canvas, u_mode) {

	 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	 mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
	 mvpMatrix.lookAt(camera.eyeX, 0.3, camera.eyeZ, camera.lapX, 0, camera.lapZ, 0, 1, 0);
	 draw_windmill(gl, n, u_MvpMatrix, mvpMatrix, u_mode);
}
//-------------------------------------------------------------------------
// draw_windmill
//	Draws the Floor, buildings and Windmill on the sceene
// 	Parameters : @gl : gl object
//							 @u_MvpMatrix : Storage Location of the Matrix
//							 @mvpMatrix : vertex Strorage location of the Matrix
//							 @n : number of vertices per row
//							 @u_mode : Shadder opiton used to check if a texture map should be used
function draw_windmill(gl, n, u_MvpMatrix, mvpMatrix, u_mode) {

	// Ground-------------------------------------------------------
	gl.uniform1i(u_mode, 1);
	mvpMatrix.translate(0, -1.0, 0).scale(100, 0.01, 100);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.scale(1/100, 1/0.01, 1/100).translate(0, 1.0, 0);
	gl.uniform1i(u_mode, 0);
	// Fan Tower-------------------------------------------------------
	mvpMatrix.translate(1.5, 0, -2).rotate(rotateY,0,1,0).scale(0.3, 1.5, 0.3);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.scale(1/0.3, 1/1.5, 1/0.3).rotate(-rotateY,0,1,0).translate(-1.5, -0, 2);
	// Fan Blades-------------------------------------------------------
	mvpMatrix.translate(1.5, 0.7, -1.8).rotate((rotateY+1)%360,0,1,0).rotate(angle,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.translate(-0.5,-0.5,-0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-angle,0,0,1).rotate(-(rotateY+1)%360,0,1,0).translate(-1.5, -0.7, 1.8);

	mvpMatrix.translate(1.5, 0.7, -1.8).rotate((rotateY+1)%360,0,1,0).rotate(angle+90,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+90),0,0,1).rotate(-(rotateY+1)%360,0,1,0).translate(-1.5, -0.7, 1.8);

	mvpMatrix.translate(1.5, 0.7, -1.8).rotate((rotateY+1)%360,0,1,0).rotate(angle+180,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+180),0,0,1).rotate(-(rotateY+1)%360,0,1,0).translate(-1.5, -0.7, 1.8);

	mvpMatrix.translate(1.5, 0.7, -1.8).rotate((rotateY+1)%360,0,1,0).rotate(angle+270,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+270),0,0,1).rotate(-(rotateY+1)%360,0,1,0).translate(-1.5, -0.7, 1.8);

	// Draw Buildings
	 for(var i = 0; i < 5; i++) {
			var xvar;
			var yvar;
			var zvar;
			if(!buildingsDrawn){
				randInt2 = Math.random() * (4.0 - 0.1 + 1.0) + 0.1;
				buildingsDrawn = true;
				console.log(randInt);
			}
			if(i == 1){
				randInt = 2.2;
				xvar = 1.0;
				yvar = 1.2;
				zvar = 1.0;
			}
			else if(i == 2){
				randInt = 4.2;
				xvar = 1.0;
				yvar = 1.7;
				zvar = 1.0;
			}
			else if(i == 3){
				randInt = 6.8;
				xvar = 2.6;
				yvar = 6.0;
				zvar = 2.0;
			}
			else if(i == 4){
				randInt = -3.0;
				xvar = 2.6;
				yvar = 3.0;
				zvar = 2.0;
			}
			else{
				randInt = 2.9;
				xvar = 0.8;
				yvar = 1.0;
				zvar = 0.2;
			}

			mvpMatrix.translate((randInt2*randInt),(0),(randInt2*randInt)).scale(xvar,yvar,zvar);
			gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
			gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
			mvpMatrix.scale( 1/xvar,1/yvar,1/zvar).translate(-(randInt2*randInt),(0),-(randInt2*randInt));
		}
}
//-------------------------------------------------------------------------
// initTextureBuffer
// 	Initlizes the buffer for the texture corrdinates / loads in the image
// 	Parameters : @gl : gl object
//							 @u_MvpMatrix : Storage Location of the Matrix
//							 @textCoords : Object containg the texture cordinates to be mapped
//							 @u_mode : Shadder opiton used to check if a texture map should be used
//	Returns : true : if none of hte initlizations fail
function initTextureBuffer(gl, textCoords, u_mode, u_MvpMatrix) {
	 //set up textCoords buffer
	 textCoords.buffer = gl.createBuffer();
	 if (!textCoords.buffer) {
			return -1;
	 }

	 var FSIZE = Rect.boxVertices.BYTES_PER_ELEMENT;

	 var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
	 if (a_TexCoord < 0) {
			console.log('Failed to get the storage location of a_TexCoord');
			return -1;
	 }
	 gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
	 gl.enableVertexAttribArray(a_TexCoord);

	 textCoords.texture = gl.createTexture();
	 if (!textCoords.texture) {
			console.log('Failed to create the textCoords object');
			return false;
	 }

	 // Create the image object
	 textCoords.image = new Image();
	 if (!textCoords.image) {
			console.log('Failed to create the image object');
			return false;
	 }
	 // Register the event handler to be called when image loading is completed
	 textCoords.image.onload = function(){ loadTexture(gl, Rect.boxIndices.length, 
			textCoords.texture, textCoords.image, u_MvpMatrix, u_mode); };
	 // Tell the browser to load an Image
	 textCoords.image.src = 'tilet2.jpg';

	 return true;
}
//-------------------------------------------------------------------------
// loadTexture
// 	Loads the texture and processes it to a texturemap
// 	Parameters : @gl : gl object
//							 @u_MvpMatrix : Storage Location of the Matrix
//							 @texture : shader object containg the texture information
//							 @n : number of vertices per row
//							 @u_mode : Shadder opiton used to check if a texture map should be used
//							 @image : the image to be loaded to the texturemap
function loadTexture(gl, n, texture, image, u_MvpMatrix, u_mode) {

	 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	 // Make the texture unit active
	 gl.activeTexture(gl.TEXTURE0);
	 // // Bind the texture object to the target
	 gl.bindTexture(gl.TEXTURE_2D, texture);   
	 // Set texture parameters
	 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	 // // Set the image to texture
	 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	 var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
																								 
	 gl.uniform1i(u_Sampler, 0); 
}