// https://github.com/que-etc/intersection-observer-polyfill
require("intersection-observer");

if (!Object.entries) {
  Object.entries = function (obj: any) {
    let ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

if (!Object.hasOwnProperty("getOwnPropertyDescriptors")) {
  Object.defineProperty(Object, "getOwnPropertyDescriptors", {
    configurable: true,
    writable: true,
    value: function getOwnPropertyDescriptors(object: any) {
      return Reflect.ownKeys(object).reduce((descriptors, key) => {
        return Object.defineProperty(descriptors, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: Object.getOwnPropertyDescriptor(object, key),
        });
      }, {});
    },
  });
}
