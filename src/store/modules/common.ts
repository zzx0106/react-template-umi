import { createModel } from "@rematch/core";
import { RootModel } from ".";

export const common = createModel<RootModel>()({
  // name: 'common', // 如果设置了name，模块名以name为准
  state: {
    a: 0,
    dataList: [{ data: 1 }],
  },
  reducers: {
    add(state, payload: number) {
      // 使用immer后可以这样, 否则需要return 纯对象，具体参考redux的reducer
      state.a += payload;
      console.log("state", state, payload);
      return state;
    },
    addList(state) {
      state.dataList.push({ data: 2 });
      console.log("state", state);
      return state;
    },
  },
  effects: (dispatch) => ({
    async addAsync(payload: number, state) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("addAsync", payload, state);
      dispatch.count.add(payload);
    },
  }),
});
