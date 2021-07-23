import styles from "./index.scss";
import { history } from "umi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function IndexPage() {
  const common = useSelector((state: RootState) => state.common);
  return (
    <div>
      <h1 className={styles.title}>Page index{common.a}</h1>
      <button onClick={() => history.push("/module1/md1_child")}>
        navigateTo module1
      </button>
      <button
        onClick={() =>
          history.push({
            pathname: "/module2",
            state: {
              a: 123,
              b: { c: 123 },
            },
            query: {
              id: "123",
              page: "10",
            },
          })
        }
      >
        navigateTo module2
      </button>
    </div>
  );
}
