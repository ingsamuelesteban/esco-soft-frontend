<template>
  <div v-if="readyUniforms && readyUniforms.length > 0" class="space-y-4">
    <div
      v-for="order in readyUniforms"
      :key="order.invoice_number"
      class="glass-card relative overflow-hidden rounded-2xl border border-emerald-500/30 dark:border-emerald-500/40 border-l-8 border-l-emerald-500 bg-gradient-to-br from-emerald-500/10 via-purple-500/5 to-transparent p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
    >
      <!-- Glow Accent Background -->
      <div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/20"></div>

      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        
        <!-- Icon & Main Message -->
        <div class="flex items-start gap-4 sm:gap-5">
          <div class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <!-- Subtle pulsing alert ring -->
            <span class="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-emerald-400 opacity-20"></span>
            <!-- Shopping Bag / Gift Icon -->
            <svg class="h-7 w-7 animate-bounce transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>

          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-0.5 text-xs font-bold tracking-wide text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                DISPONIBLE PARA RETIRO
              </span>
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400">|</span>
              <span class="font-mono text-sm font-black text-emerald-700 dark:text-emerald-400">
                #{{ order.invoice_number }}
              </span>
            </div>

            <h3 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
              ¡Tu uniforme está listo para retirar en administración!
            </h3>

            <!-- Payment Status Guidance -->
            <div class="mt-2 flex items-center gap-2 text-sm">
              <span class="text-gray-600 dark:text-gray-300 font-medium">Estado de pago:</span>
              <span
                v-if="order.payment_status === 'paid'"
                class="inline-flex items-center gap-1 font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-2.5 py-0.5 rounded-md border border-green-200 dark:border-green-800/60"
              >
                ✓ PAGADO (Retiro inmediato)
              </span>
              <span
                v-else-if="order.payment_status === 'partial'"
                class="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60"
              >
                ⚠️ PAGO PARCIAL (Abonar saldo pendiente al retirar)
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60"
              >
                ⚠️ PAGO PENDIENTE (Abonar en caja al momento del retiro)
              </span>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex shrink-0 flex-col sm:flex-row gap-3 md:flex-col lg:flex-row">
          <NuxtLink
            to="/student/tienda"
            class="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.98]"
          >
            <svg class="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span>Ver Orden y Comprobante</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Item Breakdown List -->
      <div class="mt-5 border-t border-emerald-500/20 dark:border-emerald-500/30 pt-4">
        <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
          <span>Artículos listos en tu paquete de entrega:</span>
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="flex items-center justify-between rounded-xl bg-white/60 dark:bg-gray-900/60 p-3 shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/40"
          >
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">
              {{ item.article_name }}
            </span>
            <span class="shrink-0 inline-flex items-center justify-center font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              x{{ item.quantity_ready }} lista{{ item.quantity_ready > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  readyUniforms?: Array<{
    invoice_number: string;
    payment_status: string;
    items: Array<{
      article_name: string;
      quantity_ready: number;
    }>;
  }>;
}>();
</script>
