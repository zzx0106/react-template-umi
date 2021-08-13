interface AnyObj {
  [key: string]: any;
}

function setStorage(key: string, value: { [key: string]: any } | any[]) {
  localStorage.setItem(key, JSON.stringify(value));
}
function removeStorage(key: string) {
  localStorage.removeItem(key);
}
function getStorage(key: string) {
  const data = localStorage.getItem(key);
  return JSON.parse((data === "undefined" ? '""' : data) as string);
}

function isObject(value: any): boolean {
  const type = typeof value;
  return value != null && (type == "object" || type == "function");
}
interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
}
interface DebounceSettings {
  /** 立即执行 */
  leading?: boolean;
  /** 最大等待时间 */
  maxWait?: number;
  /** 最后一次也要执行，多用于节流 */
  trailing?: boolean;
}
function debounce<T extends (...args: any) => any>(
  func: T,
  wait: number = 0,
  options?: DebounceSettings
): DebouncedFunc<T> {
  let lastArgs: IArguments | undefined,
    lastThis: any,
    maxWait: number | undefined,
    result: any,
    timerId: NodeJS.Timeout | undefined,
    lastCallTime: number | undefined,
    lastInvokeTime = 0,
    leading = false,
    maxing = false,
    trailing = true;

  if (typeof func != "function") {
    throw new Error("回调必须是函数");
  }
  wait = +wait || 0;
  if (options && isObject(options)) {
    leading = !!options?.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? Math.max(+(options?.maxWait ?? 0) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time: number) {
    let args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as unknown as any[]);
    return result;
  }

  function leadingEdge(time: number) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    let timeSinceLastCall = time - (lastCallTime as number),
      timeSinceLastInvoke = time - lastInvokeTime,
      timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, (maxWait as number) - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    let timeSinceLastCall = time - (lastCallTime as number),
      timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= (maxWait as number))
    );
  }

  function timerExpired() {
    let time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: any) {
    let time = Date.now(),
      isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
function throttle<T extends (...args: any) => any>(
  func: T,
  wait?: number,
  options?: { leading?: boolean; trailing?: boolean }
): DebouncedFunc<T> {
  let leading = true,
    trailing = true;

  if (typeof func != "function") {
    throw new Error("回调必须是函数");
  }
  if (options && isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing,
  });
}

interface IEntryTarget extends Element {
  src?: string;
  dataset?: {
    src: string;
  };
}
interface IEntry extends IntersectionObserverEntry {
  target: IEntryTarget;
}
/**
 * 图片懒加载
 * 需要在标签上使用data-src
 */
function lazyImageLoad() {
  let imgList = [...document.querySelectorAll("img")];
  console.log("lazyImageLoad", imgList);
  let num = imgList.length;
  let lazyLoad = function () {};
  if (window["IntersectionObserver"]) {
    /**当 img 标签进入可视区域时会执行实例化时的回调，
     * 同时给回调传入一个 entries 参数，保存着实例观察的所有元素的一些状态，
     * 比如每个元素的边界信息，当前元素对应的 DOM 节点，
     * 当前元素进入可视区域的比率，每当一个元素进入可视区域，
     * 将真正的图片赋值给当前 img 标签，同时解除对其的观察
     */
    lazyLoad = function () {
      let observer = new IntersectionObserver((entries) => {
        entries.forEach((entry: IEntry) => {
          if (entry.intersectionRatio > 0) {
            entry.target.src = entry.target.dataset?.src;
            observer.unobserve(entry.target);
          }
        });
      });
      imgList.forEach((img) => {
        if (img.dataset.src) {
          observer.observe(img);
        }
      });
    };
  } else {
    // 兜底方案
    lazyLoad = (function () {
      let count = 0;
      return function () {
        const deleteIndexList: number[] = [];
        imgList.forEach((img, index) => {
          const rect = img.getBoundingClientRect();
          if (rect.top < window.innerHeight) {
            if (img.dataset.src) img.src = img.dataset.src;
            deleteIndexList.push(index);
            count++;
            if (count === num) {
              document.removeEventListener("scroll", lazyLoad);
            }
          }
        });
        imgList = imgList.filter(
          (_, index) => !deleteIndexList.includes(index)
        );
      };
    })();
    document.addEventListener("scroll", throttle(lazyLoad, 100));
  }
  return lazyLoad();
}
/**
 * @desc 私有化对象属性
 * @param {Object} obj 需要私有化的变量名以 _ 开头
 */
