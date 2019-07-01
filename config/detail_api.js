let util = require("../utils/util.js");
let api = require('../config/api.js');
let res = null;

function FudaiActionInfo(data) { //活动详情
  let params = util.requestParam("PHSocket_SetFudaiUserInfo", "'acID':" + data.id + ",'uid':" + data.uid + ",'siteID':" + data.siteID + ",'OpenID':" + "'" + data.openid + "'" + ",'nick':" + "'" + data.nickName + "'" + ",'img':" + "'" + data.avatarUrl + "'" + "");
  util.request(api.ApiRootUrl, { param: params }).then(function(res) {
    console.log(res)
    res = res
  })
  return res
}
module.exports = {
  FudaiActionInfo
}