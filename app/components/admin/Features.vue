<template>
  <section class="bg-base-200 py-16 md:py-32">
    <div class="mx-auto max-w-5xl px-6">
      <div class="mx-auto grid gap-2 sm:grid-cols-5">
        
        <!-- Card 1 -->
        <NuxtLink to="/admin/usuarios" class="block rounded-xl border bg-base-100 text-base-content shadow-sm group overflow-hidden sm:col-span-3 sm:rounded-none sm:rounded-tl-xl hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
          <div class="flex flex-col space-y-1.5 p-6">
            <div>
              <p class="font-medium text-lg">Gestionar Usuarios</p>
              <p class="text-base-content/70 mt-3 max-w-sm text-sm">Administra usuarios, roles y permisos del sistema.</p>
            </div>
          </div>
          <div class="relative h-fit pl-6 md:pl-12">
            <div class="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,var(--fallback-b1,oklch(var(--b1))))] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="bg-base-100 overflow-hidden rounded-tl-lg border-l border-t pl-2 pt-2 relative z-10">
              <img
                src="/img/images/USERS.png"
                class="shadow"
                alt="payments illustration"
                width="1207"
                height="929"
              />
            </div>
          </div>
        </NuxtLink>

        <!-- Card 2 -->
        <NuxtLink to="/admin/proyectos" class="block rounded-xl border bg-base-100 text-base-content shadow-sm group overflow-hidden sm:col-span-2 sm:rounded-none sm:rounded-tr-xl flex flex-col hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
          <p class="mx-auto my-6 max-w-md text-balance px-3 text-center text-lg font-semibold sm:text-2xl md:p-3">Gestionar Proyectos</p>
          <p class="text-base-content/70 mt-3 max-w-sm text-sm text-center px-4">Administra los proyectos, tareas, logos, etc.</p>
          <div class="p-6 pt-0 mt-auto h-fit">
            <div class="relative mb-6 sm:mb-0">
              <div class="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,var(--fallback-b1,oklch(var(--b1))))] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="aspect-76/59 overflow-hidden rounded-r-lg border relative z-10">
                <img
                  src="https://tailark.com/_next/image?url=%2Forigin-cal.png&w=3840&q=75"
                  class="shadow"
                  alt="calendar illustration"
                  width="1207"
                  height="929"
                />
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Card 3 -->
        <NuxtLink to="/admin/roles" class="block rounded-xl border bg-base-100 text-base-content shadow-sm group p-6 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
          <p class="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">Gestionar Roles</p>
          <div class="flex justify-center gap-6">
            <div class="bg-base-200/50 relative flex aspect-square size-16 items-center justify-center rounded-lg border p-3 shadow-md group-hover:bg-primary/10 transition-colors">
              <span class="font-bold text-lg text-base-content/80">R</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Card 4 -->
        <div class="rounded-xl border bg-base-100 text-base-content shadow-sm group relative sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
          <div class="flex flex-col space-y-1.5 p-6 md:p-12">
            <p class="font-medium text-lg">Otras Vistas</p>
            <p class="text-base-content/70 mt-2 max-w-sm text-sm">Accede a las vistas de los demas roles, aqui podras ver todas las vistas del sistema.</p>
          </div>
          <div class="p-6 pt-0 relative h-fit px-6 pb-6 md:px-12 md:pb-12">
            <div class="grid grid-cols-4 gap-2 md:grid-cols-6">
              <div class="rounded-lg aspect-square border border-dashed border-base-300"></div>
              <div class="rounded-lg bg-base-200/50 flex aspect-square items-center justify-center border p-4">
                <img
                  class="m-auto size-8"
                  src="https://oxymor-ns.tailus.io/logos/linear.svg"
                  alt="Linear logo"
                  width="32"
                  height="32"
                />
              </div>
              <div class="rounded-lg aspect-square border border-dashed border-base-300"></div>
              <div class="rounded-lg bg-base-200/50 flex aspect-square items-center justify-center border p-4">
                <img
                  class="m-auto size-8"
                  src="https://oxymor-ns.tailus.io/logos/netlify.svg"
                  alt="Netlify logo"
                  width="32"
                  height="32"
                />
              </div>
              <div class="rounded-lg aspect-square border border-dashed border-base-300"></div>
              <div class="rounded-lg bg-base-200/50 flex aspect-square items-center justify-center border p-4">
                <img
                  class="m-auto size-8"
                  src="https://oxymor-ns.tailus.io/logos/github.svg"
                  alt="github logo"
                  width="32"
                  height="32"
                />
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Admin Features Demo Component
</script>
