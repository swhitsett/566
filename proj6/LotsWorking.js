// PointLightedCube.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Coordinate transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Recalculate the normal based on the model matrix and make its length 1.
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // Calculate the dot product of the normal and light direction
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
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

var lastTime = 0;
var yaw = 0;
var yawRate = 0;
var angle = 0.0;
var chosenSpeed = 1;
var buildingsDrawn = false;
var randInt = 0.0;
var rotateY = 1.0;
var randInt2 = 1.0;
var aLight = 0.2;
var speed;

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
   normals : new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
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

  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition|| !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  var vpMatrix = new Matrix4();   // View projection matrix
  // vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // vpMatrix.lookAt(-10, 10, 20, 0, 0, 0, 0, 1, 0);

  // Set the light color (white)
  // gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // // Set the light direction (in the world coordinate)
  // gl.uniform3f(u_LightPosition, 3.1, 2.2, -2);
  // // Set the ambient light
  // gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var currentAngle = 0.0;  // Current rotation angle

  document.onkeydown = function(ev){ handleKeyDown(ev);};
  document.onkeyup = function(ev){ handleKeyUp(ev); };
  var tick = function() {
    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3f(u_LightPosition, 3.1, 2.2, -2);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, aLight, aLight, aLight);

    handleKeys();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw(gl, n, currentAngle, u_NormalMatrix, u_ModelMatrix, u_MvpMatrix, canvas, vpMatrix);
    animate();
    requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
  };
  tick();
}
function draw(gl, n, currentAngle, u_NormalMatrix, u_ModelMatrix, u_MvpMatrix, canvas, vpMatrix){
  // var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(camera.eyeX, 0.3, camera.eyeZ, camera.lapX, 0, camera.lapZ, 0, 1, 0);
//Light Position
  pushMatrix(modelMatrix);
  modelMatrix.translate(3.1, 2.2, -2).scale(0.3, 0.3, 0.3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  mvpMatrix.set(vpMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  modelMatrix = popMatrix();
//Wall
  pushMatrix(modelMatrix);
  modelMatrix.translate(7.0, 0.0, -2).rotate(45,0,1,0).scale(1.5, 3.0, 1.5);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  mvpMatrix.set(vpMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  modelMatrix = popMatrix();
//Floor
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, -1.0, 0).scale(100, 0.01, 100);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
//Post Horizontal
    pushMatrix(modelMatrix);
    modelMatrix.translate(2.3, 2.5, -2).scale(2.0, 0.2, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
//Post Vertical
    pushMatrix(modelMatrix);
    modelMatrix.translate(1.5, 0, -2).scale(0.2, 5.0, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(Math.sin(angle*0.021)*5, 0, Math.cos(angle*0.021)*5).rotate((angle*1.25)-360,0,1,0).rotate(-20,0,0,1);
//Plane Body
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.1, 0).scale(0.2, 0.3, 1.5);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
// wings 1
    pushMatrix(modelMatrix);
    modelMatrix.translate(0.3, 0.1, 0.2).scale(0.7, 0.1, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
// wings 2
    pushMatrix(modelMatrix);
    modelMatrix.translate(-0.3, 0.1, 0.2).scale(0.7, 0.1, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
// tail vertical
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.3, -0.4).rotate(-20,1,0,0).scale(0.1, 0.4, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
// tail Horzontal
    pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, -0.5).scale(0.6, 0.1, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();

    modelMatrix = popMatrix();
}
function initVertexBuffers(gl) {

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', Rect.boxVertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', Rect.boxColors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', Rect.normals, 3, gl.FLOAT)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Rect.boxIndices, gl.STATIC_DRAW);

  return Rect.boxIndices.length;
  // return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
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

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}
//-------------------------------------------------------------------------
// animate
//  This function will handle the changes in movment provided by user input.
//  The calculations below are based on keypresses and change in time. Calculations
//  include changes to : look at point, eye position and movment of objects
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
  // angle %= 360;
}

//-------------------------------------------------------------------------
// handleKeyDown / handleKeyUp 
//  The 2 following functions will handle the up/down keypresses durring a 
//  key event, the codes are then stored and used for varible changes in the
//  handleKeys function
//  Parameters  @event : event object containg the keycode
var currentlyPressedKeys = {};
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;

    if(event.keyCode == 87){ // w key
      if(aLight >= 0.2)
        aLight = 0.0;// chosenSpeed = 1;
      else
        aLight = 0.2;
        // chosenSpeed = 0;
    }
}
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}
//-------------------------------------------------------------------------
// degToRad
//  the Function takes the degrees value from movment and converts it to radians 
//  to return
//  Parameters @degrees : double value of an angle in degrees
//  Returns : double - value calucated from the radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
//-------------------------------------------------------------------------
// handleKeys
//  This function is called after keypress. it will handle the changes to :
//  movment about the y axis, if the user is moving, rotation of the fan blades
//  and the roatation of the windmill around the y axis
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

    // if(currentlyPressedKeys[87]){ // w key
    //   if(aLight >= 0.2)
    //     aLight = 0.0;// chosenSpeed = 1;
    //   else
    //     aLight = 0.2;
    //     // chosenSpeed = 0;
    // }

    if(currentlyPressedKeys[89]){ // y key
      rotateY = angle;
      console.log("Hello");
    }
    else{
      rotateY = rotateY;
    }
}