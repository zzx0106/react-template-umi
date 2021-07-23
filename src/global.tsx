/**
 * 该文件文档没有描述，如果写了就会自动添加到.umi/umi.ts中
 */
console.log("进入global.tsx");

import { history } from "umi";

history.listen((location, action) => {
  console.log("listen", location, action);
});
