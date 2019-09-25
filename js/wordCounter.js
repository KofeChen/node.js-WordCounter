const events = require('events')
const fg = require("./getFileInfo")

// 存储用户命令结果
var commandsObj = {
  lines: false,
  words: false,
  chars: false,
  recursive: false,
  codes: false,
  gui: false,
  fName: "",
  fPath: ""
}

// 事件发布订阅中心
const ec = new events()
const EventCenter = {
  on: function(type, handle) {
    ec.on(type, handle)
  },
  fire: function(type, data) {
    ec.emit(type, data)
  }
}

// 处理用户命令
const argsHandle = function(argArr) {
  let files = []
  argArr.forEach(function(key, index, arr) {
    switch(key) {
      case '-l': commandsObj.lines = true
        break
      case '-w': commandsObj.words = true
        break
      case '-c': commandsObj.chars = true
        break
      case '-s': commandsObj.recursive = true
        break
      case '-a': commandsObj.codes = true
        break
      case '-x': commandsObj.gui = true
        break
      default: files.push(key)
        break
    }
  })
  files.forEach(function(key) {
    if (key.match(/:/g)) { commandsObj.fPath = key }
    else { commandsObj.fName = key }
  })
}

// 接收数据并订阅事件
var WC = {
  init: function() {
    this.bind()
  },
  bind: function() {
    this.isShowGui = false
    var _this = this
    EventCenter.on("getLines", function(data) {
      _this.isShowGui = commandsObj.gui
      fg.getFileLines(data.fName, data.fPath, _this.isShowGui)
    })
    EventCenter.on("getWords", function(data) {
      _this.isShowGui = commandsObj.gui
      fg.getFileWords(data.fName, data.fPath, _this.isShowGui)
    })
    EventCenter.on("getChars", function(data) {
      _this.isShowGui = commandsObj.gui
      fg.getFileChars(data.fName, data.fPath, _this.isShowGui)
    })
    EventCenter.on("recursiveDir", function(data) {
      _this.isShowGui = commandsObj.gui
      fg.recursiveDir(data.fPath, data.fName, _this.isShowGui)
    })
    EventCenter.on("getCodes", function(data) {
      _this.isShowGui = commandsObj.gui
      fg.getFileCodes(data.fPath, data.fName, _this.isShowGui)
    })
  }
}

// 解析用户命令并发布事件
var User = {
  setCommands: function() {
    let commands = process.argv.splice(2)
    argsHandle(commands)
    this.emitEvent()
  },
  emitEvent: function() {
    let fileName = commandsObj.fName
    let filePath = commandsObj.fPath
    if (commandsObj.lines) {
      EventCenter.fire("getLines", { 
        fName: fileName,
        fPath: filePath
      })
    }
    if (commandsObj.words) {
      EventCenter.fire("getWords", {
        fName: fileName,
        fPath: filePath
      })
    }
    if (commandsObj.chars) {
      EventCenter.fire("getChars", {
        fName: fileName,
        fPath: filePath
      })
    }
    if (commandsObj.recursive) {
      EventCenter.fire("recursiveDir", {
        fName: fileName,
        fPath: filePath
      })
    }
    if (commandsObj.codes) {
      EventCenter.fire("getCodes", {
        fName: fileName,
        fPath: filePath
      })
    }
  }
}

// 先初始化WC，再处理用户命令执行
WC.init()
User.setCommands()