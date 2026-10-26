// Disegnino dell'elemento di un segno: fuoco, terra, aria o acqua
export default function IconaElemento({ elemento }) {
  const comune = { viewBox: '0 0 24 24', width: '100%', height: '100%', 'aria-hidden': true }
  if (elemento === 'fuoco') return <svg {...comune}><path fill="currentColor" d="M12.5 2s.8 3.5-1.5 6c-1.7 1.9-4 3.7-4 7a6 6 0 0 0 12 0c0-2.6-1.3-4.3-2.4-5.6-.2 1.3-.9 2.1-1.8 2.5.6-3.6-.4-7.2-2.3-9.9z" /></svg>
  if (elemento === 'terra') return <svg {...comune}><path fill="currentColor" d="M1.5 20.5 8.5 7l4.2 7.6 2.8-4.1 7 10z" /></svg>
  if (elemento === 'aria') return <svg {...comune} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8.5h10.5a2.7 2.7 0 1 0-2.7-2.7" /><path d="M3 12.5h14.5a2.7 2.7 0 1 1-2.7 2.7" /><path d="M3 16.5h7" /></svg>
  return <svg {...comune}><path fill="currentColor" d="M12 2.5s6.2 6.2 6.2 11A6.2 6.2 0 0 1 5.8 13.5c0-4.8 6.2-11 6.2-11z" /></svg>
}
