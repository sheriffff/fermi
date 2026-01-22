/**
 * Banco de preguntas para los tests de Fermi
 * Estos son ejemplos - reemplazar con las preguntas reales del TFM
 *
 * Estructura por modelo (A, B, C, D)
 * Cada pregunta tiene: numero, texto, unidad, valorReferencia (opcional)
 */

export const preguntasPorModelo = {
  A: [
    {
      numero: 1,
      texto: '¿Cuántos granos de arena hay en una playa de 100 metros de largo?',
      unidad: 'granos',
      valorReferencia: 1e15
    },
    {
      numero: 2,
      texto: '¿Cuántos litros de agua consume una persona al año?',
      unidad: 'litros',
      valorReferencia: 50000
    },
    {
      numero: 3,
      texto: '¿Cuántos árboles hay en España?',
      unidad: 'árboles',
      valorReferencia: 7e9
    },
    {
      numero: 4,
      texto: '¿Cuántos kilómetros recorre la Tierra alrededor del Sol en un año?',
      unidad: 'km',
      valorReferencia: 9.4e8
    },
    {
      numero: 5,
      texto: '¿Cuántas pizzas se comen en España en un día?',
      unidad: 'pizzas',
      valorReferencia: 4e6
    },
    {
      numero: 6,
      texto: '¿Cuántos latidos da el corazón humano en 70 años?',
      unidad: 'latidos',
      valorReferencia: 2.5e9
    },
    {
      numero: 7,
      texto: '¿Cuántos profesores de secundaria hay en España?',
      unidad: 'profesores',
      valorReferencia: 250000
    },
    {
      numero: 8,
      texto: '¿Cuántas palabras pronuncia una persona promedio al día?',
      unidad: 'palabras',
      valorReferencia: 16000
    }
  ],

  B: [
    {
      numero: 1,
      texto: '¿Cuántos coches hay actualmente en Madrid?',
      unidad: 'coches',
      valorReferencia: 1.8e6
    },
    {
      numero: 2,
      texto: '¿Cuántos pelos tiene una persona en la cabeza?',
      unidad: 'pelos',
      valorReferencia: 100000
    },
    {
      numero: 3,
      texto: '¿Cuántos vuelos comerciales hay al día en el mundo?',
      unidad: 'vuelos',
      valorReferencia: 100000
    },
    {
      numero: 4,
      texto: '¿Cuántos metros cuadrados tiene el campus de una universidad media?',
      unidad: 'm²',
      valorReferencia: 200000
    },
    {
      numero: 5,
      texto: '¿Cuántas botellas de agua de 1L caben en una piscina olímpica?',
      unidad: 'botellas',
      valorReferencia: 2.5e6
    },
    {
      numero: 6,
      texto: '¿Cuántos médicos hay trabajando en España?',
      unidad: 'médicos',
      valorReferencia: 280000
    },
    {
      numero: 7,
      texto: '¿Cuántos SMS se enviaban al día en España en 2010?',
      unidad: 'SMS',
      valorReferencia: 4e7
    },
    {
      numero: 8,
      texto: '¿Cuántos kilómetros de carreteras hay en España?',
      unidad: 'km',
      valorReferencia: 165000
    }
  ],

  C: [
    {
      numero: 1,
      texto: '¿Cuántas estrellas puede ver una persona a simple vista en una noche clara?',
      unidad: 'estrellas',
      valorReferencia: 3000
    },
    {
      numero: 2,
      texto: '¿Cuántos estudiantes universitarios hay en España?',
      unidad: 'estudiantes',
      valorReferencia: 1.6e6
    },
    {
      numero: 3,
      texto: '¿Cuántas toneladas de basura genera una ciudad de 1 millón de habitantes al año?',
      unidad: 'toneladas',
      valorReferencia: 500000
    },
    {
      numero: 4,
      texto: '¿Cuántos restaurantes hay en Barcelona?',
      unidad: 'restaurantes',
      valorReferencia: 9000
    },
    {
      numero: 5,
      texto: '¿Cuántos libros diferentes se han publicado en la historia de la humanidad?',
      unidad: 'libros',
      valorReferencia: 1.3e8
    },
    {
      numero: 6,
      texto: '¿Cuántas veces late el corazón de un colibrí en un minuto?',
      unidad: 'latidos',
      valorReferencia: 1200
    },
    {
      numero: 7,
      texto: '¿Cuántos teléfonos móviles se venden al año en el mundo?',
      unidad: 'móviles',
      valorReferencia: 1.4e9
    },
    {
      numero: 8,
      texto: '¿Cuántos caracteres tiene un libro de 300 páginas?',
      unidad: 'caracteres',
      valorReferencia: 500000
    }
  ],

  D: [
    {
      numero: 1,
      texto: '¿Cuántos litros de petróleo consume el mundo en un día?',
      unidad: 'litros',
      valorReferencia: 1.5e10
    },
    {
      numero: 2,
      texto: '¿Cuántas hormigas hay en una colonia típica?',
      unidad: 'hormigas',
      valorReferencia: 500000
    },
    {
      numero: 3,
      texto: '¿Cuántos fotogramas tiene una película de 2 horas?',
      unidad: 'fotogramas',
      valorReferencia: 172800
    },
    {
      numero: 4,
      texto: '¿Cuántos correos electrónicos se envían al día en el mundo?',
      unidad: 'emails',
      valorReferencia: 3e11
    },
    {
      numero: 5,
      texto: '¿Cuántas neuronas tiene el cerebro humano?',
      unidad: 'neuronas',
      valorReferencia: 8.6e10
    },
    {
      numero: 6,
      texto: '¿Cuántos kilogramos de comida consume una persona al año?',
      unidad: 'kg',
      valorReferencia: 700
    },
    {
      numero: 7,
      texto: '¿Cuántos ascensores hay en Nueva York?',
      unidad: 'ascensores',
      valorReferencia: 70000
    },
    {
      numero: 8,
      texto: '¿Cuántos segundos tiene una vida de 80 años?',
      unidad: 'segundos',
      valorReferencia: 2.5e9
    }
  ]
}

/**
 * Obtiene las preguntas de un modelo específico
 */
export function getPreguntas(modelo) {
  return preguntasPorModelo[modelo] || preguntasPorModelo.A
}

/**
 * Obtiene un modelo aleatorio
 */
export function getRandomModelo() {
  const modelos = ['A', 'B', 'C', 'D']
  return modelos[Math.floor(Math.random() * modelos.length)]
}

/**
 * Obtiene todas las preguntas de todos los modelos
 */
export function getAllPreguntas() {
  return preguntasPorModelo
}
