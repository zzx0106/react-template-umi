import { Routes } from "../routes";

const module2: Routes = [
  {
    path: "module2",
    name: "module2页面",
    // wrappers: ['@/routes/middlewares/private-route'],
    component: "@/pages/module2/module2",
    access: "canAdmin",
  },
];
export default module2;
