import { Models } from "@rematch/core";
import { storage } from "./storage";
import { common } from "./common";

export interface RootModel extends Models<RootModel> {
  common: typeof common;
  storage: typeof storage;
}
export const models: RootModel = {
  common,
  storage,
};
