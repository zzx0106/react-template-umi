console.log("进入access");
import "@/utils/polyfill"; // access文件基本是最先执行的，如果涉及到全局的一些polyfill，去config.ts的polyfill里面配置

export default function access(initialState: { currentUser?: string }) {
  const { currentUser } = initialState || {};
  console.log("currentUser", currentUser);

  return {
    canAdmin: currentUser && currentUser === "adm2",
  };
}
