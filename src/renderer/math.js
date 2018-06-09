const quat = require('gl-quat')

module.exports = {
  quatRotate: function(q, v) {
    quat.rotateX(q, q, this.radians(v[0]))
    quat.rotateY(q, q, this.radians(v[1]))
    quat.rotateZ(q, q, this.radians(v[2]))
    return q
  },
  radians: function(deg) {
    return deg * Math.PI / 180
  }
}
