//index.js
//获取应用实例
const app = getApp();
var api = require('../../config/api.js');
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navIndex: 0,
    foter: [
      {
        isOpen: 1,
        url: '../index/index',
        txt: '头条',
        icon: 'icon-index'
      },
      {
        isOpen: 0,
        url: '../sole/sole',
        txt: '独家',
        icon: "icon-sole"
      },
      {
        isOpen: 1,
        url: '../hotList/hotList',
        txt: '热榜',
        icon: 'icon-hotList'
      },
      {
        isOpen: 1,
        url: '../drynessFire/drynessFire',
        txt: '爆文',
        icon: 'icon-drynessFire'
      }
    ],
    isLoad: true,
    shieldIsOpen: 0, //是否开启屏蔽 0：否 1：是	
    // dujiaIsOpen: 1, //独家
    // baowenIsOpen: 1, //爆文
    itemsList:[],
    holdBot: { //上拉加载样式
      show:true,
      text:'正在加载,请稍后',
      loading:true
    },
    page:{
      loadStatus:true,
      index:1,
      size:13
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let siteName = wx.getStorageSync('siteName');
    let areaName = wx.getStorageSync('areaName');
    //console.log('siteName--' + siteName + '||' + siteName.length);
    if(siteName.length==0){
      this.GetTouTiaoConfig();
      siteName = wx.getStorageSync('siteName');
      areaName = wx.getStorageSync('areaName');
    }
    
    //底部菜单
    this.setData({
      shieldIsOpen: wx.getStorageSync('shieldIsOpen'),
      'foter[1].isOpen': wx.getStorageSync('dujiaIsOpen'),
      'foter[3].isOpen': wx.getStorageSync('baowenIsOpen'),
    })

    // console.log('dujiaIsOpen-'+wx.getStorageSync('dujiaIsOpen'))
    // console.log('baowenIsOpen-' +wx.getStorageSync('baowenIsOpen'))
    
    if (this.data.shieldIsOpen==0){
      wx.setNavigationBarTitle({
        title: areaName + '精选头条'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '论坛精选'
      })
    }

    this.GetColumnInfoData();

    //utils.setPageTitle('站点地址请求URL');  //设置页面标题
  },
  //获取配置信息
  GetTouTiaoConfig: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetXCXTouTiaoConfig";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        if (res.MessageList.code == 1000) {
          app.globalData.dujiaIsOpen = res.ServerInfo.DujiaIsOpen;
          app.globalData.baowenIsOpen = res.ServerInfo.BaowenIsOpen;
          app.globalData.loginInfo.siteName = res.ServerInfo.SiteName;
          app.globalData.loginInfo.areaName = res.ServerInfo.AreaName;
          wx.setStorageSync('siteName', res.ServerInfo.SiteName);
          wx.setStorageSync('areaName', res.ServerInfo.AreaName);
          wx.setStorageSync('dujiaIsOpen', res.ServerInfo.DujiaIsOpen);
          wx.setStorageSync('baowenIsOpen', res.ServerInfo.BaowenIsOpen);
          wx.setStorageSync('shieldIsOpen', res.ServerInfo.ShieldIsOpen);

          //底部菜单
          that.setData({
            shieldIsOpen: res.ServerInfo.ShieldIsOpen,
            'foter[1].isOpen': res.ServerInfo.DujiaIsOpen,
            'foter[3].isOpen': res.ServerInfo.BaowenIsOpen,
          })

          if (that.data.shieldIsOpen == 0) {
            wx.setNavigationBarTitle({
              title: res.ServerInfo.AreaName + '精选头条'
            })
          } else {
            wx.setNavigationBarTitle({
              title: '论坛精选'
            })
          }
        }

      }
    });

  },
  //获取头条列表
  GetColumnInfoData: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetTouTiaoList";

    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo.length > 0) {
            index++
            that.setData({
              'holdBot.show': false,
              'page.loadStatus': true,
              'page.index': index,
              itemsList: res.ServerInfo
            })
          } else {
            that.setData({
              'holdBot.show': true,
              'holdBot.loading': false,
              'holdBot.text': ' 没有更多内容了~',
              'page.loadStatus': true
            })
          }
        } else {
          that.setData({
            'holdBot.show': false,
            'page.loadStatus': true
          })
        }
        that.setData({
          isLoad: false
        })
      }
    });

  },
  //翻页请求
  onReachBottom: function () {
    var that = this
    if (!this.data.page.loadStatus) return
    this.setData({
      'holdBot.show': true,
      'page.loadStatus': false
    })

    let methodName = "PHSocket_XCX_GetTouTiaoList";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, uid: app.globalData.loginInfo.uid});
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo.length > 0) {
            index++
            that.setData({
              'holdBot.show': false,
              'page.loadStatus': true,
              'page.index': index,
              itemsList: that.data.itemsList.concat(res.ServerInfo)
            })
          } else {
            that.setData({
              'holdBot.show': true,
              'holdBot.loading': false,
              'holdBot.text': ' 没有更多内容了~',
              'page.loadStatus': true
            })
          }
        } else {
          that.setData({
            'holdBot.show': false,
            'page.loadStatus': true
          })
        }
        //console.log(index)
      }
    });

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('siteName') +"精选头条"
    }
  },
 
})