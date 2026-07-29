<template>
  <div class="drawer">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col min-h-screen bg-base-200">
      <!-- Navbar (Superior) -->
      <LayoutNavbar />
      
      <!-- Contenido Principal -->
      <main class="flex-grow p-4 lg:p-6">
        <slot />
      </main>
      
      <!-- Footer (Inferior) -->
      <LayoutFooter />
    </div> 
    
    <!-- Sidebar (Lateral) -->
    <div class="drawer-side z-50">
      <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <LayoutSidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
// Default layout
</script>
