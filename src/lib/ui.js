// Metallo della cornice: bronzo ai primi Ranghi, argento a metà, oro in cima
export const metallo = (rango) => (rango >= 9 ? 'oro' : rango >= 5 ? 'argento' : 'bronzo')
