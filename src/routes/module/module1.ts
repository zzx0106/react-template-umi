import { Routes } from "../routes";

export const module1: Routes = [
  {
    path: "/module1",
    name: "module1页面",
    // component: '@/pages/module1/module1',
    access: "canAdmin",
    routes: [
      {
        path: "/module1/md1_child",
        name: "module1的子页面",
        component: "@/pages/module1/module1",
      },
    ],
  },
];
