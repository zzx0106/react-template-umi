import { useEffect } from "react";
import {
  history,
  useAccess,
  useLocation,
  useParams,
  useRouteMatch,
  withRouter,
} from "umi";
import "./module2.scss";

const Module1 = () => {
  const params = useParams();
  const match = useRouteMatch();
  const location = useLocation();
  const access = useAccess();
  useEffect(() => {
    console.log("location", location);
    console.log("match", match);
    console.log("params", params);
    console.log("access", access);

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
      这是module2
      <div className="test-base-sass">测试全局sass功能</div>
    </div>
  );
};
export default Module1;
