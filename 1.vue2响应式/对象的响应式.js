function observe(data) {
  //如果不是对象类型 则不需要做任何处理
  if (typeof data !== "object" || data === null) return;
  return new Observer(data);
}

class Observer {
  constructor(data) {
    if (Array.isArray(data)) {
      //vue为了性能优化所以没有使用Object.defineProperty去监听数组中的每一项,而是用AOP切片编程的方式去劫持js数组的七个可以修改原数组的方法
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(data, keys[i], data[keys[i]]);
    }
  }
}

function defineReactive(data, key, value) {
  //递归得去检测
  observe(value);
  //劫持传入的属性
  Object.defineProperty(data, key, {
    get: function () {
      console.log("获取被劫持的对象的值");
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      console.log("修改了被劫持的对象的值");
      //继续劫持新增项
      observe(value);
      value = newValue;
    },
  });
}

//testCode

const data = {
  name: "wumao",
  age: 18,
};

observe(data);

data.name; //获取被劫持的对象的值
data.age = 16; //修改了被劫持的对象的值
