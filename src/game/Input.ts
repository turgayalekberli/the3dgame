// Клавиши, которые ставят плиту (физические — не зависят от раскладки)
const ACTION_KEYS = new Set(['Space', 'Enter'])

// Элементы, которые сами обрабатывают пробел/Enter — их не перехватываем
const INTERACTIVE = 'button, a, input, textarea, select'

// Все способы управления сводятся к одному действию
export class Input {
  private readonly target: HTMLElement
  private readonly onAction: () => void

  constructor(target: HTMLElement, onAction: () => void) {
    this.target = target
    this.onAction = onAction

    target.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('keydown', this.onKeyDown)
  }

  // Только основная кнопка мыши и первое касание
  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !event.isPrimary) return
    this.onAction()
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    // Удержание клавиши шлёт повторы — одно нажатие = одно действие
    if (!ACTION_KEYS.has(event.code) || event.repeat) return
    if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return

    event.preventDefault()
    this.onAction()
  }

  dispose(): void {
    this.target.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('keydown', this.onKeyDown)
  }
}
