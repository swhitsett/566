// ColoredCube.js (c) 2012 matsuda
// Vertex shader program
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


var yaw = 0;
var yawRate = 0;
var speed = 0;
var g_eyeX = 0.0, g_eyeY = 1, g_eyeZ = 2.0; // Eye position
var g_laX = 0, g_laY = 0.0, g_laZ = 0.0; // LookAt Position (Starting -1.0y)
var lastTime = 0;

var x = 0;
var y = 0.2;
var z = 2;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
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

  // Set the eye point and the viewing volume
  // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  var mvpMatrix = new Matrix4();
  // mvpMatrix.setPerspective(80, (gl.viewportWidth / gl.viewportHeight) , .1, 100);
  // mvpMatrix.lookAt(0, 1, 3.7, 0, 0, 0, 0, 1, 0);

  // Pass the model view projection matrix to u_MvpMatrix
  // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  document.onkeydown = function(ev){ handleKeyDown(ev); };
  document.onkeyup = function(ev){ handleKeyUp(ev); };
  // Clear color and depth buffer
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // // Draw the cube
  // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  var tick = function() {
    requestAnimationFrame(tick);
    handleKeys();
    draw(gl, n, u_MvpMatrix, mvpMatrix);   // Draw
    animate();
  };
  tick();
}
//+++++++++++++++++++++++++++++++++++++++++++
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

var pitch = 0;
var pitchRate = 0;

var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 0.4;
var zPos = 0;

var speed = 0;

function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        pitchRate = 0.1;
    } else if (currentlyPressedKeys[34]) {
        // Page Down
        pitchRate = -0.1;
    } else {
        pitchRate = 0;
    }

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
        // Left cursor key or A
        yawRate = -0.1;
        x +=0.01;

    } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
        // Right cursor key or D
        yawRate = 0.1;
        x -=0.01;
    } else {
        yawRate = 0;
    }

    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
        // Up cursor key or W
        z -= 0.03
        speed = 0.03;
    } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
        // Down cursor key
        z += 0.03
        speed = -0.03;
    } else {
        speed = 0;
    }

}

