const deg = (value: number): number => (value * Math.PI) / 180

// Сетка: размер клетки в мировых единицах
export const CELL_SIZE = 2

// Экономика и волны
export const START_CREDITS = 150
export const START_LIVES = 20
export const TOTAL_WAVES = 10
// Бонус за волну: база + прибавка за номер волны
export const WAVE_BONUS_BASE = 20
export const WAVE_BONUS_PER_WAVE = 5

// Максимальный шаг времени за кадр (защита от рывка после паузы вкладки)
export const MAX_DELTA = 0.1

// Камера: угол обзора и расстояние до центра карты (стартовое и пределы зума)
export const CAMERA_FOV = 35
export const CAMERA_DISTANCE = 42
export const CAMERA_MIN_DISTANCE = 18
export const CAMERA_MAX_DISTANCE = 60
// Наклон от вертикали: стартовый и пределы (не даём уйти под пол или в вид сверху)
export const CAMERA_POLAR = deg(50)
export const CAMERA_MIN_POLAR = deg(35)
export const CAMERA_MAX_POLAR = deg(65)
// Поворот вокруг вертикали: стартовый (0 — смотрим с «юга» карты) и допустимое отклонение
export const CAMERA_AZIMUTH = 0
export const CAMERA_AZIMUTH_RANGE = deg(45)
// Инерция OrbitControls (меньше — плавнее)
export const CAMERA_DAMPING = 0.08

// Bloom: сила, радиус размытия и порог яркости, с которого пиксель начинает светиться
export const BLOOM_STRENGTH = 0.9
export const BLOOM_RADIUS = 0.4
export const BLOOM_THRESHOLD = 0.7
// Сглаживание кадра внутри постобработки (renderer-овский antialias там не работает)
export const MSAA_SAMPLES = 4
export const TONE_MAPPING_EXPOSURE = 1

// Свет
export const AMBIENT_INTENSITY = 0.6
export const SUN_INTENSITY = 1.5
export const SUN_POSITION = { x: -10, y: 25, z: 12 } as const
export const SHADOW_MAP_SIZE = 2048
// Половина стороны области теней — с запасом покрывает карту
export const SHADOW_EXTENT = 18

// Туман: дальний край карты мягко уходит в фон
export const FOG_NEAR = 45
export const FOG_FAR = 100

// Арена
export const FLOOR_THICKNESS = 0.5
// Поля пола вокруг сетки (в клетках)
export const ARENA_MARGIN = 1
// Зазор между плитками (доля клетки) — в нём видна светящаяся сетка
export const TILE_GAP = 0.1
export const TILE_HEIGHT = 0.2
export const BLOCKED_HEIGHT = 0.9
// Светящаяся осевая линия дороги
export const PATH_LINE_WIDTH = 0.12
export const PATH_LINE_HEIGHT = 0.04

// Портал спавна
export const PORTAL_RADIUS = 0.7
export const PORTAL_TUBE = 0.08

// База
export const BASE_RADIUS = 0.9
export const BASE_HEIGHT = 0.4
export const BASE_CORE_SIZE = 0.4
export const BASE_CORE_Y = 1.3
export const BASE_SPIN_SPEED = 1.2
export const BASE_LIGHT_INTENSITY = 15
export const BASE_LIGHT_DISTANCE = 8

// Цвета
export const COLORS = {
  background: 0x05070d,
  floor: 0x070b16,
  tile: 0x151c30,
  blocked: 0x0d1222,
  baseBody: 0x1a2238,
  ambient: 0x6080c0,
  grid: 0x1d6fff,
  path: 0x3fd0ff,
  spawn: 0xff3fa4,
  base: 0x2affd5,
} as const

// Яркость неона: emissiveIntensity больше 1 выводит цвет за порог bloom
export const NEON_INTENSITY = 3
// Яркость линий сетки (множитель цвета)
export const GRID_INTENSITY = 4
