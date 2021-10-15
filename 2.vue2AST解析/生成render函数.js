let ast = {
  tag: "div",
  attrs: [
    { name: "id", value: "app" },
  ],
  children: [{ type: 3, text: "ccc" }],
  parent: null,
  type: 1,
};
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{ }} 中间的内容

function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 特殊属性 style="color:black;"
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").reduce((memo, current) => {
        let [key, value] = current.split(":");
        memo[key] = value;
        return memo;
      }, obj);
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  // 说明是元素节点
  if (node.type === 1) {
    return genCode(node);
  } else {
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(node.text)})`; //这个就是匹配纯文本的
    } else {
      let tokens = [];
      let match;
      // exec 遇到全局匹配会有lastIndex问题,每次匹配前需要将lastIndex置为0
      let startIndex = (defaultTagRE.lastIndex = 0);
      while ((match = defaultTagRE.exec(text))) {
        let endIndex = match.index; // 匹配到的索引  aaa {{ccc}}ddd
        if (endIndex > startIndex) {
          tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        startIndex = endIndex + match[0].length;
      }
      if (startIndex < text.length) {
        //把最后的一部分也塞进去
        tokens.push(JSON.stringify(text.slice(startIndex)));
      }
      return `_v(${tokens.join("+")})`; // 最后将动态数据和非动态数据拼接在一起
    }
  }
}

function genChildren(ast) {
  const children = ast.children;
  return children.map(child => gen(child)).join(",");
}

function genCode(ast) {
  let code = `_c('${ast.tag}',${
    ast.attrs.length ? genProps(ast.attrs) : "undefined"
  }${ast.children ? "," + genChildren(ast) : ""})`;
  return code;
}

const code = genCode(ast);
const render = new Function(`with(this){return ${code} }`);

console.log(render);
