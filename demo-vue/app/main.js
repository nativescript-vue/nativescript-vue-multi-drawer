import Vue from "nativescript-vue";
import App from "./components/App";
import VueDevtools from "nativescript-vue-devtools";
import MultiDrawer from "nativescript-vue-multi-drawer";

if (TNS_ENV !== "production") {
  Vue.use(VueDevtools);
}

Vue.use(MultiDrawer, {
  // override any option here
  // for example enable debug mode
  debug: true
});

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = TNS_ENV === "production";

new Vue({
  render: h => h("frame", [h(App)])
}).$start();

async function asd() {
  await something();
}