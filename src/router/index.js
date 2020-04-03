import Vue from "vue";
import VueRouter from "vue-router";
import OBEditor from "../views/OBEditor.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/ob-editor"
  },
  {
    path: "/ob-editor",
    name: "ob-editor",
    component: OBEditor
  }
];

const router = new VueRouter({
  routes
});

export default router;
