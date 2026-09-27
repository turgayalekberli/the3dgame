const deg = (value: number): number => (value * Math.PI) / 180

// Сетка: размер клетки в мировых единицах
export const CELL_SIZE = 2

// Экономика и волны
export const START_CREDITS = 150
export const START_LIVES = 20
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
export const BLOOM_STRENGTH = 0.6
export const BLOOM_RADIUS = 0.25
export const BLOOM_THRESHOLD = 0.85
// Сглаживание кадра внутри постобработки (renderer-овский antialias там не работает)
export const MSAA_SAMPLES = 4
export const TONE_MAPPING_EXPOSURE = 1

// Свет
export const AMBIENT_INTENSITY = 0.9
export const SUN_INTENSITY = 2
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
// Зазор между плитками (доля клетки)
export const TILE_GAP = 0.1
export const TILE_HEIGHT = 0.2
export const BLOCKED_HEIGHT = 0.9
// Отступ светящейся рамки от края плитки
export const TILE_OUTLINE_INSET = 0.04
// Подсвеченное дно дороги: тонкая сплошная полоса по всем клеткам пути
export const PATH_FLOOR_HEIGHT = 0.02
export const PATH_FLOOR_INTENSITY = 0.25
// Светящаяся осевая линия дороги
export const PATH_LINE_WIDTH = 0.08
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
export const BASE_LIGHT_INTENSITY = 6
export const BASE_LIGHT_DISTANCE = 8

// Враги: скорость доворота на углах пути и покачивание корпуса
export const ENEMY_TURN_DAMPING = 10
export const ENEMY_BOB_AMPLITUDE = 0.08
export const ENEMY_BOB_SPEED = 4

// Полоска HP: размеры и рамка вокруг заливки
export const HEALTH_BAR_WIDTH = 0.9
export const HEALTH_BAR_HEIGHT = 0.12
export const HEALTH_BAR_PADDING = 0.02

// Башни: скорость холостого вращения головы (рад/сек)
export const TOWER_IDLE_SPIN = 0.4
// Доворот головы к цели и допуск прицеливания, с которым уже можно стрелять (рад)
export const TOWER_TURN_DAMPING = 12
export const TOWER_AIM_TOLERANCE = 0.15

// Снаряды: скорость (единиц/сек)
export const PULSE_PROJECTILE_SPEED = 24
export const ROCKET_PROJECTILE_SPEED = 9

// Вспышки: попадание трассера, взрыв ракеты (радиус = сплеш), гибель врага.
// Длительность — в секундах, яркость больше 1 — светится через bloom
export const HIT_FLASH_RADIUS = 0.25
export const HIT_FLASH_DURATION = 0.12
export const ROCKET_EXPLOSION_DURATION = 0.35
export const DEATH_FLASH_RADIUS = 0.8
export const DEATH_FLASH_DURATION = 0.35
export const FLASH_INTENSITY = 2

// Луч крио-башни: толщина, яркость и частота пульсации
export const BEAM_RADIUS = 0.04
export const BEAM_INTENSITY = 1.3
export const BEAM_PULSE_SPEED = 30

// Неон башен: целевая воспринимаемая яркость (чуть ниже порога bloom) —
// одинаковая для всех цветов, иначе жёлтый и голубой светятся сильнее оранжевого
export const TOWER_NEON_LUMINANCE = 0.7

// Подсветка клетки под курсором: толщина рамки и яркость (больше 1 — светится через bloom)
export const HIGHLIGHT_WIDTH = 0.08
export const HIGHLIGHT_INTENSITY = 2
// Кольцо радиуса башни: толщина линии и прозрачность заливки круга
export const RANGE_RING_WIDTH = 0.05
export const RANGE_FILL_OPACITY = 0.08

// Цвета
export const COLORS = {
  background: 0x05070d,
  floor: 0x070b16,
  tile: 0x1c2640,
  blocked: 0x2a3350,
  baseBody: 0x1a2238,
  ambient: 0x6080c0,
  grid: 0x1d6fff,
  path: 0x3fd0ff,
  pathFloor: 0x0a3a50,
  spawn: 0xff3fa4,
  base: 0x2affd5,
  enemyMetal: 0x2a2f45,
  drone: 0xff4fd8,
  runner: 0xff6a3d,
  tank: 0xa66bff,
  healthBack: 0x0a0d18,
  healthFill: 0x4dff88,
  towerMetal: 0x303a58,
  pulse: 0xffd166,
  rocket: 0xff8a3d,
  cryo: 0x7fe7ff,
  valid: 0x4dff88,
  invalid: 0xff4d6a,
} as const

// Яркость неона: emissiveIntensity больше 1 выводит цвет за порог bloom
export const NEON_INTENSITY = 1.8
// Яркость рамок плиток (множитель цвета)
export const GRID_INTENSITY = 1.5
