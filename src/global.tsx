/**
 * 该文件文档没有描述，如果写了就会自动添加到.umi/umi.ts中
 */
import { history } from 'umi';
console.log('进入global.tsx', history);
history.listen((location, action) => {
  console.log('listen', location, action);
});
