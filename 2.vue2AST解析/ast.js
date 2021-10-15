const template = `<div id="app" color="red" bg="22">{{name}}<div>{{aaa}}</div></div>`;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //用来描述标签名的
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div> 捕获的是结束标签的标签名
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{ }} 中间的内容

function parserHTML(html) {
  function advance(n) {
    html = html.substring(n); //每次根据传入的长度截取html
  }
  let root; // 树的操作,需要根据开始标签和结束标签生成一个树
  let stack = [];
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      attrs,
      children: [],
      parent: null,
      type: 1,
    };
  }
  function start(tagName, attrs) {
    console.log("开始标签", tagName, attrs);
    let element = createASTElement(tagName, attrs);
    if (root === undefined) {
      root = element;
    }
    let parent = stack[stack.length - 1]; //取到栈里面的最后一个
    if ((parent)) {
      // 让儿子记住父亲
      element.parent = parent;
      // 让父亲记住儿子
      parent.children.push(element);
    }

    stack.push(element);
  }
  function end(tagName) {
    console.log("结束标签", tagName);
    stack.pop();
  }
  function chars(text) {
    text = text.replace(/\s/g, "");
    if (text) {
      let parent = stack[stack.length - 1];
      parent.children.push({
        type: 3,
        text,
      });
    }
    console.log("文本标签", text);
  }
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let matches;
      //走到结束标签
      if ((matches = html.match(endTag))) {
        end(matches[1]);
        advance(matches[0].length);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text);
      // break;
    }
  }

  // 解析开始标签 {tag:'div',attrs:[...}]}
  function parseStartTag() {
    const matches = html.match(startTagOpen);
    if (matches) {
      const match = {
        tagName: matches[1],
        attrs: [],
      };
      advance(matches[0].length); //解析之后就删除
      //继续解析标签的属性
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        //只要没有匹配到结束标签就一直匹配
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
        advance(attr[0].length); //解析一个属性删除一个
      }
      //这时候到结束标签了,去处理结束标签 >
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
  return root;
}

const ast = parserHTML(template);
console.log(ast);
