import { createModel } from "@rematch/core";
import { RootModel } from ".";

export const storage = createModel<RootModel>()({
  // name: 'common', // 如果设置了name，模块名以name为准
  state: {
    userInfo: {
      name: "zzx",
    },
  },
  reducers: {},
});