function privatization(obj: any) {
  if (!window["Proxy"]) {
    throw new Error('"Proxy" not support, you need babel-polyfill');
  }
  return new Proxy(obj, {
    get(target, key: string) {
      if (key.startsWith("_")) {
        throw new Error("private key");
      }
      return Reflect.get(target, key);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => !(key as string).startsWith("_")
      );
    },
  });
}
/**
 * @desc async/await优化处理
 * @param {Function} asyncFunc promise对象
 * @param {Object | String} asyncFunc 传参
 * @returns {Array} [error , res]
 */
async function errorCaptured<T>(
  asyncFunc: (params: AnyObj) => Promise<T>,
  params: AnyObj
) {
  try {
    let res = await asyncFunc(params);
    return [null, res];
  } catch (error) {
    return [error, null];
  }
}
/**
 * @desc 对象Key排序并生成key=value&
 * @param {Object} jsonObj 排序对象
 * @param {Boolean} isSort 是否排序
 */
function jsonSort(jsonObj: AnyObj, isSort = true) {
  let arr = [];
  for (let key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) arr.push(key);
  }
  isSort && arr.sort();
  let str = "";
  for (let i in arr) {
    // 过滤掉 Array.prototype.xxx进去的字段
    if (arr.hasOwnProperty(i)) str += arr[i] + "=" + jsonObj[arr[i]] + "&";
  }
  return str.substr(0, str.length - 1);
}
/**
 * 对象排序,升序
 */
function sortAsc(propertyName: string) {
  return function (object1: AnyObj, object2: AnyObj) {
    const value1 = object1[propertyName];
    const value2 = object2[propertyName];
    if (value2 < value1) {
      return 1;
    } else if (value2 > value1) {
      return -1;
    } else {
      return 0;
    }
  };
}
// 精度计算
function P() {
  /*
   * 判断obj是否为一个整数
   */
  function isInteger(obj: number) {
    return Math.floor(obj) === obj;
  }

  /*
   * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
   * @param floatNum {number} 小数
   * @return {object}
   *   {times:100, num: 314}
   */
  function toInteger(floatNum: number) {
    let ret = { times: 1, num: 0 };
    let isNegative = floatNum < 0;
    if (isInteger(floatNum)) {
      ret.num = floatNum;
      return ret;
    }
    let strfi = floatNum + "";
    let dotPos = strfi.indexOf(".");
    let len = strfi.substr(dotPos + 1).length;
    let times = Math.pow(10, len);
    let intNum = parseInt(`${Math.abs(floatNum) * times + 0.5}`, 10);
    ret.times = times;
    if (isNegative) {
      intNum = -intNum;
    }
    ret.num = intNum;
    return ret;
  }

  /**
   * 核心方法，实现加减乘除运算，确保不丢失精度
   * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
   *
   * @param a {number} 运算数1
   * @param b {number} 运算数2
   * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
   *
   */
  function operation(a: number, b: number, op: string): number {
    let o1 = toInteger(a);
    let o2 = toInteger(b);
    let n1 = o1.num;
    let n2 = o2.num;
    let t1 = o1.times;
    let t2 = o2.times;
    let max = t1 > t2 ? t1 : t2;
    let result = null;
    switch (op) {
      case "add":
        if (t1 === t2) {
          // 两个小数位数相同
          result = n1 + n2;
        } else if (t1 > t2) {
          // o1 小数位 大于 o2
          result = n1 + n2 * (t1 / t2);
        } else {
          // o1 小数位 小于 o2
          result = n1 * (t2 / t1) + n2;
        }
        return result / max;
      case "subtract":
        if (t1 === t2) {
          result = n1 - n2;
        } else if (t1 > t2) {
          result = n1 - n2 * (t1 / t2);
        } else {
          result = n1 * (t2 / t1) - n2;
        }
        return result / max;
      case "multiply":
        result = (n1 * n2) / (t1 * t2);
        return result;
      case "divide":
        result = (n1 / n2) * (t2 / t1);
        return result;
      default:
        return 0;
    }
  }

  function add(a: number, b: number) {
    return operation(a, b, "add");
  }
  function subtract(a: number, b: number, digits: number) {
    return operation(a, b, "subtract").toFixed(digits);
  }
  function multiply(a: number, b: number, digits: number) {
    return operation(a, b, "multiply").toFixed(digits);
  }
  function divide(a: number, b: number, digits: number) {
    return operation(a, b, "divide").toFixed(digits);
  }

  // exports
  return {
    add,
    subtract,
    multiply,
    divide,
  };
}
/**
 * @desc 过滤掉空对象
 * @param {Object} body
 */
