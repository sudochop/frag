vec3 march(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < steps; i++) {
        vec3 dist = scene(eye + depth * marchingDirection);
        if (dist.x < epsilon) {
            return vec3(depth, dist.y, dist.z);
        }
        depth += dist.x;
        if (depth >= end) {
            return vec3(end, -1., 0.);
        }
    }
    return vec3(end, -1., 0.);
}

#pragma glslify: export(march)
