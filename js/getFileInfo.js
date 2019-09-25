const fs = require('fs');
const path = require('path')
const readline = require('readline')
const setData = require('./setGui')

var htmlObj = []

const readLineHandle = function(fileName, fPath) {
  let filePath
  if (fPath) {
    filePath = path.join(fPath, fileName)
  } else {
    filePath = path.join(__dirname, fileName)
  }
  let input = fs.createReadStream(filePath)
  return readline.createInterface({
    input: input
  })
}

// 统计行数 & 空行数
const getFileLines = function(fileName, fpath, isShowGui) {
  const gl = readLineHandle(fileName, fpath)
  let lines = 0
  let emptyLines = 0
  gl.on('line', function(line) {
    lines ++
    if (!line.match(/[^\s]/g)) { emptyLines ++ }
  })

  gl.on('close', function() {
    if (!isShowGui) {
      console.log(`文件：${fileName} 的行数为：${lines}，空行数为：${emptyLines}`)
    } else {
      htmlObj.push({
        filePath: fpath,
        fileName: fileName,
        lines: lines, 
        words: "", chars: "", codes: "", comments: "",
        emptyLines: emptyLines
      })
    }
  })
}

// 统计单词数
const getFileWords = function(fileName, fpath, isShowGui) {
  const gw = readLineHandle(fileName, fpath)
  let words = []
  gw.on('line', function(line) {
    let newLine = line.replace(/[^a-zA-Z\s]+/g, ' ')
    let lineArr = newLine.match(/\b\w+\b/g)
    if (lineArr) { words = words.concat(lineArr) }
  })

  gw.on('close', function() {
    if (!isShowGui) {
      console.log(`文件：${fileName} 的单词数为：${words.length}`)
    } else {
      htmlObj.push({
        filePath: fpath,
        fileName: fileName,
        lines: "",
        words: words.length,
        chars: "", codes: "", comments: "", emptyLines: ""
      })
    }
  })
}

// 统计字符数
const getFileChars = function(fileName, fpath, isShowGui) {
  const gc = readLineHandle(fileName, fpath)
  let chars = []
  let ch = []
  gc.on('line', function(line) {
    if (line.match(/[\u4E00-\u9FA5]/g)) {
      ch = ch.concat(line.match(/[\u4E00-\u9FA5]/g))
    }
    if (line.match(/[^\s]/g)) { 
      chars = chars.concat(line.match(/[^\s]/g)) 
    }
  })

  gc.on('close', function() {
    if (!isShowGui) {
      console.log(`文件：${fileName} 的字符数为：${chars.length+ch.length}`)
    } else {
      htmlObj.push({
        filePath: fpath,
        fileName: fileName,
        lines: "", words: "",
        chars: chars.length+ch.length,
        codes: "", comments: "", emptyLines: ""
      })
    }
  })
}

// 获取文件的多数信息
const getFileInfo = function(fileName, filePath, isShowGui) {
  const gi = readLineHandle(fileName, filePath)
  let lines = 0
      , emptyLines = 0
      , words = []
      , chars = []
      , ch = []
  gi.on('line', function(line) {
    lines ++
    if (!line.match(/[^\s]/g)) { emptyLines ++ }

    let newLine = line.replace(/[^a-zA-Z\s]+/g, ' ')
    let lineArr = newLine.match(/\b\w+\b/g)
    if (lineArr) { words = words.concat(lineArr) }

    if (line.match(/[\u4E00-\u9FA5]/g)) {
      ch = ch.concat(line.match(/[\u4E00-\u9FA5]/g))
    }
    if (line.match(/[^\s]/g)) { 
      chars = chars.concat(line.match(/[^\s]/g)) 
    }
  })

  gi.on('close', function() {
    if (!isShowGui) {
      console.log(`文件${path.join(filePath, fileName)}的统计数据如下：
      行数：${lines}，空行数：${emptyLines}；
      单词数：${words.length}；
      字符数：${ch.length + chars.length}。
      ---------------------------
      `)
    } else {
      htmlObj.push({
        filePath: filePath,
        fileName: fileName,
        lines: lines,
        words: words.length,
        chars: ch.length + chars.length,
        codes: "", comments: "",
        emptyLines: emptyLines
      })
    }
  })
}

// 从完整路径中分离出需要匹配的文件名 | 通配
const regHandle = function(reg) {
  let fileReg
  let tmp
  if (reg.match(/\*/g)) {
    tmp =  reg.match(/\.[a-zA-Z]+$/)
    fileReg = new RegExp(tmp)
    return fileReg
  } else { 
    tmp = reg.match(/[^\s]+\.[a-zA-Z]+$/)
    fileReg = new RegExp(tmp)
    return fileReg
  }
}

// 递归处理多个文件
var reg = null
const recursiveDir = function(filePath, matching, isShowGui) {
  if (reg === null) {   // 避免递归时改变
    reg = regHandle(matching) 
  }
  fs.readdir(filePath, function(err, files) {
    if (err) { console.log(err) }
    else {
      files.forEach(function(fileName) {
        var fileDir = path.join(filePath, fileName)
        fs.stat(fileDir, function(eror, stats) {
          if (eror) { console.log("获取文件stats失败") }
          else {
            var isFile = stats.isFile()
            var isDir = stats.isDirectory()
            if (isFile) {
              if (fileName.match(reg)) {
                fs.access(fileDir, fs.constants.R_OK, function(err) {
                  if (err) {console.log(fileDir + "不可读")}
                  else {
                    getFileInfo(fileName, filePath, isShowGui)
                  }
                })
              }
            }
            if (isDir) { recursiveDir(fileDir, matching, isShowGui) }
          }
        })
      })
    }
  })
}

// 获取文件的代码行，注释行和空行
var regC = null
const getFileCodes = function(filePath, matching, isShowGui) {
  if (regC === null) {
    regC = regHandle(matching)
  }
  fs.readdir(filePath, function(err, files) {
    if (err) { console.log(err) }
    else {
      files.forEach(function(fileName) {
        var srcPath = path.join(filePath, fileName)
        fs.stat(srcPath, function(err, stats) {
          if (err) { console.log(err) }
          if (stats.isDirectory()) {
            getFileCodes(srcPath, matching, isShowGui)
          }
          if (stats.isFile()) {
            if (fileName.match(regC)) {
              let allLines = 0
              let comments = 0
              let emptyLines = 0 
              const input = fs.createReadStream(srcPath)
              const cr = readline.createInterface({ input: input })
              cr.on('line', function(line) {
                allLines++
                if (!line.match(/[^\s]/g)) { emptyLines ++ }
                if (line.match(/[\/\/] | [\/\*\*\/]/g)) { comments++ }
              })
              cr.on('close', function() {
                if (!isShowGui) {
                  console.log(`${srcPath} 
                  文件的代码行数为：${allLines-emptyLines}，
                  注释行数为：${comments}
                  空行数为：${emptyLines}
                  -----------------------------
                  `)
                } else {
                  htmlObj.push({
                    filePath: filePath,
                    fileName: fileName,
                    lines: "", words: "", chars: "",
                    codes: allLines-emptyLines,
                    comments: comments,
                    emptyLines: emptyLines
                  })
                }
              })
            }
          }
        })
      })
    }
  })
}

setTimeout(function() {
  if (htmlObj.length > 0) {
    setData.getData(htmlObj)
  }
}, 500)

module.exports = {
  getFileInfo,
  getFileLines,
  getFileWords,
  getFileChars,
  recursiveDir,
  getFileCodes
}
