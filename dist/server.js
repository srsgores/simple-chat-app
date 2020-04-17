"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireWildcard(require("express"));

var _socket = _interopRequireWildcard(require("socket.io"));

var _http = require("http");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Server = /*#__PURE__*/function () {
  function Server() {
    _classCallCheck(this, Server);

    _defineProperty(this, "httpServer", _http.Server);

    _defineProperty(this, "app", _express.Application);

    _defineProperty(this, "io", _socket.Server);

    _defineProperty(this, "activeSockets", []);

    _defineProperty(this, "DEFAULT_PORT", 5000);

    this.initialize();
  }

  _createClass(Server, [{
    key: "listen",
    value: function listen(callback) {
      var _this = this;

      this.httpServer.listen(this.DEFAULT_PORT, function () {
        callback(_this.DEFAULT_PORT);
      });
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this.app = (0, _express["default"])();
      this.httpServer = (0, _http.createServer)(this.app);
      this.io = (0, _socket["default"])(this.httpServer);
      this.configureApp();
      this.configureRoutes();
      this.handleSocketConnection();
    }
  }, {
    key: "configureApp",
    value: function configureApp() {
      this.app.use(_express["default"]["static"](_path["default"].join(__dirname, "../public")));
    }
  }, {
    key: "configureRoutes",
    value: function configureRoutes() {
      this.app.get("/", function (req, res) {
        res.sendFile("index.html");
      });
    }
  }, {
    key: "handleSocketConnection",
    value: function handleSocketConnection() {
      var _this2 = this;

      this.io.on("connection", function (socket) {
        var existingSocket = _this2.activeSockets.find(function (existingSocket) {
          return existingSocket === socket.id;
        });

        if (!existingSocket) {
          _this2.activeSockets.push(socket.id);

          socket.emit("update-user-list", {
            users: _this2.activeSockets.filter(function (existingSocket) {
              return existingSocket !== socket.id;
            })
          });
          socket.broadcast.emit("update-user-list", {
            users: [socket.id]
          });
        }

        socket.on("call-user", function (data) {
          socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id
          });
        });
        socket.on("make-answer", function (data) {
          socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer
          });
        });
        socket.on("reject-call", function (data) {
          socket.to(data.from).emit("call-rejected", {
            socket: socket.id
          });
        });
        socket.on("disconnect", function () {
          _this2.activeSockets = _this2.activeSockets.filter(function (existingSocket) {
            return existingSocket !== socket.id;
          });
          socket.broadcast.emit("remove-user", {
            socketId: socket.id
          });
        });
      });
    }
  }]);

  return Server;
}();

exports["default"] = Server;
//# sourceMappingURL=server.js.map