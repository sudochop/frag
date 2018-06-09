const { ipcRenderer } = window.require('electron');

const _             = require('lodash')
const glslify       = require('glslify')
const glShader      = require('gl-shader')
const extract       = require('gl-shader-extract')
const reflect       = require('glsl-extract-reflect')
const mat4          = require('gl-mat4')
const vec3          = require('gl-vec3')
const quat          = require('gl-quat')
const vkey          = require('vkey')
const mousePosition = require('mouse-position')
const cameraControl = require('./camera-control')


const $canvas = document.getElementById("canvas")
const mouse = mousePosition($canvas)

const gl = $canvas.getContext('webgl')
gl.getExtension('OES_standard_derivatives')


// OpenGL bootstrap ///////////////////////////////////////////////////////////


const shader = glShader(gl,
  glslify('../shaders/shader.vert'),
  glslify('../shaders/shader.frag')
)


const buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1.0, -1.0,
   1.0, -1.0,
  -1.0,  1.0,
  -1.0,  1.0,
   1.0, -1.0,
   1.0,  1.0]), gl.STATIC_DRAW)


// Keys and camera ////////////////////////////////////////////////////////////


let keys = {}
onkeydown = onkeyup = function(e) {
  keys[vkey[e.keyCode]] = e.type == 'keydown'
}


const camera = cameraControl({
  position: [0,0,10],
  keys: keys
})


// Bind events ////////////////////////////////////////////////////////////////


onWindowResize()
window.addEventListener('resize', onWindowResize)

ipcRenderer.on('change.shaders', (event, message) => {
  shader.update(message.vert, message.frag)
  console.info('shaders updated')
})


// Rendering loop /////////////////////////////////////////////////////////////


let iTime = 0.0
let fpsTime = 0.0
let fps = 0.0
let frameTime = Date.now()
var t = 1

render()

function render() {
 
  var elapsedTime = (Date.now() - frameTime)/1000.0
  var frameSpeed = 1.0
  iTime += frameSpeed*elapsedTime

  camera.update(elapsedTime)
  
  // Bind shader 
  shader.bind()

  // Set attributes 
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  shader.attributes.position.pointer()

  // Set uniforms
  // shader.uniforms.t += 0.01
  shader.uniforms.iTime = iTime
  shader.uniforms.iResolution = [$canvas.width, $canvas.height]
  shader.uniforms.iCamPos = camera.position()
  shader.uniforms.iCamDir = camera.view()

  gl.drawArrays(gl.TRIANGLES, 0, 6)

  fps++;
  fpsTime += elapsedTime;
  if(fpsTime>=1.0){
    fpsTime -= 1.0;
    // document.getElementById('fps').innerHTML = fps
    fps = 0;
  }


  frameTime = Date.now()

  // if (play) {
  window.requestAnimationFrame(render, $canvas)
  // }
 
}


// Events /////////////////////////////////////////////////////////////////////


function onWindowResize( event ) {
  var realToCSSPixels = window.devicePixelRatio


  var displayWidth  = Math.floor($canvas.clientWidth  * realToCSSPixels)
  var displayHeight = Math.floor($canvas.clientHeight * realToCSSPixels)


  if ($canvas.width  !== displayWidth ||
      $canvas.height !== displayHeight) {

    $canvas.width  = displayWidth
    $canvas.height = displayHeight
  }

  gl.viewport(0, 0, $canvas.width, $canvas.height)

}

