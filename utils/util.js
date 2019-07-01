const utilTwo = require('utilTwo.js');
//.net接口服务器
var API_net = 'https://xcxapi.bccoo.cn/appserverapi.ashx';
//const API_net = "http://appnewv5.bccoo.cn/appserverapi.ashx";
//const API_net = 'http://localhost:52511/appserverapi.ashx';
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 调用微信登入 */
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(res)
        }
      },
      fail: function (err) {
        reject(err)
      }
    })

  })
}

/** 获取用户信息 */
const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: function (res) {
        resolve(res)
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}
//获取小程序二维码
function GetXCXInfoQRCode(scene, page, siteId,fn) {
  var url='';
  let methodName = "PHSocket_GetXCXInfoQRCode";
  var params = requestParam(methodName, { scene: scene, page: page, siteId: siteId, id: 18 });
  request({
    url: API_net,
    data: { param: params },
    error: function (err) {
    },
    success: function (res) {
      if (res.MessageList.code == 1000) {
        url = res.ServerInfo.msg;
        console.log('url: ' + url);
      }
      fn && fn(url)
    }
  });
  return url;
}
//接口请求参数封装
function requestParam(method, params, apitype) {
  var requestTime = formatTime(new Date());
  var key = '+6Hp9X5zR39SOI6oP0685Bk77gG56m7PkV89xYvl86A=';
  var sign = utilTwo.hexMD5(key + method + requestTime);
  var ParData = function () {
    return {
      customerID: 8001,
      customerKey: sign,
      requestTime: requestTime,
      appName: "CcooCity",
      version: "5.3",
      Method: method,
      Param: params,
      ApiType: 0,
    };
  }
  return JSON.stringify(ParData());
}
//接口请求
const request = function (option) {
  let R_url = option.url || API_net;
  let R_data = option.data || {};
  let R_method = option.method || "GET";
  let R_token = wx.getStorageSync('token');
  console.log("网络请求地址:" + R_url)
  console.log(R_data)
  wx.request({
    url: R_url,
    data: R_data,
    method: R_method,
    header: {
      'Content-Type': 'application/json',
      'X-Nideshop-Token': R_token
    },
    success: function (res) {
      console.log(res)
      if (option.success && res.statusCode == 200) option.success(res.data);
      else if (option.error) option.error(res.statusCode);
    },
    fail: function (err) {
      console.log(err)
      if (option.error) option.error(err);
    },
    complete: function () {
      if (option.complete) option.complete();
    }
  });
}
//设置cookie  key,value,enddate[过期时间 单位分钟]
const Cookie_Set = function (option) {
  if (!option || !option.key) return false;
  var CookieData = {};
  var currentData = new Date();
  CookieData.Expires = currentData.setMinutes(currentData.getMinutes() + option.enddate);
  CookieData.Value = option.value;
  try {
    var flag = wx.setStorageSync(option.key, CookieData);
    return true;
  }
  catch (e) {
    return false;
  }
}
//获取cookie  key
const Cookie_Get = function (key) {

  if (!key) return null;
  var obj = wx.getStorageSync(key);
  if (!obj) return null;
  if (!obj.Expires) return null;
  if (!obj.Value) return null;
  var DateStr = Date.parse(new Date());
  if (obj.Expires < DateStr) {
    wx.removeStorageSync(key)
    return null;
  }
  return obj.Value;
}
const DateFormat = function (date, fmt) {
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "H+|h+": date.getHours(), //小时 --------*********仅支持24小时制**************
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "f+": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

const Getlocation = function (success,error) {
  //通过位置获取 站点列表 申请位置权限
  let login = getApp().globalData.loginInfo;
  // console.log("Getlocation开始" +login.siteId)
  if (login.siteId>0){
    if (success) success();
    return;
  }
  wx.authorize({
    scope: "scope.userLocation",
    fail: function (res) {
      console.log("获取手机位置失败");
      if (error)
      {
        if (error()==false){
        }else{
          wx.redirectTo({ url: "/pages/choicestation/station" });
        }
      }else{
        wx.redirectTo({ url: "/pages/choicestation/station" });
      }
    },
    success: function () {
      console.log("获取手机位置成功");
      //获取位置
      wx.getLocation({
        fail: res => {
          if (error) {
            if (error() == false) {
            } else {
              wx.redirectTo({ url: "/Pages/choicestation/station" });
            }
          } else {
            wx.redirectTo({ url: "/pages/choicestation/station" });
          }
        },
        success: res => {
          //获取位置成功 调用接口换取 推荐城市
          var latitude = res.latitude;
          var longitude = res.longitude;
          //获取位置成功 调用接口换取 推荐城市
          var params = requestParam("PHSocket_GetSiteMapCoordWeiInfo", { lat: latitude, lng: longitude, count: 5 },0);
          request({
            url: API_net,
            data: { param: params },
            error: function (err) { 
              if (error) {
                if (error() == false) {
                } else {
                  wx.redirectTo({ url: "/pages/choicestation/station" });
                }
              } else {
                wx.redirectTo({ url: "/pages/choicestation/station" });
              }
            },
            success: function (res) {
              if (!res || !res.MessageList || res.MessageList.code!=1000){
                if (error) {
                  if (error() == false) { } else { wx.redirectTo({ url: "/pages/choicestation/station" });}
                } else { wx.redirectTo({ url: "/pages/choicestation/station" }); }

              } else if (!res.ServerInfo || !res.ServerInfo.RecommendList || res.ServerInfo.RecommendList.length==0){
                
                if (error) {
                  if (error() == false) { } else { wx.redirectTo({ url: "/pages/choicestation/station" }); }
                } else { wx.redirectTo({ url: "/pages/choicestation/station" }); }

              }else{
                //console.log(res)
                console.log("Getlocation定位站点信息：siteid"+res.ServerInfo.RecommendList[0].SiteID + "|uid" + res.Extend.uid);
               var siteid=res.ServerInfo.RecommendList[0].SiteID;
               var uid = res.Extend.uid;
               if (siteid < 1 || uid<1){
                 if (error) {
                   if (error() == false) { } else { wx.redirectTo({ url: "/pages/choicestation/station" }); }
                 } else { wx.redirectTo({ url: "/pages/choicestation/station" }); }
                 return;
               }
               login.siteId = siteid;
               login.uid = uid;
               if (success) success(siteid, uid);
              }
            }
          });
        }
      });
    }
  });

};

module.exports = {
  request,
  login,
  getUserInfo,
  requestParam,
  formatNumber,
  api_net: API_net,
  Cookie_Set,
  Cookie_Get,
  DateFormat,
  Getlocation,
  GetXCXInfoQRCode
}