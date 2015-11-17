
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
'  gl_Position = u_MvpMatrix * a_Position;\n' +
'  v_Color = a_Color;\n' +
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' +
'  gl_FragColor = v_Color;\n' +
'}\n';


/********* Global Variables ****************************/
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

var modelMatrix = new Matrix4();
var mvpMatrix = new Matrix4();

var lastTime = 0;
var yaw = 0;
var yawRate =0;
var angle = 0.0;
var chosenSpeed = 1;
var buildingsDrawn = false;
var randInt = 0.0;

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
   var n = initVertexBuffers(gl, Rect);
   if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
   }

   // Set the clear color and enable the depth test
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   // Get the storage location of u_MvpMatrix
   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
   }
     document.onkeydown = function(ev){ handleKeyDown(ev);};
     document.onkeyup = function(ev){ handleKeyUp(ev); };
   var tick = function() {
    requestAnimationFrame(tick);
    handleKeys();
    draw(gl, n, u_MvpMatrix, mvpMatrix, canvas);
    animate();

   };
   tick();
}

function draw(gl, n, u_MvpMatrix, mvpMatrix, canvas) {
   //draw buildings
   console.log("++++++++++++++++");
   console.log(camera.eyeX);
   console.log(camera.eyeY);
   console.log(camera.eyeZ);
   console.log(camera.lapX);
   console.log(camera.lapY);
   console.log(camera.lapZ);
   console.log(yaw);
   console.log("-----------------");
   // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   mvpMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
   mvpMatrix.lookAt(camera.eyeX, 1, camera.eyeZ, camera.lapX, 0, camera.lapZ, 0, 1, 0);
   draw_windmill(gl, n, u_MvpMatrix, mvpMatrix);
}

function animate() {
  // console.log ("-----+");
  var timeNow = new Date().getTime();
  if(lastTime!=0){
    var elapsed = timeNow - lastTime;
    /* if moving forward or backward */
    // console.log ("-----a");
    if(speed != 0) {
      camera.eyeX -= Math.sin(degToRad(yaw)) * speed * elapsed;
      camera.eyeZ -= Math.cos(degToRad(yaw)) * speed * elapsed;
    }
    // console.log ("-----b");
    camera.lapX = Math.sin(degToRad(yaw))*1000;
    camera.lapZ = Math.cos(degToRad(yaw))*1000;
    yaw += yawRate*elapsed;
    // console.log ("-----c");
    // console.log(camera.eyeX);
    // console.log(camera.eyeZ);

    // console.log ("-----/");
  }
  lastTime = timeNow;
  angle = chosenSpeed * (45.0 * lastTime) / 1000.0;
  angle %= 360;
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

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

    if(currentlyPressedKeys[121]){ // y key
      console.log("Hello");
    }
}

function initVertexBuffers(gl, Rect) {
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

function draw(gl, n, u_MvpMatrix, mvpMatrix, canvas) {
   // console.log("++++++++++++++++");
   // console.log(camera.eyeX);
   // console.log(camera.eyeY);
   // console.log(camera.eyeZ);
   // console.log(camera.lapX);
   // console.log(camera.lapY   );
   // console.log(camera.lapZ);
   // console.log(yaw);
   // console.log("-----------------");
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
   mvpMatrix.lookAt(camera.eyeX, 0.3, camera.eyeZ, camera.lapX, 0, camera.lapZ, 0, 1, 0);
   draw_windmill(gl, n, u_MvpMatrix, mvpMatrix);
}

function draw_windmill(gl, n, u_MvpMatrix, mvpMatrix) {
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // mrHold2 = u_MvpMatrix;
  // Ground
  mvpMatrix.translate(0, -1.0, 0).scale(100, 0.01, 100);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.scale(1/100, 1/0.01, 1/100).translate(0, 1.0, 0);
  // Fan Tower
  mvpMatrix.translate(1.5, 0, -2).scale(0.3, 1.5, 0.3);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.scale(1/0.3, 1/1.5, 1/0.3).translate(-1.5, -0, 2);
  // Fan Blades
  mvpMatrix.translate(1.5, 0.7, -1.8).rotate(angle,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-angle,0,0,1).translate(-1.5, -0.7, 1.8);

  mvpMatrix.translate(1.5, 0.7, -1.8).rotate(angle+90,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+90),0,0,1).translate(-1.5, -0.7, 1.8);

  mvpMatrix.translate(1.5, 0.7, -1.8).rotate(angle+180,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+180),0,0,1).translate(-1.5, -0.7, 1.8);

  mvpMatrix.translate(1.5, 0.7, -1.8).rotate(angle+270,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  mvpMatrix.translate(-0.5,-0.5,0).scale(1/0.1, 1/1.2, 1/0.1).rotate(-(angle+270),0,0,1).translate(-1.5, -0.7, 1.8);

  // Draw Buildings
   for(var i = 0; i < 5; i++) {
      var xvar;
      var yvar;
      var zvar;
      // if(!buildingsDrawn){
      //   randInt = Math.random() * (4.0 - 0.1 + 1.0) + 0.1;
      //   buildingsDrawn = true;
      //   console.log(randInt);
      // }
      // if(i == 1){
        randInt = 1.2;
        xvar = 1.0;
        yvar = 1.2;
        zvar = 1.0;
      // }
      // if(i == 2){
      //   randInt = 3.2;
      //   xvar = 1.0;
      //   yvar = 0.7;
      //   zvar = 1.0;
      // }
      // else if(i == 4){
      //   randInt = 1.8;
      //   xvar = 2.6;
      //   yvar = 3.0;
      //   zvar = 2.0;
      // }
      // else{
      //   randInt = -2.9;
      //   xvar = 0.8;
      //   yvar = .0;
      //   zvar = 0.2;
      // }

      mvpMatrix.translate((i.toFixed(2)*randInt),(0),(i.toFixed(2)*randInt)).scale(xvar,yvar,zvar);
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
      mvpMatrix.scale( 1/xvar,1/yvar,1/zvar).translate(-(i.toFixed(2)*randInt),(0),-(i.toFixed(2)*randInt));
    }
  // console.log(mvpMatrix);
  //   // mvpMatrix.translate(1.5, 0.7, -1.8);
  // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  // // mvpMatrix.translate(-1.5, -0.7, 1.8);
  // console.log(mvpMatrix);
}