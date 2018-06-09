const vec3 = require('gl-vec3')

const consts = {
  Xp: vec3.create(),
  Yp: vec3.create(),
  Zp: vec3.create(),
  Xi: vec3.create(),
  Yi: vec3.create(),
  Zi: vec3.create(),
}

vec3.set(consts.Xp, 1, 0, 0)
vec3.set(consts.Yp, 0, 1, 0)
vec3.set(consts.Zp, 0, 0, 1)
vec3.set(consts.Xi, -1, 0, 0)
vec3.set(consts.Yi, 0, -1, 0)
vec3.set(consts.Zi, 0, 0, -1)

module.exports = consts
