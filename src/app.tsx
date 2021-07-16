import { history, Link, RunTimeLayoutConfig } from 'umi';
console.log('进入app');

// export async function getInitialState(): Promise<{
//   settings?: Partial<any>;
//   userInfo?: { user: boolean };
//   fetchUserInfo?: () => Promise<{ user: boolean } | undefined>;
// }> {
//   const fetchUserInfo = async () => {
//     try {
//       const data = await new Promise<{ user: boolean }>((res) => {
//         setTimeout(() => {
//           res({ user: false });
//         }, 100);
//       });
//       return data;
//     } catch (error) {
//       history.push('/user/login');
//     }
//     return undefined;
//   };
//   if (history.location.pathname !== '/user/login') {
//     const userInfo = await fetchUserInfo();
//     console.log('fetchUserInfo', userInfo);

//     return {
//       fetchUserInfo,
//       userInfo,
//       settings: {},
//     };
//   }
//   return {
//     fetchUserInfo,
//     settings: {},
//   };
// }
export async function getInitialState(): Promise<{
  settings?: Partial<any>;
  currentUser?: any;
  fetchUserInfo?: () => Promise<any>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await await new Promise<{ currentUser: string }>((res) => {
        setTimeout(() => {
          res({ currentUser: 'adm' });
        }, 100);
      });
      return msg;
    } catch (error) {
      history.push('/login');
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/login') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser: currentUser?.currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <div>rightContentRender</div>,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <div>footerRender</div>,
    onPageChange: () => {
      const { location } = history;
      console.log('onPageChange', location);

      // 如果没有登录，重定向到 login
      // if (!initialState?.currentUser && location.pathname !== loginPath) {
      //   history.push(loginPath);
      // }
    },
    // links: [<div>link</div>],
    // menuHeaderRender: <div>menuHeaderRender</div>,
    // 自定义 403 页面
    unAccessible: <div>unAccessible</div>,
  };
};
