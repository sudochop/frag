float march(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < steps; i++) {
        float dist = scene(eye + depth * marchingDirection);
        if (dist < epsilon) {
            return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}

#pragma glslify: export(march)