function filter(body: AnyObj) {
  // 过滤掉所有key为空的字段
  if (body && Object.keys(body).length > 0) {
    body = Object.keys(body).reduce((target, key) => {
      if (body[key] !== "") {
        // 要设置不等于'' 因为可能出现0
        target[key] = body[key];
      }
      return target;
    }, {} as AnyObj);
  }
  return body;
}
/**
 *
 * @desc 获取滚动条距顶部的距离
 */
function getScrollTop() {
  return (
    (document.documentElement && document.documentElement.scrollTop) ||
    document.body.scrollTop
  );
}
/**
 *
 * @desc  获取一个元素的距离文档(document)的位置，类似jQ中的offset()
 * @param {HTMLElement} ele
 * @returns { {left: number, top: number} }
 */
function offset(ele: HTMLElement) {
  let pos = {
    left: 0,
    top: 0,
  };
  while (ele) {
    pos.left += ele.offsetLeft;
    pos.top += ele.offsetTop;
    ele = ele.offsetParent as HTMLElement;
  }
  return pos;
}
function isAndroid() {
  let u = navigator.userAgent;
  // 安卓
  let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
  return isAndroid;
}
function isIos(): boolean {
  let u = navigator.userAgent;
  let isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  return isIos;
}
function isNull(data: any) {
  // 解决处理判断数字0=''的问题
  if (data === 0) {
    data = data.toString();
  }
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  return data == null || data === "" || data === "undefined";
}
/**
 * 获取url的params
 * @param name
 * @param url
 * @returns
 */
function getUrlParam(name: string, url: string) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r;
  if (isNull(url)) {
    r = window.location.search.substr(1).match(reg);
  } else {
    let ParamList = url.split("?");
    if (ParamList.length > 1) {
      r = ParamList[1].substr(0).match(reg);
    } else {
      return url;
    }
  }
  let context = "";
  if (r != null) {
    context = r[2];
  }
  return context == null || context === "" || context === "undefined"
    ? ""
    : context;
}

//封装检测数据类型的函数
function checkedType(data: any) {
  return Object.prototype.toString.call(data).slice(8, -1);
}
/**
 * 深度克隆
 * @param {any} target
 */
function deepClone<T>(target: AnyObj): T | AnyObj {
  let result,
    targetType = checkedType(target);
  if (targetType == "Object") {
    result = {};
  } else if (targetType == "Array") {
    result = [];
  } else {
    return target; //普通数据类型直接返回
  }

  for (let i in target) {
    if (target.hasOwnProperty(i)) {
      let value = target[i];
      if (checkedType(value) == "Object" || checkedType(value) == "Array") {
        // @ts-ignore TODO 优化types
        result[i] = deepClone(value);
      } else {
        // @ts-ignore TODO 优化types
        result[i] = value;
      }
    }
  }
  return result;
}
const a = {
  a: 1,
  b: 2,
  c: 3,
};
const c = deepClone<typeof a>(a);
c.a;
/**
 * 对象深度合并
 * @param  {...Object} objArr 需要合并的对象 内部不允许有数组
 */
