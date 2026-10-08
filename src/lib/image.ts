/** 업로드 이미지를 정사각 240px JPEG dataURL로 다운스케일 (localStorage 용량 절약) */
export function fileToAvatarDataUrl(file: File, size = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = size
        c.height = size
        const ctx = c.getContext('2d')!
        // JPEG엔 투명이 없다 — 깔지 않으면 투명 PNG의 빈 곳이 검정으로 저장된다
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, size, size)
        // center-crop cover
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(c.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
