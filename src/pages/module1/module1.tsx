import { useEffect } from 'react';
import { history } from 'umi';

const Module1 = () => {
  useEffect(() => {
    // history 栈里的实体个数
    console.log('路由栈里的实体个数', history.length);

    // 当前 history 跳转的 action，有 PUSH、REPLACE 和 POP 三种类型
    console.log('路由action', history.action);

    // location 对象，包含 pathname、search 和 hash
    // console.log(history.location.pathname);
    // console.log(history.location.search);
    // console.log(history.location.hash);
  }, []);

  return <div>这是module1</div>;
};
export default Module1;
