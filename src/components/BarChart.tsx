import { useEffect, useRef } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { leerToken } from '../utils/colors'

// Solo lo que usa el gráfico de barras: Chart.js no incluye nada que no se registre
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export interface SerieBarras {
  label: string
  data: number[]
  color: string
}

interface BarChartProps {
  labels: string[]
  series: SerieBarras[]
  formatValue: (valor: number) => string // Tooltip
  formatTick: (valor: number) => string // Eje Y
  ariaLabel: string
}

const RADIO_BARRA = 4 // Esquinas redondeadas solo en el extremo de los datos
const GROSOR_MAXIMO = 28
const TICKS_Y = 4

// Barras agrupadas (una serie por color, un solo eje Y). La leyenda va en HTML, fuera del canvas.
function BarChart({ labels, series, formatValue, formatTick, ariaLabel }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const texto = leerToken('--color-subtle')
    const grilla = leerToken('--color-line')
    const fondoTooltip = leerToken('--color-ink')

    const grafico = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: series.map((serie) => ({
          label: serie.label,
          data: serie.data,
          backgroundColor: serie.color,
          hoverBackgroundColor: serie.color,
          borderRadius: RADIO_BARRA,
          borderSkipped: 'bottom',
          maxBarThickness: GROSOR_MAXIMO,
          categoryPercentage: 0.6,
          barPercentage: 0.9, // Deja un hueco entre las barras de un mismo grupo
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false }, // Hover en toda la columna, no solo sobre la barra
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: fondoTooltip,
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: { label: (contexto) => ` ${contexto.dataset.label}: ${formatValue(contexto.parsed.y ?? 0)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: texto, font: { size: 12 } } },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: grilla },
            ticks: { color: texto, font: { size: 12 }, maxTicksLimit: TICKS_Y, callback: (valor) => formatTick(Number(valor)) },
          },
        },
      },
    })

    return () => grafico.destroy()
  }, [labels, series, formatValue, formatTick])

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
    </div>
  )
}

export default BarChart
