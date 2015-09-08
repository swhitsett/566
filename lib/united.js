// ClickedPints.js (c) 2012 matsuda
// Vertex shader program
    var x = 0;
    var y = 0;
    var tick = 80;
    var rand1 = 0;
    var rand2 = 0;
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  ' gl_FragColor = u_FragColor;\n' +//'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var g_points = []; // The array for the position of a mouse press
function click(ev, gl, canvas, a_Position, u_FragColor) {

    if (ev.keyCode == '38')
        y += 0.02;
   
    else if (ev.keyCode == '40')
        y -= 0.02;
   
    else if (ev.keyCode == '37')
       x -= 0.02;
   
    else if (ev.keyCode == '39')
       x += 0.02;
   
  // var x = ev.clientX; // x coordinate of a mouse pointer
  // var y = ev.clientY; // y coordinate of a mouse pointer
  // console.log(x);
  // console.log(y);
  var rect = ev.target.getBoundingClientRect() ;

  // x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  // y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  // console.log(x);
  // console.log(y);
  // Store the coordinates to g_points array
  // console.log('hi');
  // for(var i = 0; i < len; i += 2) {
  //   console.log('helloo');
  //   //Math.round(num * 100) / 100
  //   console.log(Math.round(x * 100) / 100);
  //   console.log(Math.round(y * 100) / 100);
  //   console.log('----------------');
  //   console.log(g_points[i]);
  //   console.log(g_points[i+1]);

  //   if( g_points[i]  == (Math.round(x * 100) / 100) && (g_points[i+1] == Math.round(y * 100) / 100))
  //     alert("game over");
  // }

  if(tick >= 80){
    tick = 0;
    rand1 = Math.random()*0.9
    rand2 = Math.random()*0.9
    g_points.push(rand1);
    g_points.push(rand2);
  }

  g_points.push(x); g_points.push(y);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for(var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);
    if(g_points[i] == rand1 && g_points[i+1] == rand2)
      gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 0.0);
    else
      gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
    //---------------------------
    // console.log(Math.round(parseFloat(rand1) * 100) / 100);
    // console.log(Math.round(parseFloat(rand2) * 100) / 100);
    // console.log('----------------');
    // console.log(Math.round(parseFloat(g_points[i]) * 100) / 100);
    // console.log(Math.round(parseFloat(g_points[i+1]) * 100) / 100);

    // if( Math.round(parseFloat(rand1) * 100) / 100))
    //   alert("game over");
    //--------------------------
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
  tick += 1;
  // console.log(tick);
}

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

  // // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };
  document.onkeydown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor); };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


