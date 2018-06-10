const mat4 = require('gl-mat4')
const vec3 = require('gl-vec3')
const quat = require('gl-quat')
const math = require('./math')
const C = require('./consts')

function CameraControl(opts) {
  if (!(this instanceof CameraControl)) return new CameraControl(opts);
  
  opts = opts || {}
  
  this.keys = opts.keys || {}
  this.movementSpeed = opts.movementSpeed || 100
  this.rotationSpeed = opts.rotationSpeed || 1000
  this.movementVel = vec3.create()
  this.rotationVel = vec3.create()
  this.worldMatrix = mat4.create()
  this.viewMatrix = mat4.create()
  this.displayMatrix = mat4.create()
  this.dampen = 0

  mat4.lookAt(
    this.viewMatrix,
    opts.position || [0,0,1],
    opts.lookAt || [0,0,0],
    opts.up || [0,1,0]
  )
}

module.exports = CameraControl

CameraControl.prototype.update = function(dt) {

  let accS = (this.movementSpeed / 1000) * this.dampen * dt
  let accR = (this.rotationSpeed / 1000) * dt

  let tM = vec3.create()
  let rM = vec3.create()

  if (this.keys['W'])        vec3.add(tM, tM, C.Zp);
  if (this.keys['S'])        vec3.add(tM, tM, C.Zi);
  if (this.keys['A'])        vec3.add(tM, tM, C.Xp);
  if (this.keys['D'])        vec3.add(tM, tM, C.Xi);
  if (this.keys['<shift>'])  vec3.add(tM, tM, C.Yp);
  if (this.keys['<space>'])  vec3.add(tM, tM, C.Yi);
  if (this.keys['<up>'])     vec3.add(rM, rM, C.Xp);
  if (this.keys['<down>'])   vec3.add(rM, rM, C.Xi);
  if (this.keys['<left>'])   vec3.add(rM, rM, C.Yp);
  if (this.keys['<right>'])  vec3.add(rM, rM, C.Yi);
  if (this.keys['Q'])        vec3.add(rM, rM, C.Zp);
  if (this.keys['E'])        vec3.add(rM, rM, C.Zi);
  
  vec3.scale(tM, tM, accS)
  vec3.scale(rM, rM, accR)
  vec3.add(this.movementVel, this.movementVel, tM)
  vec3.add(this.rotationVel, this.rotationVel, rM)

  vec3.lerp(this.movementVel, this.movementVel, [0, 0, 0], dt)
  vec3.lerp(this.rotationVel, this.rotationVel, [0, 0, 0], dt)

  mat4.translate(this.worldMatrix, this.worldMatrix, this.movementVel)

  let qM = quat.create()
  let rotation = mat4.create()

  mat4.fromQuat(rotation, math.quatRotate(qM, this.rotationVel))
  mat4.multiply(this.worldMatrix, this.worldMatrix, rotation)
  mat4.multiply(this.displayMatrix, this.viewMatrix, this.worldMatrix)
}

CameraControl.prototype.view = function() {
  return this.displayMatrix
}

CameraControl.prototype.position = function() {
  return [-this.displayMatrix[12],-this.displayMatrix[13],-this.displayMatrix[14]]
}
