import { module1 } from './module/module1';
import module2 from './module/module2';

const routes: Routes = [
  { path: '/', component: '@/pages/index' },
  ...module1,
  ...module2,
  // { component: '@/pages/403' },
  { component: '@/pages/404' },
];

export default routes;
export type Routes = {
  path?: string;
  component?: string | (() => any);
  wrappers?: string[];
  redirect?: string;
  exact?: boolean;
  routes?: any[];
  [k: string]: any;
}[];
