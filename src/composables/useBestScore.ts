import { readonly, ref } from 'vue'

const STORAGE_KEY = 'the3dgame:best-score'

function load(): number {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    // Хранилище недоступно (приватный режим, запрет) — рекорда нет
    return 0
  }
}

function save(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // Не удалось сохранить — рекорд проживёт до перезагрузки страницы
  }
}

// Лучший результат: читается из localStorage и обновляется только через submit
export function useBestScore() {
  const best = ref(load())

  // Возвращает true, если счёт побил рекорд
  function submit(score: number): boolean {
    if (score <= best.value) return false

    best.value = score
    save(score)
    return true
  }

  return { best: readonly(best), submit }
}
