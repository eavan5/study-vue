const oldArrayPrototype = Array.prototype;

const arrayPrototype = Object.create(oldArrayPrototype);

let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

methods.forEach(method => {
  //用户调用push方法会先通过自己重写的方法,然后再调用数组原来的方法
  arrayPrototype[method] = function (...args) {
    //改写方法
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    if (inserted) {
      //对新增的数据再进行观测
      console.log("有插入的数据,继续观测新增的数据");
    }
    return oldArrayPrototype[method].call(this, ...args);
  };
});


const data = [1, 2, 3]

Object.setPrototypeOf(data, arrayPrototype)

data.push("3")