// Размеры плит
export const BLOCK_SIZE = 3
export const BLOCK_HEIGHT = 0.5

// Камера: смещение от точки, на которую она смотрит
export const CAMERA_OFFSET = { x: 6, y: 5, z: 6 } as const

// Скорость, с которой камера догоняет вершину башни (больше — быстрее)
export const CAMERA_DAMPING = 4

// Движущаяся плита: на сколько отъезжает от центра башни
export const MOVE_RANGE = 4.5

// Скорость плиты (единиц/сек): стартовая, предельная и темп роста
// (за MOVE_SPEED_RAMP блоков скорость проходит ~63% пути от стартовой к предельной)
export const MOVE_SPEED_START = 4
export const MOVE_SPEED_MAX = 9
export const MOVE_SPEED_RAMP = 25

// Максимальный шаг времени за кадр (защита от рывка после паузы вкладки)
export const MAX_DELTA = 0.1

// Если промах меньше этого значения — ставим плиту ровно, без отрезания
export const PERFECT_TOLERANCE = 0.1

// Обрезки меньше этого размера не создаём (погрешность дробных чисел)
export const MIN_PIECE = 0.01

// Падающие обрезки
export const GRAVITY = 20
export const DEBRIS_PUSH = 1.5
export const DEBRIS_SPIN = 2

// На сколько ниже камеры обрезок удаляется со сцены
export const DEBRIS_CLEANUP_DEPTH = 20

// Цвета: сдвиг оттенка на каждую плиту (доля цветового круга)
export const HUE_STEP = 0.025

// Скорость, с которой фон перетекает к новому цвету
export const BACKGROUND_DAMPING = 2

// Туман: с какого расстояния от камеры начинается и где объекты полностью растворяются
export const FOG_NEAR = 12
export const FOG_FAR = 30

// Идеальное попадание: сколько подряд нужно для роста плиты и на сколько она растёт
export const PERFECT_GROW_STREAK = 3
export const PERFECT_GROW_AMOUNT = 0.2

// Вспышка при идеальном попадании: длительность (сек) и во сколько раз она расширяется
export const FLASH_DURATION = 0.5
export const FLASH_GROWTH = 1.4
