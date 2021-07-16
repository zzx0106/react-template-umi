import { Routes } from '../routes';

export const module1: Routes = [
  {
    path: 'module1',
    component: '@/pages/module1/module1',
    access: 'canAdmin',
  },
];
