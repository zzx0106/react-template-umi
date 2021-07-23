import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import immerPlugin from "@rematch/immer";
import loadingPlugin from "@rematch/loading";
import persistPlugin from "@rematch/persist";
import storagePlugin from "redux-persist/lib/storage";

import { models, RootModel } from "./modules/index";
// https://rematchjs.org/docs/
export const store = init<RootModel>({
  models,
  // 开启devtool
  // redux: {
  //   devtoolOptions: {
  //     // disabled: true,
  //     actionSanitizer: (action) => action,
  //   },
  // },
  plugins: [
    // 省去了必须返回新对象的弊端，由immer处理
    immerPlugin({
      // 如果没有提供配置，所有型号的减速机都将用immer包装。
      // whitelist: [], //  an array of models' names. Allows defining on a model level, which reducers should be wrapped with immer.
      // blacklist: [], // an array of models' names. Allows defining on a model level, which reducers should not be wrapped with immer.
    }),
    // 异步loading
    loadingPlugin({
      // asNumber: true // 用0或者1代替boolean
    }),
    // 持久化处理
    persistPlugin({
      key: "__store__",
      storage: storagePlugin,
      whitelist: ["storage"], // storage模块会被缓存到localstorage中
    }),
  ],
});
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
