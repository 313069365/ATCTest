import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import IconsResolver from "unplugin-icons/resolver";
import { VantResolver } from "@vant/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({ compiler: "vue3" }),
    Components({
      resolvers: [
        IconsResolver({ alias: { ms: "material-symbols" } }),
        VantResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // base: "/ATCTest/",
  base: "./",
});
