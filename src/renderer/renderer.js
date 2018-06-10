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


let quality = window.devicePixelRatio
window.resize = (q) => {
  quality = q || window.devicePixelRatio
  onWindowResize()
}


const $canvas = document.getElementById("canvas")
const mouse = mousePosition($canvas)

const gl = $canvas.getContext('webgl')
gl.getExtension('OES_standard_derivatives')

onWindowResize()


// OpenGL bootstrap ///////////////////////////////////////////////////////////


const shader = glShader(gl,
  glslify('../shaders/shader.vert'),
  glslify('../shaders/shader.frag')
)

const shader2 = glShader(gl,
  glslify('../shaders/shader.vert'),
  glslify('../shaders/depth.frag')
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

const texture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1, //w
  1, //h
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  null
)

const frameBuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

const renderbuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

gl.bindTexture(gl.TEXTURE_2D, null)
gl.bindRenderbuffer(gl.RENDERBUFFER, null)
gl.bindFramebuffer(gl.FRAMEBUFFER, null)


// Keys and camera ////////////////////////////////////////////////////////////


let keys = {}
onkeydown = onkeyup = function(e) {
  keys[vkey[e.keyCode]] = e.type == 'keydown'
}


const camera = cameraControl({
  position: [0,0,3],
  keys: keys
})


// Bind events ////////////////////////////////////////////////////////////////


window.addEventListener('resize', onWindowResize)

ipcRenderer.on('change.shaders', (event, message) => {
  shader.update(message.vert, message.frag)
  shader2.update(message.vert, message.depth)
  console.info('shaders updated')
})


// Rendering loop /////////////////////////////////////////////////////////////


let iTime = 0.0
let fpsTime = 0.0
let fps = 0.0
let frameTime = Date.now()

render()

function render() {
 
  var elapsedTime = (Date.now() - frameTime)/1000.0
  var frameSpeed = 1.0
  iTime += frameSpeed*elapsedTime

  camera.update(elapsedTime)
  
  let data = distancePass()

  renderPass()

  let d = map(data[0]*data[0], 0, 255, 0.08, 1)
  d = clamp(d, 0, 1)
  // console.log(d)
  camera.dampen = d
  // console.log(camera.dampen)

  fps++;
  fpsTime += elapsedTime;
  if(fpsTime>=1.0){
    fpsTime -= 1.0;
    document.getElementById('fps').innerHTML = fps
    fps = 0;
  }


  frameTime = Date.now()

  // if (play) {
  window.requestAnimationFrame(render, $canvas)
  // }
 
}


// Render passes //////////////////////////////////////////////////////////////


function depthPass(data) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // Bind shader 
  shader2.bind()

  // Set attributes 
  shader2.attributes.position.pointer()

  // Set uniforms
  shader2.uniforms.iTime = iTime
  shader2.uniforms.iResolution = [$canvas.width/10, $canvas.height/10]
  shader2.uniforms.iCamPos = camera.position()
  shader2.uniforms.iCamDir = camera.view()

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  var data = new Uint8Array(($canvas.width/10) * ($canvas.height/10) * 4)
  gl.readPixels(0, 0, $canvas.width/10, $canvas.height/10, gl.RGBA, gl.UNSIGNED_BYTE, data)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return data
}


function distancePass(data) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // Bind shader 
  shader2.bind()

  // Set attributes 
  shader2.attributes.position.pointer()

  // Set uniforms
  shader2.uniforms.iTime = iTime
  shader2.uniforms.iResolution = [1, 1]
  shader2.uniforms.iCamPos = camera.position()
  shader2.uniforms.iCamDir = camera.view()

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  var data = new Uint8Array(1 * 1 * 4)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return data
}


function renderPass() {
  // Bind shader 
  shader.bind()

  // Set attributes 
  shader.attributes.position.pointer()

  // gl.activeTexture(gl.TEXTURE0);
  // gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set uniforms
  shader.uniforms.iTime = iTime
  shader.uniforms.iResolution = [$canvas.width, $canvas.height]
  shader.uniforms.iCamPos = camera.position()
  shader.uniforms.iCamDir = camera.view()
  // shader.uniforms.iSample = 0

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}


// Events /////////////////////////////////////////////////////////////////////


function onWindowResize( event ) {
  var realToCSSPixels = 1//window.devicePixelRatio || 1


  var displayWidth  = Math.floor($canvas.clientWidth  * realToCSSPixels)
  var displayHeight = Math.floor($canvas.clientHeight * realToCSSPixels)


  // if ($canvas.width  !== displayWidth ||
  //     $canvas.height !== displayHeight) {

  //   $canvas.width  = displayWidth
  //   $canvas.height = displayHeight
  // }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

}

function map(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin)
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
