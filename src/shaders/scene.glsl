#define MAT_S1 0.0
#define MAT_S2 1.0
#define MAT_S3 2.0

float sinusoidBumps(vec3 p, float s) {
    float bumps = sin(p.x*16.+iTime*0.57)*cos(p.y*16.+iTime*2.17)*sin(p.z*16.-iTime*1.31) + 0.5*sin(p.x*32.+iTime*0.07)*cos(p.y*32.+iTime*2.11)*sin(p.z*32.-iTime*1.23);
    return bumps * s;
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdPlane(vec3 p, vec4 n) {
  // n must be normalized
  return dot(p, n.xyz) + n.w;
}

vec3 scene(vec3 p) {
    float s1 = sphere(p, 1.) + sinusoidBumps(p, 0.03);

    vec3 res = vec3(s1, MAT_S1, 0.0);

    float s2 = sphere(p + vec3(5.,0.,20.), 1.) + sinusoidBumps(p, 0.03);

    if (s2 < res.x) res = vec3(s2, MAT_S2, 0.0);

    float s3 = sphere(p - vec3(5.,0.,20.), 1.);
    
    if (s3 < res.x) res = vec3(s3, MAT_S3, 0.0);

    return res;
}

#pragma glslify: export(scene)
