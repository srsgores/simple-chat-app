"use strict";

var _server = _interopRequireDefault(require("./server"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var server = new _server["default"]();
server.listen(function (port) {
  console.log("Server is listening on http://localhost:".concat(port));
});
//# sourceMappingURL=init-server.js.map