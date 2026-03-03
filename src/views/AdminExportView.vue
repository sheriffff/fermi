<script setup>
import { exportTable } from '@/lib/supabase'

async function exportCSV(tabla) {
  try {
    const data = await exportTable(tabla)

    if (!data || data.length === 0) {
      alert(`La tabla "${tabla}" está vacía`)
      return
    }

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          let val = row[h]
          if (val == null) return ''
          if (typeof val === 'object') val = JSON.stringify(val)
          val = String(val)
          if (/^[=+\-@\t\r]/.test(val)) val = `'${val}`
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`
          }
          return val
        }).join(',')
      )
    ]

    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tabla}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Error exportando:', e)
    alert('Error al exportar. Revisa la consola.')
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold text-neutral-800">Exportar CSV</h2>
      <p class="text-neutral-500 text-sm">Descarga tablas y vistas en formato CSV</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
      <div class="card">
        <h3 class="font-semibold text-neutral-700 mb-3">Tablas</h3>
        <div class="space-y-1">
          <button @click="exportCSV('users_online')" class="btn-ghost w-full text-sm !justify-start">📥 users_online</button>
          <button @click="exportCSV('responses_online')" class="btn-ghost w-full text-sm !justify-start">📥 responses_online</button>
          <button @click="exportCSV('users_paper')" class="btn-ghost w-full text-sm !justify-start">📥 users_paper</button>
          <button @click="exportCSV('responses_paper')" class="btn-ghost w-full text-sm !justify-start">📥 responses_paper</button>
          <button @click="exportCSV('logs_download')" class="btn-ghost w-full text-sm !justify-start">📥 logs_download</button>
          <button @click="exportCSV('responses_play_random')" class="btn-ghost w-full text-sm !justify-start">📥 responses_play_random</button>
          <button @click="exportCSV('feedback')" class="btn-ghost w-full text-sm !justify-start">📥 feedback</button>
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-neutral-700 mb-3">Vistas joineadas</h3>
        <div class="space-y-1">
          <button @click="exportCSV('view_responses_online')" class="btn-ghost w-full text-sm !justify-start">📥 view_responses_online</button>
          <button @click="exportCSV('view_responses_paper')" class="btn-ghost w-full text-sm !justify-start">📥 view_responses_paper</button>
        </div>
      </div>
    </div>
  </div>
</template>