function deepMerge(...objArr: any[]) {
  let ret = {};
  function handler(key: string, source: AnyObj, ret: AnyObj) {
    let isObj = typeof source[key] == "object"; //判断是否是对象
    if (isObj) {
      if (!ret[key]) {
        ret[key] = {}; //键名不存在，拷贝键名
      }
      // 由于是对象、递归深度拷贝
      Object.keys(source[key]).forEach((_key) => {
        handler(_key, source[key], ret[key]);
      });
    } else {
      // 是非引用类型、直接拷贝键名所对应的值
      ret[key] = source[key];
    }
  }
  // 遍历需要拷贝的对象、逐一深度拷贝
  objArr.forEach((obj, idx, _self) => {
    Object.keys(obj).forEach((key) => {
      handler(key, obj, ret);
    });
  });
  return ret;
}
/**
 * 获取系统语言
 * @return {string} zh en
 */
function getSysLanguage() {
  return "en";
  // return window.navigator.language.slice(0, 2);  （产品林鑫要求默认是英文，不需要根据用户浏览器）
}
/**
 * 判断当前浏览器是否是Chrome
 * @returns {String} chrome | safari | iex | edge | ff | opera
 */
function getBrowser() {
  const userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  const isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
  // let isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
  const isIE = window.ActiveXObject || "ActiveXObject" in window;
  // let isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器
  const isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
  const isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
  const isSafari =
    userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
  const isChrome =
    userAgent.indexOf("Chrome") > -1 &&
    userAgent.indexOf("Safari") > -1 &&
    !isEdge; //判断Chrome浏览器

  if (isIE) {
    const reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    const fIEVersion = parseFloat(RegExp["$1"]);
    if (userAgent.indexOf("MSIE 6.0") != -1) {
      return "ie6";
    } else if (fIEVersion == 7) {
      return "ie7";
    } else if (fIEVersion == 8) {
      return "ie8";
    } else if (fIEVersion == 9) {
      return "ie9";
    } else if (fIEVersion == 10) {
      return "ie10";
    } else if (userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) {
      return "ie11";
    } else {
      return "0";
    } //IE版本过低
  } //isIE end
  if (isFF) {
    return "ff";
  }
  if (isOpera) {
    return "opera";
  }
  if (isSafari) {
    return "safari";
  }
  if (isChrome) {
    return "chrome";
  }
  if (isEdge) {
    return "edge";
  }
}
/**
 * 给元素设置transform
 * @param {Element} ele dom
 * @param {CSSStyleSheet} style transform对应的属性
 */

function setTransform(ele: HTMLElement, style: string) {
  if (!style || !ele) return;
  ele.style.webkitTransform = style;
  // @ts-ignore
  ele.style.MozTransform = style;
  // @ts-ignore
  ele.style.msTransform = style;
  // @ts-ignore
  ele.style.OTransform = style;
  ele.style.transform = style;
}
/**
 * pc端实现移动端滑动页面的效果
 * @param {String} domName
 * @param {Object} options { scrollY: true, scrollX: true } 滑动的轴
 */
