import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { registerOnUnauthorized } from "@/api/api-handler";
import { useAuthStore } from "@/store/auth.store";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// When any API returns 401, clear token and redirect to sign-in
registerOnUnauthorized(() => {
  useAuthStore().logout();
  router.replace("/auth/sign-in");
});

app.mount("#app");
