// Размеры плит
export const BLOCK_SIZE = 3
export const BLOCK_HEIGHT = 0.5

// Камера: смещение от точки, на которую она смотрит
export const CAMERA_OFFSET = { x: 6, y: 5, z: 6 } as const

// Скорость, с которой камера догоняет вершину башни (больше — быстрее)
export const CAMERA_DAMPING = 4
