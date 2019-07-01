//index.js  爆文
//获取应用实例
const app = getApp();
var util = require("../../utils/util.js");
var api = require('../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navIndex: 3,
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
    // dujiaIsOpen: 1, //独家
    // baowenIsOpen: 1, //爆文
    itemsList:[],
    holdBot: { //上拉加载样式
      show:false,
      text:'正在加载,请稍后',
      loading:true
    },
    page:{
      loadStatus:true,
      index:1,
      size:10
    }
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    //底部菜单
    this.setData({
      'foter[1].isOpen': wx.getStorageSync('dujiaIsOpen'),
      'foter[3].isOpen': wx.getStorageSync('baowenIsOpen'),
    })

    this.GetColumnInfoData();

    // wx.setNavigationBarTitle({
    //   title: wx.getStorageSync('siteName') + '精选头条'
    // })

  },
  weixinlink: function (e) {
    //console.log(e)
    let url = e.currentTarget.dataset.url
    wx.setStorageSync('wxUrl', url)
    //console.log(url)
    wx.navigateTo({
      url: `../weixinlink/weixinlink`
    });
  },
  //获取爆文分页列表
  GetColumnInfoData: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetBaoWenList";
    
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, uid: app.globalData.loginInfo.uid });
    //var params = util.requestParam(methodName, { siteID: 1068, page: that.data.page.index, uid: app.globalData.loginInfo.uid });
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

    let methodName = "PHSocket_XCX_GetBaoWenList";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, uid: app.globalData.loginInfo.uid });
    //var params = util.requestParam(methodName, { siteID: 1068, page: that.data.page.index });
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
  //详情跳转
  // goArticleInfo: function (e) {
  //   let id = e.currentTarget.id;
  //   // console.log(id)
  //   // return
  //   wx.navigateTo({
  //     url: `../headerline/headerline?id= ${id}`
  //   });
  // },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('siteName') + "微信爆文"
    }
  },

})