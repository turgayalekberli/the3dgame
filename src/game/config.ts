// Размеры плит
export const BLOCK_SIZE = 3
export const BLOCK_HEIGHT = 0.5

// Камера: смещение от точки, на которую она смотрит
export const CAMERA_OFFSET = { x: 6, y: 5, z: 6 } as const

// Скорость, с которой камера догоняет вершину башни (больше — быстрее)
export const CAMERA_DAMPING = 4

// Движущаяся плита: на сколько отъезжает от центра башни и с какой скоростью (единиц/сек)
export const MOVE_RANGE = 4.5
export const MOVE_SPEED = 4

// Максимальный шаг времени за кадр (защита от рывка после паузы вкладки)
export const MAX_DELTA = 0.1
