// Riduce una foto scelta dal giocatore (telefono o computer) a un quadrato piccolo, pronto da salvare nella scheda.
export function ridimensiona(file, lato = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const lMin = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = lato
      canvas.getContext('2d').drawImage(img, (img.width - lMin) / 2, (img.height - lMin) / 2, lMin, lMin, 0, 0, lato, lato)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('immagine non valida')) }
    img.src = url
  })
}
