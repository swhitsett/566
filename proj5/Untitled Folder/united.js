/* Name : Rohan Yadav
 * FileName : p5.js
 * Description : Draw point, triangle, square and triangle strip in 
 each different quadrant using buffer, vertex and fragment shader.
 */

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


/********* Global Variables ****************************/
var cube = {
   // Create a cube
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

   vertices : new Float32Array([   // Vertex coordinates
         0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,  // v0-v1-v2-v3 front
         0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,  // v0-v3-v4-v5 right
         0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  // v0-v5-v6-v1 up
         -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  // v1-v6-v7-v2 left
         -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,  // v7-v4-v3-v2 down
         0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5   // v4-v7-v6-v5 back
   ]),
   /*
   colors : new Float32Array([     // Colors
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
         0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
         1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
         1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
         1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
         0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
   ]),
   front right up left down back
   */

   colors_1 : new Float32Array([     // Colors
         1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // (red)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0   // (blue)
   ]),

   colors_2 : new Float32Array([     // Colors
         0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // (green)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0  // (blue)
   ]),

   colors_3 : new Float32Array([     // Colors
         1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0   // (blue)
   ]),

   colors_4 : new Float32Array([     // Colors
         1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0  // (blue)
   ]),

   colors_5 : new Float32Array([     // Colors
         0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,   // v4-v7-v6-v5 back
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0  // (blue)
   ]),

   indices : new Uint8Array([       // Indices of the vertices
         0, 1, 2,   0, 2, 3,    // front
         4, 5, 6,   4, 6, 7,    // right
         8, 9,10,   8,10,11,    // up
         12,13,14,  12,14,15,    // left
         16,17,18,  16,18,19,    // down
         20,21,22,  20,22,23     // back
   ])
};


var camera = {
   eyeX     : 0.0,
   eyeY     : 0.0,
   eyeZ     : 10.0,
   centerX  : 0.0,
   centerY  : 0.0,
   centerZ  : 0.0,
   upX      : 0.0,
   upY      : 1.0,
   upZ      : 0.0,
   viewMatrix : new Matrix4(),
   projMatrix: new Matrix4()
};



var modelMatrix = new Matrix4();
var mvpMatrix = new Matrix4();

var windmill = {
   modelMatrix : new Matrix4(),
   mvpMatrix : new Matrix4()
};

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

   cube.colors.push(cube.colors_1);
   cube.colors.push(cube.colors_2);
   cube.colors.push(cube.colors_3);
   cube.colors.push(cube.colors_4);
   cube.colors.push(cube.colors_5);

   // Set the vertex information
   var n = initVertexBuffers(gl, cube);
   if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
   }

   // Set the clear color and enable the depth test
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);
   //gl.enable(gl.CULL_FACE);

   // Get the storage location of u_MvpMatrix
   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
   }


   // Set the eye point and the viewing volume
   camera.projMatrix.setPerspective(20, canvas.width/canvas.height, 1, 100);
   camera.viewMatrix.setLookAt(0, 0, 0, 0, 0, 0, 0, 1, 0);

   var tick = function() {
      //update();
      //draw();
      //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
   }
   //tick();
   //document.onkeydown = function(ev) { keydown(ev, gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix); };
   //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
   draw(gl, n, u_MvpMatrix);
}

function initVertexBuffers(gl, cube) {
   // Create a three buffer object of the cube
   cube.indexBuffer = gl.createBuffer();
   if (!cube.indexBuffer) 
      return -1;

   cube.colorBuffer = gl.createBuffer();
   if (!cube.colorBuffer) 
      return -1;

   cube.vertexBuffer = gl.createBuffer();
   if (!cube.vertexBuffer) 
      return -1;

   // Write the vertex coordinates and color to the buffer object
   if (!setBufferData(gl, cube.vertexBuffer, cube.vertices, 3, gl.FLOAT, 'a_Position'))
      return -1;

   if (!setBufferData(gl, cube.colorBuffer, cube.colors[0], 3, gl.FLOAT, 'a_Color'))
      return -1;

   // Write the indices to the buffer object
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

   return cube.indices.length;
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

function keydown(ev, gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix) {
   if(ev.keyCode == 39) { // The right arrow key was pressed
      g_eyeX += 0.11;
   } else if (ev.keyCode == 37) { // The left arrow key was pressed
      g_eyeX -= 0.11;
   } else if (ev.keyCode == 38) { //The up arrow key was pressed
      g_eyeY += 0.11; 
   } else if (ev.keyCode == 40) { //The down arraow key was pressed
      g_eyeY -= 0.11; 
   }
   else { 
      return; 
   }
   //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
}

//function draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix) {
function draw(gl, n, u_MvpMatrix) {
   //draw buildings
   drawBuildings(gl, n, u_MvpMatrix);
   // draw_windmill(gl, n, u_MvpMatrix);
   //drawWindMill();
}

function drawBuildings(gl, n, u_MvpMatrix) {
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   for(var i = 0; i < cube.colors.length; i++) {
      //Draw translated and roatated cubes 
      var transX = -1.5; 
      modelMatrix.setTranslate(transX, (i*0.0), (i*-5.5));
      mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(modelMatrix);

      //setBufferData(gl, cube.vertexBuffer, cube.vertices, 3, gl.FLOAT, 'a_Position');
      setBufferData(gl, cube.colorBuffer, cube.colors[i], 3, gl.FLOAT, 'a_Color');
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
   }
}

function draw_windmill(gl, n, u_MvpMatrix) {
   //windmill.modelMatrix.setRotate(90,0, 0, 3).setScale(-0.8, 1.3, 0).setTranslate(1.5, 0, -5);
   //windmill.modelMatrix.setTranslate(2.5, 0, -5).rotate(90,0, 0, 0).scale(-0.8, 1.3, 0);
   windmill.modelMatrix.setTranslate(1.5, 0, -9).scale(-0.3, 1.5, 0);
   //windmill.modelMatrix.setTranslate(1.5, 0 , -5);
   mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
   setBufferData(gl, cube.colorBuffer, cube.colors[0], 3, gl.FLOAT, 'a_Color');
   gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
