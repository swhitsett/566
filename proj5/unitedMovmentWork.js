/* Name : Rohan Yadav
 * FileName : p5.js
 * Description : Draw point, triangle, square and triangle strip in 
 each different quadrant using buffer, vertex and fragment shader.
 */

// ColoredRect.js (c) 2012 matsuda
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
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
        0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
        1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
        1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
        0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    // 1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // (red)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0   // (blue)
   ]),

   colors_2 : new Float32Array([     // Colors
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,   // v4-v7-v6-v5 back
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4  // v1-v6-v7-v2 left
         // 0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // (green)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // (blue)
         // 0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0  // (blue)
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

var lastTime = 0;
var yaw = 0;
var yawRate =0;
var angle = 0.0;
var chosenSpeed = 1;
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

   Rect.colors.push(Rect.colors_1);
   Rect.colors.push(Rect.colors_2);
   Rect.colors.push(Rect.colors_3);
   Rect.colors.push(Rect.colors_4);
   Rect.colors.push(Rect.colors_5);

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


   // Set the eye point and the viewing volume
   // camera.projMatrix.setPerspective(20, canvas.width/canvas.height, 1, 100);
   // camera.viewMatrix.setLookAt(0, 6, 20, 0, 0, 0, 0, 1, 0);
     document.onkeydown = function(ev){ handleKeyDown(ev);};
     document.onkeyup = function(ev){ handleKeyUp(ev); };
   var tick = function() {
    requestAnimationFrame(tick);
    handleKeys();
    draw(gl, n, u_MvpMatrix, mvpMatrix, canvas);
    animate();
      //update();
      //draw();
      //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
   };
   tick();
   // document.onkeydown = function(ev) { keydown(ev, gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix); };
   //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
   // draw(gl, n, u_MvpMatrix);
}

function draw(gl, n, u_MvpMatrix, mvpMatrix, canvas) {
   //draw buildings
   console.log("++++++++++++++++");
   console.log(camera.eyeX);
   console.log(camera.eyeY);
   console.log(camera.eyeZ);
   console.log(camera.centerX);
   console.log(camera.centerY);
   console.log(camera.centerZ);
   console.log(yaw);
   console.log("-----------------");
   // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   mvpMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
   mvpMatrix.lookAt(camera.eyeX, 1, camera.eyeZ, camera.centerX, 0, camera.centerZ, 0, 1, 0);
   drawBuildings(gl, n, u_MvpMatrix, mvpMatrix);
   draw_windmill(gl, n, u_MvpMatrix, mvpMatrix);
   //drawWindMill();
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
    camera.centerX = Math.sin(degToRad(yaw))*1000;
    camera.centerZ = Math.cos(degToRad(yaw))*1000;
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
    // if (currentlyPressedKeys[37]  {
    //     // Left cursor key or A
    //     yawRate -= 0.1;
    //     // x +=0.01;

    // } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
    //     // Right cursor key or D
    //     yawRate += 0.1;
    //     // x -=0.01;
    // } else {
    //     yawRate = 0;
    // }

    // if (currentlyPressedKeys[38]) {
    //     // Up cursor key or W
    //     // z -= 0.03
    //     speed = 0.3;
    // } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
    //     // Down cursor key
    //     // z += 0.03
    //     speed = -0.3;
    // } else {
    //     speed = 0;
    // }

    // if(currentlyPressedKeys[87]){
    //   if(chosenSpeed == 0)
    //     chosenSpeed = 1;
    //   else
    //     chosenSpeed = 0;
    // }
}

function initVertexBuffers(gl, Rect) {
   // Create a three buffer object of the Rect
   Rect.indexBuffer = gl.createBuffer();
   Rect.colorBuffer = gl.createBuffer();
   Rect.vertexBuffer = gl.createBuffer();
   // Write the vertex coordinates and color to the buffer object
   if (!setBufferData(gl, Rect.vertexBuffer, Rect.vertices, 3, gl.FLOAT, 'a_Position'))
      return -1;

   if (!setBufferData(gl, Rect.colorBuffer, Rect.colors[0], 3, gl.FLOAT, 'a_Color'))
      return -1;

   // Write the indices to the buffer object
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Rect.indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Rect.indices, gl.STATIC_DRAW);

   return Rect.indices.length;
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

// function keydown(ev, gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix) {
//   console.log("here");
//    if(ev.keyCode == 39) { // The right arrow key was pressed
//       g_eyeX += 0.11;
//    } else if (ev.keyCode == 37) { // The left arrow key was pressed
//       g_eyeX -= 0.11;
//    } else if (ev.keyCode == 38) { //The up arrow key was pressed
//       g_eyeY += 0.11; 
//    } else if (ev.keyCode == 40) { //The down arraow key was pressed
//       g_eyeY -= 0.11; 
//    }
//    else { 
//       return; 
//    }
//    //draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix);
// }

//function draw(gl, n, u_MvpMatrix, mvpMatrix, modelMatrix, viewMatrix, projMatrix) {

function drawBuildings(gl, n, u_MvpMatrix, mvpMatrix) {
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   // var i = 0;
   // // for(var i = 0; i < Rect.colors.length; i++) {
   //    // Draw translated and roatated Rects 
   //    var transX = -1.5; 
   //    modelMatrix.setTranslate(transX, (i*0.0), (i*-5.5));
   //    mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(modelMatrix);

   //    //setBufferData(gl, Rect.vertexBuffer, Rect.vertices, 3, gl.FLOAT, 'a_Position');
   //    setBufferData(gl, Rect.colorBuffer, Rect.colors[i], 3, gl.FLOAT, 'a_Color');
   //    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   //    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
   // }
   mvpMatrix.translate(1.5, 0.7, -1.8).rotate(angle,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
     // mvpMatrix.translate(1.5, 0.7, -1.8);

     //  mvpMatrix.translate(0.5, 0.5, 0.5);
     //  mvpMatrix.rotate(0, 1, 0, 0);
     //  mvpMatrix.rotate(0, 0, 1, 0);
     //  mvpMatrix.rotate(90, 0, 0, 1);
     //  mvpMatrix.translate(-0.5, -0.5, -0.5);

     //  mvpMatrix.scale(0.1, 1.2, 0.1);



      //Scale

      //Draw to the Scene
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

      //Undo Transformation to ready for next object.
      


      // mvpMatrix.scale(1/0.1, 1/1.2, 1/0.1);

      // mvpMatrix.translate(0.5, 0.5, 0.5);
      // mvpMatrix.rotate(-0, 0, 0, 1);
      // mvpMatrix.rotate(-0, 0, 1, 0);
      // mvpMatrix.rotate(-0, 1, 0, 0);
      // mvpMatrix.translate(-0.5, -0.5, -0.5);

      // mvpMatrix.translate(-1.5, -0.7, 1.8);
}

function draw_windmill(gl, n, u_MvpMatrix) {
  //   mvpMatrix.translate(1.5, 0.7, -1.8);

  // mvpMatrix.translate(0.5, 0.5, 0.5);
  // mvpMatrix.rotate(obj.rotx, 1, 0, 0);
  // mvpMatrix.rotate(obj.roty, 0, 1, 0);
  // mvpMatrix.rotate(obj.rotz, 0, 0, 1);
  // mvpMatrix.translate(-0.5, -0.5, -0.5);

  // mvpMatrix.scale(0.1, 1.2, 0.1);
//    windmill.modelMatrix.setTranslate(1.5, 0, -2).scale(0.3, 1.5, 0.3);
//    //windmill.modelMatrix.setTranslate(1.5, 0 , -5);
//    mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
//    setBufferData(gl, Rect.colorBuffer, Rect.colors[0], 3, gl.FLOAT, 'a_Color');
//    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
//    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
// // Windmill Blades----------------------------------------------------------// thanks to chuy Flores
//    windmill.modelMatrix.setIdentity();
//    mvpMatrix.setIdentity();
//    windmill.modelMatrix.translate(1.5, 0.7, -1.8).rotate(angle,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
//    mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
//    setBufferData(gl, Rect.colorBuffer, Rect.colors[0], 3, gl.FLOAT, 'a_Color');
//    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
//    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
//    windmill.modelMatrix.translate(1.5, 0.7, -1.8).rotate(-angle,0,0,1).scale(1/0.1, 1/1.2, 1/0.1).translate(-0.5,-0.5,0);

   // windmill.modelMatrix.setIdentity();
   // mvpMatrix.setIdentity();
   // windmill.modelMatrix.translate(1.5, 0.7, -1.8).rotate(angle+90,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
   // mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
   // setBufferData(gl, Rect.colorBuffer, Rect.colors[1], 3, gl.FLOAT, 'a_Color');
   // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

   // windmill.modelMatrix.setIdentity();
   // mvpMatrix.setIdentity();
   // windmill.modelMatrix.translate(1.5, 0.7, -1.8).rotate(angle+180,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0);
   // mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
   // setBufferData(gl, Rect.colorBuffer, Rect.colors[0], 3, gl.FLOAT, 'a_Color');
   // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

   // windmill.modelMatrix.setIdentity();
   // mvpMatrix.setIdentity();
   // windmill.modelMatrix.translate(1.5, 0.7, -1.8).rotate(angle+270,0,0,1).scale(0.1, 1.2, 0.1).translate(0.5,0.5,0); 
   // mvpMatrix.set(camera.projMatrix).multiply(camera.viewMatrix).multiply(windmill.modelMatrix);
   // setBufferData(gl, Rect.colorBuffer, Rect.colors[1], 3, gl.FLOAT, 'a_Color');
   // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
