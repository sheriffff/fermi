export const difficulties = [
  { level: 'Fácil', color: 'emerald' },
  { level: 'Medio', color: 'blue' },
  { level: 'Difícil', color: 'orange' },
  { level: 'Muy difícil', color: 'red' },
  { level: 'Megadesafío', color: 'violet' },
]

export const themes = [
  {
    emoji: '🏠',
    label: 'En casa',
    questions: [
      '¿Cuántos libros caben en tu habitación?',
      '¿Cuántos espaguetis hay en un paquete?',
      '¿Cuántos pelos tienes en la cabeza?',
      '¿Cuántos segundos llevas vivo?',
      '¿Cuántos latidos le quedan a tu corazón si vives hasta los 90?',
    ],
  },
  {
    emoji: '📺',
    label: 'Viendo la tele',
    questions: [
      '¿Cuántas palabras dice el presentador por minuto?',
      '¿Cuántos anuncios has visto en lo que va de año?',
      '¿Cuántos fotogramas tiene esta película?',
      '¿Cuántos píxeles has visto en toda tu vida?',
      '¿Cuántos bits de información has consumido en tu vida?',
    ],
  },
  {
    emoji: '🌳',
    label: 'Por la calle',
    questions: [
      '¿Cuántos pasos hay de aquí a esa esquina?',
      '¿Cuántos coches pasan por aquí en un día?',
      '¿Cuántas baldosas hay en esta acera?',
      '¿Cuántos ladrillos tiene ese edificio?',
      '¿Cuántos granos de arena hay en todas las playas del mundo?',
    ],
  },
  {
    emoji: '🛒',
    label: 'Supermercado',
    questions: [
      '¿Cuántas latas de tomate hay en ese estante?',
      '¿Cuántos granos de arroz hay en ese paquete de 1 kg?',
      '¿Cuánto pesa toda la comida que hay ahora mismo en este supermercado?',
      '¿Cuántas calorías hay en todo el supermercado?',
      '¿Cuántos átomos hay en el pan de molde que acabas de comprar?',
    ],
  },
  {
    emoji: '🚗',
    label: 'En el coche',
    questions: [
      '¿Cuántos árboles hemos pasado en los últimos 5 minutos?',
      '¿Cuántos kilómetros recorre este coche al año?',
      '¿Cuántos litros de gasolina has gastado en tu vida?',
      '¿Cuántos pasos necesitarías para llegar al Sol caminando?',
      '¿Cuántas vueltas a la Tierra has dado en coche a lo largo de tu vida?',
    ],
  },
]

export const colors = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    cell: 'bg-emerald-50/60 hover:bg-emerald-50',
    border: 'border-emerald-100',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    cell: 'bg-blue-50/60 hover:bg-blue-50',
    border: 'border-blue-100',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700',
    cell: 'bg-orange-50/60 hover:bg-orange-50',
    border: 'border-orange-100',
  },
  red: {
    badge: 'bg-red-100 text-red-700',
    cell: 'bg-red-50/60 hover:bg-red-50',
    border: 'border-red-100',
  },
  violet: {
    badge: 'bg-violet-100 text-violet-700',
    cell: 'bg-violet-50/60 hover:bg-violet-50',
    border: 'border-violet-100',
  },
}
