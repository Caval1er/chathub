const { ResultConstant } = require("./constants");
class ResponseResult {
  constructor(code, msg, data) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
  static success(res, data, message = ResultConstant.SUCCESS_MESSAGE) {
    const result = new ResponseResult(
      ResultConstant.SUCCESS_CODE,
      message,
      data
    );
    res.status(200).json(result);
  }
  static fail(
    res,
    message = ResultConstant.FAIL_MESSAGE,
    code = ResultConstant.FAIL_CODE
  ) {
    const result = new ResponseResult(code, message, null);
    res.status;
    res.status(200).json(result);
  }
  static sendResponseManual(res, code, message, data, status = 200) {
    const msg = message ? message : ResultConstant.FAIL_MESSAGE;
    const result = new ResponseResult(code, msg, data);
    res.status(status).json(result);
  }
}

module.exports = ResponseResult;
