const fs = require('fs')
const {exec} = require("child_process");

var fileObj = []

const setDir = function() {
  var h = setHtml()
  fs.writeFile("..\\html\\showGui.html", h, 'UTF-8', function(err) {
    if (err) { console.log(err) }
    else {
      console.log("文件正在打开...")
    }
  })
}

const setHtml = function() {
  var html = 
  `<!DOCTYPE html>
    <head>
      <meta charset='UTF-8'>
      <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
      <button class="selectBtn">选择文件</button>
      <div class="layout">
  `
  fileObj.forEach(function(key) {
    html += `<ul class="file">
    <a href="${key.filePath + "\\" + key.fileName}">文件名：${key.fileName}</a>
    <p>路径：${key.filePath}</p>
    文件信息如下：
    <li class="${key.lines !== '' ? 'lines' : ''}">
      行数：${key.lines}
    </li>
    <li class="${key.words !== '' ? 'words' : ''}">
      单词数：${key.words}
    </li>
    <li class="${key.chars !== '' ? 'chars' : ''}">
      字符数：${key.chars}
    </li>
    <li class="${key.codes !== '' ? 'codes' : ''}">
      代码行数：${key.codes}
    </li>
    <li class="${key.comments !== '' ? 'comments' : ''}">
      注释数：${key.comments}
    </li>
    <li class="${key.emptyLines !== '' ? 'emptyLines' : ''}">
      空行数：${key.emptyLines}
    </li>
    </ul>`
  })
  html += 
  `
      </div>
      <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
      <script src="../js/btn.js"></script>
    </body>
  </html>
  `
  return html
} 

const openGUI = function (url) {
  switch (process.platform) {
      case "darwin":
          exec(`open ${url}`);
      case "win32":
          exec(`start ${url}`);
          // 默认mac系统
      default:
          exec(`open ${url}`);
  }
}

const getData = function(data) {
  // 传数据
  fileObj = data
  setDir()
  setTimeout(function() {
    openGUI("../html/showGui.html")
  }, 500)
}

module.exports = { getData }