function touchController(domName: string, options: AnyObj = {}) {
  options = Object.assign({ scrollY: true, scrollX: true }, options);
  const dom = document.querySelector(domName) as HTMLElement;
  dom.onmousedown = function (e) {
    let el = e || event;
    let Y = el.clientY;
    let X = el.clientX;
    const _dom = document.querySelector(domName) as HTMLElement;
    let ToTop = _dom.scrollTop;
    let Toleft = _dom.scrollLeft;
    dom.onmousemove = throttle(function (ev) {
      ev = ev || event;
      const subY = ev.clientY - Y;
      const subX = ev.clientX - X;
      Y = ev.clientY;
      X = ev.clientX;
      ToTop -= subY;
      Toleft -= subX;
      if (options.scrollY) {
        document.querySelector(domName)!.scrollTop = ToTop;
      }
      if (options.scrollX) {
        document.querySelector(domName)!.scrollLeft = Toleft;
      }
    }, 10);
    document.onmouseup = function () {
      dom.onmousemove = function () {
        null;
      };
    };
  };
}
function timeToTime(start: number, end: number) {
  const arr = [];
  if (!start) {
    const h = new Date().format("HH");
    const m = new Date().format("MM");
    start = +h;
    if (+m < 30) {
      arr.push(`${h}:30`);
    }
    start++;
  }
  while (end > start) {
    const h = `${start}`.addLeftZero();
    arr.push(`${h}:00`, `${h}:30`);
    start++;
  }
  return arr;
}
function dayToDay(num: number) {
  const days = ["今天", "明天"];
  if (num <= 2) return days;
  const now = new Date().getTime();
  let time = 2; // 从第三天开始算
  num -= 2; // 减去今明两天的
  while (time <= num) {
    days;
    days.push(new Date(now + time * 24 * 3600 * 1000).format("mm.dd (ddd)"));
    time++;
  }
  return days;
}
/**
 * 将权限mark fq_导航_一级页面_二级页面_三级页面转化成 {fq_导航: { 一级页面: { 二级页面: { 三级页面: {} } } } }
 * @param {Array} list
 * @return {Object}
 */
function formatePms(list: any[]) {
  if (!list) list = [];
  return list.reduce((obj, pms) => {
    obj[pms.mark] = pms;
    return obj;
  }, {});
}
/**
 * 将权限mark fq_导航_一级页面_二级页面_三级页面转化成 {fq_导航: { 一级页面: { 二级页面: { 三级页面: {} } } } }
 * @param {Array} list
 * @return {Object}
 */
// function formatePms(list) {
//   return list.reduce((obj, { mark }) => {
//     const p = mark.split('_'); // [fq, a, b, c]
//     const navName = `${p.shift()}_${p.shift()}`;
//     if (!obj[navName]) obj[navName] = {};
//     let to = obj[navName]; // 指针
//     while (p.length) {
//       const child = p.shift();
//       if (!to[child]) {
//         to[child] = {};
//       }
//       to = to[child]; // 指针后移
//     }
//     return obj;
//   }, {});
// }

