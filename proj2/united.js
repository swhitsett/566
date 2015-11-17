/**
 * proj2.js
 * @author Sam Whitsett
 */

// move to main, pass by val
var i = 0.1;
var x = 0.0;
var y = 0.0;
var follow_x = 3.0;
var follow_y = 3.0;
var moved = false;
"use strict";

function main() {

   // Vertex shader program
   var VSHADER_SOURCE =
      'attribute vec4 a_Position;\n' +
      'uniform mat4 u_xformMatrix;\n' +
      'void main() {\n' +
      '  gl_Position = u_xformMatrix * a_Position;\n' +
      '}\n';

   // Fragment shader program
   var FSHADER_SOURCE =
      'precision mediump float;\n' +
      'uniform vec4 u_Color;\n' +
      'void main() {\n' +
      '  gl_FragColor = u_Color;\n' +
      '}\n';

   // shader vars
   var shaderVars = {
      u_xformMatrix:0,    
      a_Position:0,       
      u_Color:0            
   };

   var triangle = {
      vertices:   new Float32Array([
         0.0,  0.2,    1, 0, 0,
         -0.2, -0.2,   0, 1, 0,
         0.2, -0.2,    0, 0, 1,
         // 0.75, -0.75,  1, 0, 0,
         // 1.0, -1.0,    0, 1, 0
      ]),
      n: 3,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var fan = {
      vertices:   new Float32Array([
         -0.1,  0.1,    1, 0, 0,
         -0.1, -0.1,   0, 1, 0,
         0.1, 0.1,    0, 0, 1,
         0.1, -0.1,  1, 0, 0,
         // 0.1, -0.1,    0, 1, 0
      ]),
      n: 4,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var strip = {
      vertices:   new Float32Array([
         -0.1,  0.1,    1, 0, 0,
         -0.1, -0.1,   0, 1, 0,
         0.1, 0.1,    0, 0, 1,
         0.1, -0.1,  1, 0, 0,
         0.1, -0.1,    0, 1, 0
      ]),
      n: 5,
      modelMatrix: new Matrix4,
      buffer: 0
   };


   var quad = {
      vertices:   new Float32Array([
         -0.1,  0.1,
         -0.1, -0.1,
         0.1,  0.1,
         0.1, -0.1
      ]),
      n: 4,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var lines = {
      vertices:   new Float32Array([
         -0.8,  0.8,
         -0.8, -0.8,
         0.8,  0.8,
         0.8, -0.8
      ]),
      n: 2,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var point = {
      vertices:   new Float32Array([
         0.0,  0.5
      ]),
      n: 1,
      PointSize: 30,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var tristrip = {
      vertices:   new Float32Array([
         -0.8,  0.8,    1, 0, 0,
         -0.7, -0.0,   0, 1, 0,
         -0.2, -0.2,    0, 0, 1,
         0.4, -0.4,  1, 0, 0,
         0.2, -0.2,    0, 1, 0,
         0.4, -0.4,    0, 0, 1
      ]),
      n: 6,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var canvas = document.getElementById('webgl');
   var gl = getWebGLContext(canvas);
   if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
   }


   initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

   shaderVars.u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');

   shaderVars.a_Position = gl.getAttribLocation(gl.program, 'a_Position');

   shaderVars.u_Color = gl.getUniformLocation(gl.program, 'u_Color');

   // color to clear background with
   gl.clearColor(0, 0, 0, 1);


   var n = initModels(gl, shaderVars, triangle, quad, fan, strip, lines, tristrip, point);
   if (n < 0) {
      console.log('Failed to initialize models');
      return;
   }

   canvas.onmousedown = function(ev){ click(ev, gl, canvas, quad) };

   var last = Date.now();
   var angle = 0;

   var tick = function() {
      animate(triangle, fan, strip, last, angle);
      render(gl, shaderVars, triangle, quad, fan, strip, lines, tristrip, point);
      requestAnimationFrame(tick, canvas);
   };
   tick();
}

/**
 * click - Handles and grabs the location on a mouse down event
 */
function click(ev, gl, canvas, quad) {
  x = ev.clientX; 
  y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  follow_x = 3.0;
  follow_y = 3.0;
  quad.modelMatrix.setTranslate(x, y, 0);
  moved = false;

}

/**
 * animate - animates the desired objects based off the mouse click.
 */
function animate(triangle, fan, strip, last, angle) {
   var now = Date.now();
   var elapsed = now - last;
   last = now;
   angle = angle + (30 * elapsed) / 1000.0;

   movmentX = x/follow_x;
   movmentY = y/follow_y;

   strip.modelMatrix.setRotate(angle*(movmentX *100), 0, 0, 1);
   triangle.modelMatrix.setTranslate(movmentX, movmentY, 0);
   fan.modelMatrix.setTranslate(-movmentX, -movmentY, 0);
   if(Math.abs(x) > Math.abs(movmentX) && moved == false){
      follow_x -= 0.1;
   }
   else{
    if( 0.0 != Math.abs(movmentX) )
      follow_x += 0.1;
    moved = true;
   }

   if(Math.abs(y) > Math.abs(movmentY) && moved == false){
    follow_y -= 0.1;
   }
   else{
    moved = true;
    if( 0.0 != Math.abs(movmentY))
      follow_y += 0.1;
   }
   //console.log(follow_x);

}

/**
 * render - renders the scene using WebGL
 */
function render(gl, shaderVars, triangle, quad, fan, strip, lines, tristrip, point) {

   // clear the canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw triangle------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, 0, .8, 0, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, triangle.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, triangle.buffer);
   var FSIZE = triangle.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangle.n);

   // draw quad------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, 0, .3, .7, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, quad.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad.n);

   // draw fan------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, .8, 0, 0, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, fan.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, fan.buffer);
   var FSIZE = fan.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, fan.n);

   // draw strip------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, .8, 0, .5, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, strip.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, strip.buffer);
   var FSIZE = strip.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.LINE_STRIP, 0, strip.n);

   // draw lines------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, .8, 0, 0, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, lines.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, lines.buffer);
   var FSIZE = lines.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.LINES, 0, lines.n);

   // draw point------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, 1, 1, 1, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, point.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, point.buffer);
   var FSIZE = point.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.POINTS, 0, point.n);

   // draw tristrip------------------------------------------------
   gl.uniform4f(shaderVars.u_Color, .1, 0, .1, 1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, tristrip.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, tristrip.buffer);
   var FSIZE = tristrip.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, tristrip.n);
}