function draw(gl, n, u_MvpMatrix, mvpMatrix) {

  // var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(80, (gl.viewportWidth / gl.viewportHeight) , .1, 100);
  mvpMatrix.lookAt(g_eyeX, y, g_eyeZ, g_laX, 0, 0, 0, 1, 0);//setLookAt(g_eyeX, g_eyeY, g_eyeZ, g_laX, g_laY, g_laZ, 0, 1, 0);
  // console.log(g_eyeX);
  // console.log(g_eyeY);
  // console.log(g_eyeZ);
  // console.log(g_laX);
  // console.log(g_laY);
  // console.log(g_laZ);
  // console.log ("-----");
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  // // Set the matrix to be used for to set the camera view
  // viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, g_laX, g_laY, g_laZ, 0, 1, 0);
  // // Pass the view projection matrix
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // gl.clear(gl.COLOR_BUFFER_BIT);     // Clear <canvas>
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function animate() {
  var timeNow = new Date().getTime();
  if(lastTime!=0){
    var elapsed = timeNow - lastTime;
    /* if moving forward or backward */
    if(speed != 0) {
      g_eyeX -= Math.sin(degToRad(yaw)) * speed; //* elapsed;
      g_eyeZ -= Math.cos(degToRad(yaw)) * speed; //* elapsed;
    }
    g_laX = Math.sin(degToRad(yaw));
    g_laZ = Math.cos(degToRad(yaw));
    yaw += yawRate*elapsed;
    console.log ("-----");
    console.log(g_eyeX);
    console.log(g_eyeY);
    console.log(g_eyeZ);
    console.log(g_laX);
    console.log(g_laY);
    console.log(g_laZ);
    console.log ("-----+");
  }
  lastTime = timeNow;
}
//+++++++++++++++++++++++++++++++++++++++++++

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
     //Floor
     -3.0, 0.00, 3.0,    3.0, 0.0,  3.0,   3.0, 0.0, -3.0,  -3.0, 0.0,  -3.0,     // v7-v4-v3-v2 down
     //Windmil Tower
     -0.1, 0.03, 0.3,    0.1, 0.03, 0.3,   0.1, 0.03,-0.1,  -0.1, 0.03, -0.1,     //bottom windmil v7-v4-v3-v2
     -0.1, 0.90, 0.3,    0.1, 0.9,  0.3,   0.1, 0.9, -0.1,  -0.1, 0.9,  -0.1,     //Top Windmil    v6-v5-v0-v1
     -0.1, 0.03, 0.3,   -0.1, 0.9,  0.3,  -0.1, 0.9, -0.1,  -0.1, 0.03, -0.1,     //Left WIndmil   v7-v6-v1-v2
      0.1, 0.03, 0.3,    0.1, 0.9,  0.3,   0.1, 0.9, -0.1,   0.1, 0.03, -0.1,     //Right Windmil  v4-v5-v0-v3
     -0.1, 0.03, 0.3,    0.1, 0.03, 0.3,   0.1, 0.9,  0.3,  -0.1, 0.9,   0.3,     //Back Windmil   v7-v4-v5-v6
     -0.1, 0.03,-0.1,    0.1, 0.03,-0.1,   0.1, 0.9, -0.1,  -0.1, 0.9,  -0.1,     //Front Windmil  v2-v3-v0-v1
     // Fan Blades
     -0.3, 0.7, 0.4,    0.3, 0.7, 0.4,      0.3, 0.9, 0.4,  -0.3, 0.9,  0.4,       //Blade back    bL-bR-tR-tL
     -0.3, 0.7, 0.6,    0.3, 0.7, 0.6,      0.3, 0.9, 0.6,  -0.3, 0.9,  0.6,       //Blade Front   bL-bR-tR-tL
     -0.3, 0.7, 0.4,    -0.3, 0.9,0.4,     -0.3, 0.9, 0.6,  -0.3, 0.7,  0.6,       //Left Side    bl-tl-bl-tl
     0.3, 0.7, 0.4,      0.3, 0.9, 0.4,     0.3, 0.9, 0.6,   0.3, 0.7, 0.6,        //Right Side   bR-tR-bR-tR
     0.3, 0.9, 0.4,  -0.3, 0.9,  0.4,     -0.3, 0.9,  0.6,   0.3, 0.9, 0.6,        //Top Side     tR-tL-tL-tR
     -0.3, 0.7, 0.4,    0.3, 0.7, 0.4,    0.3, 0.7, 0.6,     -0.3, 0.7, 0.6,       //Bottom Side  bL-bR-bR-bL
    //  1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
    //  1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    // -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    // -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0  // v7-v4-v3-v2 down
    //  // 1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    //Floor
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v1-v2-v3 front(blue)
    //Windmil Tower
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    // Fan Blades
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    // 0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    // 1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    // 1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    // 1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    // 0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     //Floor
     0, 1, 2,   0, 2, 3,    // front
     //Windmil Tower
     4, 5, 6,   4, 6, 7,
     8, 9,10,   8,10,11,
     12,13,14,  12,14,15,
     16,17,18,  16,18,19,
     20,21,22,  20,22,23,
     24,25,26,  24,26,27,
     // Fan Blades
     28,29,30,  28,30,31,
     32,33,34,  32,34,35,
     36,37,38,  36,38,39,
     40,41,42,  40,42,43,
     44,45,46,  44,46,47,
     48,49,50,  48,50,51,
    //  4, 5, 6,   4, 6, 7,    // right
    //  8, 9,10,   8,10,11,    // up
    // 12,13,14,  12,14,15,    // left
    // 16,17,18,  16,18,19,    // down
    // 20,21,22,  20,22,23     // back
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
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