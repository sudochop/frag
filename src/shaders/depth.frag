precision mediump float;

uniform float iTime;
uniform vec3 iCamPos;

#pragma glslify: scene = require('./scene', iTime = iTime)

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main() {
    vec3 dist = scene(iCamPos);
    gl_FragColor = vec4(map(dist.x, 0., 80., 0., 1.));
}
