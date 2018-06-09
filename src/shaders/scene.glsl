float sinusoidBumps(vec3 p, float s) {
    float bumps = sin(p.x*16.+iTime*0.57)*cos(p.y*16.+iTime*2.17)*sin(p.z*16.-iTime*1.31) + 0.5*sin(p.x*32.+iTime*0.07)*cos(p.y*32.+iTime*2.11)*sin(p.z*32.-iTime*1.23);
    return bumps * s;
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float scene(vec3 p) {
    float s1 = sphere(p, 1.) + sinusoidBumps(p, 0.03);
    float s2 = sphere(p + vec3(5.,0.,20.), 1.) + sinusoidBumps(p, 0.03);
    float s3 = sphere(p - vec3(5.,0.,20.), 1.);
    return min(s1, min(s2, s3));
}

#pragma glslify: export(scene)
