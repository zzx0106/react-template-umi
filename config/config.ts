// https://umijs.org/config/
import { defineConfig } from 'umi';
import WebpackChain from 'webpack-chain';
import proxy from './proxy';
import routes from '../src/routes/routes';
import { extraPostCSSPlugins } from './postcss';

const { REACT_APP_ENV } = process.env;
// export default defineConfig({
//   devtool: 'eval',
//   nodeModulesTransform: {
//     type: 'none',
//   },
//   routes: [
//     { path: '/', component: '@/pages/index' },
//     {
//       path: '/module1',
//       component: '@/pages/module1/module1',
//       access: 'canAdmin',
//     },
//     {
//       path: '/module2',
//       component: '@/pages/module2/module2',
//       access: 'canAdmin',
//     },
//   ],
//   fastRefresh: {},
// });

export default defineConfig({
  /**
   * Default: cheap-module-source-map in dev, false in build
   * eval，最快的类型，但不支持低版本浏览器，如果编译慢，可以试试
   * source-map，最慢最全的类型
   * https://webpack.js.org/configuration/devtool/#devtool
   */
  // devtool: 'eval',

  // favicon: '',

  title: '项目主标题1',
  // 打包输出目录(默认dist)
  // outputPath: 'dist'
  // webpack的publicPath(默认/)
  // publicPath: '/',

  alias: {
    // '@': resolve(__dirname, '../src'), // 已经内置
  },

  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    // ...defaultSettings,
  },

  devServer: {
    port: 10087,
    host: '0.0.0.0',
    // https: false, // 是否开启https
    // writeToDisk: false, // 生成 assets 到文件系统
  },

  /**
   * 包模块结构分析工具，可以看到项目各模块的大小，按需优化 默认 server 端口号为 8888，
   */
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 10086,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },

  /**
   * 主题
   */
  theme: {},

  // 配置是否让生成的文件包含 hash 后缀，通常用于增量发布和避免浏览器加载缓存。
  hash: true,
  // history: 'hash',//hash路由

  // 开启该功能将会自动开启 webpack5 和 dynamicImport.
  // mfsu: {},

  /**
   * 开启webpack5代替webpack4
   */
  webpack5: {},

  /**
   * DefinePlugin配置，可以配置全局公共参数
   */
  define: {},

  /**
   * 开启按需加载
   * https://umijs.org/zh-CN/config#dynamicimport
   */
  dynamicImport: {
    // 去除loading，这里导入一个空的组件即可
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  /**
   * 预渲染html页面
   * 常用来解决没有服务端情况下，页面的 SEO 和首屏渲染提速。
   * 和这个插件类似PrerenderSPAPlugin
   * 针对路由生成对应html文件
   * 可以配合ssr使用
   */
  // exportStatic: {},

  /* https://umijs.org/zh-CN/config#ssr */
  // ssr: {},

  /**
   * 排除打包的文件，多用于cdn
   */
  externals: {
    // react: 'window.React',
  },

  /**
   * 配置 <body> 里的额外脚本。
   * 可以配合externals设置cnd
   */
  scripts: [
    // 'https://unpkg.com/react@17.0.1/umd/react.production.min.js'
  ],

  /**
   * 配置 <head> 里的额外脚本，数组项为字符串或对象。
   */
  headScripts: [],

  /**
   * 配置额外的 babel 插件。
   */
  extraBabelPlugins: [],

  /**
   * sass
   */
  sass: {},

  /**
   * 配置额外的postcss插件
   */
  extraPostCSSPlugins,

  /**
   * 开启 TypeScript 编译时类型检查，默认关闭。
   */
  // forkTSChecker: {},

  /**
   * 快速刷新，开发时可以保持组件状态，同时编辑提供即时反馈。
   * https://umijs.org/zh-CN/docs/fast-refresh
   */
  fastRefresh: {},

  /**
   * webpack配置
   * config，当前 webpack-chain 对象
    {
      * env，当前环境，development、production 或 test 等
      * webpack，webpack 实例，用于获取其内部插件
      * createCSSRule，用于扩展其他 CSS 实现，比如 sass, stylus
      * type，当前 webpack 实例类型，默认走 csr，如果开启 ssr，会有 ssr 的 webpack 实例
    }
   */
  chainWebpack(config: WebpackChain, {}) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          maxAsyncRequests: 5,
          maxInitialRequests: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 2,
            },
            antd: {
              test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
              name: 'antd',
              chunks: 'all',
              priority: 2,
            },
            commons: {
              name: 'commons',
              chunks: 'initial',
              minChunks: 2,
            },
          },
        },
      },
    });
  },

  /**
   * 开启 worker-loader 功能。
   */
  // workerLoader: {}

  /**
   * 设置 node_modules 目录下依赖文件的编译方式  type: 'none', 不走babel
   */
  nodeModulesTransform: {
    type: 'none',
  },
  // 配置路由
  routes,
  /**
   * webpack插件
   */
  // plugins: [],

  // polyfill: {
  //   imports: [
  //     // TODO observer
  //   ]
  // }

  /**
   * api代理
   */
  proxy,

  /**
   * 配置需要兼容的浏览器最低版本，会自动引入 polyfill 和做语法转换。
   * Default: { chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }
   * 选择合适的浏览器版本，可减少不少尺寸，比如配成以下这样，预计可减少 90K （压缩后未 gzip）的尺寸。
   * { chrome: 79, firefox: false, safari: false, edge: false, ios: false, },
   */
  // targets: { ie: 11 },
  // 对js压缩的功能，可以配置去除console
  // terserOptions: {}

  /**
   * 是否关闭css modules
   */
  // disableCSSModules: true,
});