/**  获取36位不重复唯一ID （uuid） */
function uuid() {
  let chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uuid = [],
    i,
    r;
  // uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
  uuid[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  for (i = 0; i < 36; i++) {
    if (!uuid[i]) {
      r = 0 | (Math.random() * 16);
      uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join("");
}
/**
 * 时间差值计算
 * @param {Number} a 时间戳
 * @param {Number} b 时间戳
 */
function timeDayGap(a: number, b: number) {
  return Math.floor((a - b) / 86400000);
}
/**
 * 计算两日期差  兼容谷歌，火狐浏览器
 * @param time1  例如（2017-09-10）
 * @param time2  例如（2017-09-14）
 * @returns {string}
 */
function diyTime(time1: number, time2: number) {
  let $time1 = Date.parse(new Date(time1).toString());
  let $time2 = Date.parse(new Date(time2).toString());
  let $time3 = Math.abs(parseInt(String(($time2 - $time1) / 1000 / 3600 / 24))); //两日期差天数
  return $time3;
}
/**
 * 字符串日期格式化成date
 * @param {String} strDate 时间 yyyy-MM-dd
 */
function dateFormat(strDate = "") {
  const date = strDate
    .replace(/\d+(?=-[^-]+$)/, function (a) {
      return String(parseInt(a, 10) - 1);
    })
    .match(/\d+/g);
  // @ts-ignore
  return new Date(...date);
}
/**
 * 给字符串日期添加指定天数
 * @param {String} formatDate yyyy-MM-dd hh:mm:ss 格式的参数
 * @param {Number} count 天数
 */
function addDay(formatDate: string, count: number) {
  let dateStr;
  let year, month, day;
  let date = dateFormat(formatDate); // 字符串日期格式化成date
  date.setDate(P().add(date.getDate(), count));
  year = date.getFullYear();
  month = date.getMonth() + 1;
  day = date.getDate();
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  if (day.toString().length == 1) {
    day = "0" + day;
  }
  dateStr = year + "-" + month + "-" + day;
  return dateStr;
}
/** 判断对象是否是promise对象 */
function isPromise(obj: Promise<any>) {
  return (
    !!obj && //有实际含义的变量才执行方法，变量null，undefined和''空串都为false
    (typeof obj === "object" || typeof obj === "function") && // 初始promise 或 promise.then返回的
    typeof obj.then === "function"
  );
}

/**
 * 将数字进行千分位转换
 * @param num {Number|String} 数字或者数字的字符串格式
 * @param decimal {Number} 转换之后的字符串需要保留的小数点后的位数
 * @returns {string}
 */
function thousands(num: number | string) {
  // const _num = !decimal ? Number(num) : Number(num).toFixed(+decimal);
  let str = "--";
  if (num === 0 || num) {
    str = `${num}`.replace(/\d{1,3}(?=(\d{3})+(\.\d+)?$)/g, "$&,");
  }
  return str;
}
/**
 * 秒转时分秒
 * @param {string} value 秒
 * @returns {string} 00:12
 */
function formatSeconds(value: number) {
  let secondTime = value; // 秒
  let minuteTime = 0; // 分
  let hourTime = 0; // 小时
  let dayTime = 0;
  if (secondTime >= 60) {
    minuteTime = parseInt(String(secondTime / 60));
    secondTime = parseInt(String(secondTime % 60));
    if (minuteTime >= 60) {
      hourTime = parseInt(String(minuteTime / 60));
      minuteTime = parseInt(String(minuteTime % 60));
      if (hourTime >= 24) {
        dayTime = parseInt(String(hourTime / 24));
        hourTime = parseInt(String(hourTime % 24));
      }
    }
  }
  let result =
    "" +
    (parseInt(String(secondTime)) < 10
      ? "0" + parseInt(String(secondTime))
      : parseInt(String(secondTime)));
  // if (minuteTime > 0) {
  result =
    "" +
    (parseInt(String(minuteTime)) < 10
      ? "0" + parseInt(String(minuteTime))
      : parseInt(String(minuteTime))) +
    ":" +
    result;
  // }
  if (hourTime > 0) {
    result =
      "" +
      (parseInt(String(hourTime)) < 10
        ? "0" + parseInt(String(hourTime))
        : parseInt(String(hourTime))) +
      ":" +
      result;
  }

  return { dayTime, hourTime, minuteTime, secondTime, result };
}
export {
  formatSeconds,
  isPromise,
  addDay,
  dateFormat,
  sortAsc,
  uuid,
  formatePms,
  timeToTime,
  dayToDay,
  touchController, // pc端实现移动端滑动页面的效果
  setTransform, // 给元素设置transform
  getSysLanguage,
  getBrowser,
  setStorage,
  removeStorage,
  getStorage,
  isAndroid,
  isIos,
  debounce, // 防抖
  throttle, // 节流
  lazyImageLoad, // 图片懒加载
  privatization, // 私有化对象属性
  errorCaptured, // async/await优化处理
  jsonSort, //对象Key排序并生成key=value&
  P, // 精度计算
  filter, // 过滤掉空对象
  getScrollTop, // 获取滚动条距顶部的距离
  offset, // 获取一个元素的距离文档(document)的位置，类似jQ中的offset()
  isNull, // 判断数据是否为空
  getUrlParam, //附件名字
  deepClone, // 深克隆
  deepMerge, // 深合并
  timeDayGap, // 时间差值计算
  diyTime, // 计算两日期差 兼容谷歌，火狐浏览器
  thousands, // 数字千分位
};
