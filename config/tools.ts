import fs from "fs";
import path, { join } from "path";

/**
 * 查询文件夹内所有文件
 * @param startPath 入口
 * @returns
 */
function findSync(startPath: string) {
  let result: string[] = [];
  function finder(path: string) {
    let files = fs.readdirSync(path);
    files.forEach((val) => {
      let fPath = join(path, val);
      let stats = fs.statSync(fPath);
      if (stats.isDirectory()) finder(fPath);
      if (stats.isFile()) {
        if (fPath.indexOf(".md") === -1) {
          result.push(fPath);
        }
      }
    });
  }
  finder(path.resolve(__dirname, startPath));
  return result;
}

export { findSync };