/**
 * initModels - initializes WebGL buffers for the the objects
 */
function initModels(gl, shaderVars, triangle, quad, fan, strip, lines, tristrip, point) {

   // set up the triangle-------------------------------------------
   triangle.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, triangle.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, triangle.vertices, gl.STATIC_DRAW);
   var FSIZE = triangle.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);


   // set up the quad------------------------------------------------
   quad.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, quad.vertices, gl.STATIC_DRAW);
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);
   quad.modelMatrix.setTranslate(.1, .1, 0);

   // set up the fan-------------------------------------------
   fan.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, fan.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, fan.vertices, gl.STATIC_DRAW);
   var FSIZE = fan.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

   // set up the strip-------------------------------------------
   strip.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, strip.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, strip.vertices, gl.STATIC_DRAW);
   var FSIZE = strip.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

   // set up the strip-------------------------------------------
   lines.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, lines.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, lines.vertices, gl.STATIC_DRAW);
   var FSIZE = lines.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

    // set up the point-------------------------------------------
   point.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, point.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, point.vertices, gl.STATIC_DRAW);
   var FSIZE = point.vertices.BYTES_PER_ELEMENT;
   console.log(FSIZE);
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

   // set up the tristrip-------------------------------------------
   tristrip.buffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, tristrip.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, tristrip.vertices, gl.STATIC_DRAW);
   var FSIZE = tristrip.vertices.BYTES_PER_ELEMENT;
   console.log(FSIZE);
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

   return true;
}

// var VSHADER_SOURCE = 
//   'attribute vec4 a_position;\n' +
//   'void main() {\n' +
//   '  gl_Position = a_position;\n' + 
//   '  gl_PointSize = 70.0;\n' +                    
//   '}\n';

// // Fragment shader program
// var FSHADER_SOURCE =
//   'void main() {\n' +
//   '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + 
//   '}\n';

// function main() {

//   var canvas = document.getElementById('webgl');

//   var gl = getWebGLContext(canvas);
//   if (!gl) {
//     console.log('Failed to get the rendering context for WebGL');
//     return;
//   }

//   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
//     console.log('Failed to intialize shaders.');
//     return;
//   }

//   var a_position = gl.getAttribLocation(gl.program, 'a_position');

//   gl.vertexAttrib3f(a_position, -0.8, 0.8, 0.0);
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);

//   gl.clear(gl.COLOR_BUFFER_BIT);

//   gl.drawArrays(gl.POINTS, 0, 1);
// }