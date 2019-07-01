//app.js
var util = require("/utils/util.js");
var api = require('/config/api.js');
App({
  onLaunch: function () {
    //展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    var that = this
   
    //读取配置文件信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    //console.log(extConfig)
    if (extConfig){
      that.globalData.loginInfo.siteId = extConfig.siteid;
      that.globalData.loginInfo.uid = extConfig.uid;
    }

    // that.globalData.loginInfo.siteId = 1507;
    // that.globalData.loginInfo.uid = 1614;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        var that = this
        let methodName = "PHSocket_XCX_GetXCXTouTiaoConfig";
        var params = util.requestParam(methodName, { siteID: that.globalData.loginInfo.siteId, uid: that.globalData.loginInfo.uid });
        util.request({
          url: api.ApiRootUrl,
          data: { param: params },
          error: function (err) {
          },
          success: function (res) {

            if (res.MessageList.code == 1000) {
              that.globalData.dujiaIsOpen = res.ServerInfo.DujiaIsOpen;
              that.globalData.baowenIsOpen = res.ServerInfo.BaowenIsOpen;
              that.globalData.loginInfo.siteName = res.ServerInfo.SiteName;
              that.globalData.loginInfo.areaName = res.ServerInfo.AreaName;
              wx.setStorageSync('siteName', res.ServerInfo.SiteName);
              wx.setStorageSync('areaName', res.ServerInfo.AreaName);
              wx.setStorageSync('dujiaIsOpen', res.ServerInfo.DujiaIsOpen);
              wx.setStorageSync('baowenIsOpen', res.ServerInfo.BaowenIsOpen);
              wx.setStorageSync('shieldIsOpen', res.ServerInfo.ShieldIsOpen);
            }
          }
        });

      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    dujiaIsOpen: 1, //独家
    baowenIsOpen: 1, //爆文
    userInfo: null,
    loginInfo: {
      // siteId: 1507,
      // siteName: '',
      // uid: 1614,
      siteId: 0,
      siteName: '',
      areaName:'',
      uid: 0,
    },
  }
  
})