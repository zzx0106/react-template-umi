import { useEffect } from "react";
import { history } from "umi";
import { RootDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { getPersistor } from "@rematch/persist";
import { PersistGate } from "redux-persist/lib/integration/react";

const persistor = getPersistor();

const Module1 = () => {
  const common = useSelector((state: RootState) => state.common);
  const dispatch = useDispatch<RootDispatch>();
  console.log("countState", common);

  useEffect(() => {
    // history 栈里的实体个数
    console.log("路由栈里的实体个数", history.length);

    // 当前 history 跳转的 action，有 PUSH、REPLACE 和 POP 三种类型
    console.log("路由action", history.action);

    // location 对象，包含 pathname、search 和 hash
    // console.log(history.location.pathname);
    // console.log(history.location.search);
    // console.log(history.location.hash);
  }, []);

  return (
    <div>
      这是module1
      <button onClick={() => dispatch.common.add(2)}>点击同步增加</button>
      <button onClick={() => dispatch.common.addAsync(1)}>点击异步增加</button>
      <div>{common.a}</div>
      <br />
      <button onClick={() => dispatch.common.addList()}>点击增加数组</button>
      {common.dataList.map((item, index) => {
        return <div key={index}>{item.data}</div>;
      })}
      <PersistGate persistor={persistor}>
        <div>app</div>
      </PersistGate>
    </div>
  );
};
export default Module1;
