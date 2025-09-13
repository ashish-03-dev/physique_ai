const exampleMeshData = {
  vertices: new Float32Array([
    // Simplified cube vertices for demo (replace with actual SMPL mesh data)
    -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1, // Bottom face
    -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1, // Top face
  ]),
  indices: new Uint16Array([
    0, 1, 2,  0, 2, 3, // Bottom
    4, 5, 6,  4, 6, 7, // Top
    0, 4, 5,  0, 5, 1, // Front
    1, 5, 6,  1, 6, 2, // Right
    2, 6, 7,  2, 7, 3, // Back
    3, 7, 4,  3, 4, 0, // Left
  ]),
};

export default exampleMeshData;