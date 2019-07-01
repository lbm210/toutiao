// pages/columnInfo/columnInfo.js
const app = getApp();
var util = require("../../utils/util.js");
var api = require('../../config/api.js');
const res = wx.getSystemInfoSync();
const windowWidth = res.windowWidth;
Page({
  data: {
    isLoad: true,
    id: 0,
    colinfId: 0,
    colinfTit:"",
    colinfPicUrl: "",
    colinfIconUrl:"",
    colinfName:"",
    colinfStateName:"",
    colinfPeriod:0,
    colinfAtten:0,
    columnArticleData: [],
    isShow: true,
    holdBot: { //上拉加载样式
      show:false,
      text:'正在加载中请稍后...',
      loading:true
    },
    page:{
      loadStatus:true,
      index:1,
      size:10
    },
    shieldIsOpen: 0, //是否开启屏蔽 0：否 1：是	
    txtIsShow:false, //展开是否显示
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    flag:false,
    saveBind:'savePoster',
    load_complete: false,//海报弹窗是否加载完成
    posterTip:'点击保存到手机相册',
    saveBtn:'保存',
    banner: '',
    logo:'',
    siteName:'',
    popTitle:'民生关注：白城师院附近发生暴力伤人事件，男子打人后扬长而去 民生关注：白城师院附近发生暴力伤人事件，男子打人后扬长而去',
    ewx:'',
    avatar:'',
    nickName:'',
    popSite:''
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this 

    // //二维码
    // var url = util.GetXCXInfoQRCode('id=' + options.id, 'pages/columnInfo/columnInfo', app.globalData.loginInfo.siteId, function (url) {
    //   wx.getImageInfo({
    //     src: url,
    //     success: function (res) {
    //       that.setData({
    //         ewx: res.path
    //       })
    //     }
    //   })
    // });
  
    wx.getImageInfo({
      src: 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/zd-logo.png',
      success: function (res) {
        that.setData({
          logo: res.path
        })
      }
    })

    let id = options.id;
    //console.log(id)
    this.setData({
      id: id,
      shieldIsOpen: wx.getStorageSync('shieldIsOpen'),
      siteName: wx.getStorageSync('siteName'),
      popSite: wx.getStorageSync('siteName') + '精选头条'
    })
    this.GetColumnInfoData();

    // wx.setNavigationBarTitle({
    //   title: wx.getStorageSync('siteName') + '精选头条'
    // })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log(res.userInfo)
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    

  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.shareFn()
  },
  //获取专栏详情和该专栏下面的列表
  GetColumnInfoData: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetColumnNewsList";
  
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, columnId: that.data.id });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        that.setData({
          isLoad: false
        })
        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo.length > 0) {
            index++
            that.setData({
              'holdBot.show': false,
              'page.loadStatus': true,
              'page.index': index,
              columnArticleData: res.ServerInfo,
              id: res.Extend.id,
              colinfId: res.Extend.colinfId,
              colinfTit: res.Extend.colinfTit,
              colinfPicUrl: res.Extend.colinfPicUrl,
              colinfIconUrl: res.Extend.colinfIconUrl,
              colinfName: res.Extend.colinfName,
              colinfStateName: res.Extend.colinfStateName,
              colinfPeriod: res.Extend.colinfPeriod,
              colinfAtten: res.Extend.colinfAtten,
            })
            wx.setNavigationBarTitle({
              title: res.Extend.colinfName
            })
          } else {
            that.setData({
              'holdBot.show': true,
              'holdBot.loading': false,
              'holdBot.text': ' 没有更多内容了~',
              'page.loadStatus': true
            })
          }
          var query = wx.createSelectorQuery()
          query.select('.js-toggle').boundingClientRect()
          query.exec(function (res) {
            console.log(res);  
            if (res[0].height > 40) {
              that.setData({
                txtIsShow: true,
                isShow: false
              })
            };
          })
        } else {
          that.setData({
            'holdBot.show': false,
            'page.loadStatus': true
          })
        }
     
      }
    });

  },
  //翻页请求
  onReachBottom:function(){
    var that = this
    if (!this.data.page.loadStatus) return
    this.setData({
      'holdBot.show': true,
      'page.loadStatus':false
    })

    let methodName = "PHSocket_XCX_GetColumnNewsList";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, page: that.data.page.index, columnId: that.data.id });
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
              columnArticleData: that.data.columnArticleData.concat(res.ServerInfo)
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
  toggle:function(e) {
      /*this.setData({
          flag: true
      });*/
    this.setData({
      isShow: !this.data.isShow
    })

  },
  //跳转
  goArticleInfo: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: `../headerline_column/headerline_column?id= ${id}`
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var pages = getCurrentPages() //获取加载的页面 
    var currentPage = pages[pages.length - 1] //获取当前页面的对象 
    var url = currentPage.route //当前页面url 
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
      return {
        title: res.target.dataset.tit,
        path: `/pages/headerline_column/headerline_column?id= ${res.target.dataset.id}`,
        imageUrl: res.target.dataset.pic
      }
    } else {
      //发送给好友
      return {
        title: wx.getStorageSync('siteName') + this.data.colinfName,
        imageUrl: '',
        path:`/pages/columnInfo/columnInfo?id=${this.data.id}`
      }
    }

  },/*海报弹窗*/
  shareFn: function (e) {
    // var newUrl = e.currentTarget.dataset.pic.replace('http://imgref.ccoo.cn/ajax/imgref.ashx?dis=_500x300(w)&url=', '')
    var times = 100;
    var that = this;
    var logo = this.data.logo;
    //var ewx = this.data.ewx;
    var ewx = '';
    //二维码
    var url = util.GetXCXInfoQRCode('id=' + e.currentTarget.dataset.id, 'pages/headerline_column/headerline_column', app.globalData.loginInfo.siteId, function (url) {
      wx.getImageInfo({
        src: url,
        success: function (res) {
          that.setData({
            ewx: res.path
          })
          ewx = res.path
        }
      })
    });
    
    // var banner= newUrl != ''?`https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${newUrl}`:"https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/pop-ban.jpg" 
    var banner= "https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/pop-ban.jpg" 
    this.setData({
      banner:banner
    })
    
 
    //如果有用户信息调用户信息
    if (this.data.userInfo != undefined) {
      this.setData({
        avatar: this.data.userInfo.avatarUrl,
        nickName: this.data.userInfo.nickName
      })
    }
    //如果没有用户信息调调默认头像
    var avatar = this.data.avatar;
    var nickName = this.data.nickName;
    this.setData({
      popTitle: e.currentTarget.dataset.title
    })
    
    wx.getImageInfo({
      src: banner,
      success: function (res) {
        console.log(res.path)
        banner= res.path
        wx.getImageInfo({
          src: `https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${avatar}`,
          success: function (res) {
            avatar = res.path
          }
        })
        wx.showToast({
          title: '生成中...',
          icon: 'loading',
          duration: 3000
        })
        var t = setInterval(function () {
          if ((banner != '' && avatar != '' && ewx != '' && nickName != '') || times <= 0) {
            clearInterval(t);
            that.setData({
              load_complete: true,
              flag: true,
              saveBind: 'savePoster',
              posterTip: '点击保存到手机相册',
              saveBtn: '保存',
            })
            that.createNewImg(banner, logo, ewx, avatar, nickName);
          } else {
            times = times - 1;
          }
        }, 2000);
      }
    })
  },/*关闭海报弹窗*/
  cancelShareFn: function (e) {
    //取消发给好友、生成卡片
    this.setData({
      flag: false,
    })
  },/*海报canvas*/
  createNewImg(banner, logo, ewx, avatar, nickName) {
    let that = this;
    that.factor = windowWidth / 750;
    let context = wx.createCanvasContext('mycanvas');
    context.setFillStyle("#fff");
    context.fillRect(0, 0, that.toPx(750), that.toPx(800));
    //banner图
    context.drawImage(banner, 0, 0, that.toPx(750), that.toPx(380));
    //logo
    context.drawImage(logo, that.toPx(30), that.toPx(30), that.toPx(48), that.toPx(48));
    //站点名称
    context.setTextAlign('left')
    context.setFontSize(that.toPx(30));
    context.setFillStyle('#fff');
    context.fillText(that.data.siteName, that.toPx(100), that.toPx(65));
    context.stroke();
    //title标题
    context.setTextAlign('left')
    context.setFontSize(that.toPx(40));
    context.setFillStyle('#333');
    this.wrapText(that, context, that.data.popTitle, that.toPx(28), that.toPx(468), that.toPx(468), that.toPx(710), 2, that.toPx(60));
    //二维码 
    if (ewx != '') {
      context.drawImage(ewx, that.toPx(20), that.toPx(580), that.toPx(136), that.toPx(136));
    }


    //绘制头像
    if (avatar != '') {
      console.log(avatar)
      context.save();
      var r = that.toPx(26);
      var d = that.toPx(26) * 2;
      var cx = that.toPx(180);
      var cy = that.toPx(600);
      context.beginPath();//开始一个新的路径
      context.arc(cx + r, cy + r, r, 0, 2 * Math.PI);
      context.clip();
      context.drawImage(avatar, that.toPx(180), that.toPx(600), that.toPx(52), that.toPx(52));
      context.restore();
      context.closePath();//关闭当前路径
    }
    //昵称
    var redLef;
    if (nickName) {
      context.setTextAlign('left')
      context.setFontSize(that.toPx(30));
      context.setFillStyle('#000');
      context.fillText(nickName, that.toPx(245), that.toPx(640));
      //正在读这篇文章
      redLef = nickName.length * 30 + 255
      context.setTextAlign('left')
      context.setFontSize(that.toPx(30));
      context.setFillStyle('#666');
      context.fillText('正在读这篇文章', that.toPx(redLef), that.toPx(640));
    }
    //长按小程序码
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#666');
    context.fillText('长按小程序码，进入', that.toPx(180), that.toPx(690));
    //站点
    var site = that.data.popSite
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#ee2e2e');
    context.fillText(site, that.toPx(400), that.toPx(690));
    //查看详情
    var seeInfoLef = site.length * 24 + 410
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#666');
    context.fillText('查看详情', that.toPx(seeInfoLef), that.toPx(690));


    context.draw();
    // setTimeout(function () {
    //   wx.canvasToTempFilePath({
    //     canvasId: 'mycanvas',
    //     success: function (res) {
    //       let tempFilePath = res.tempFilePath;
    //       that.setData({
    //         imagePath: tempFilePath,
    //         canvasHidden: true
    //       });
    //     },
    //     fail: function (res) {
    //       console.log(res);
    //     }
    //   },this);
    // }, 200);
  },/*海报保存*/
  savePoster(e) {
    var _this = this
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 2000
    })
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(result) {
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 2000
            })
            _this.setData({
              saveBind: 'cancelShareFn',
              posterTip: '已保存至相册，快去朋友圈分享吧',
              saveBtn: '知道了'
            })
          }
        })
      }
    })
  },/*px转rpx*/
  toPx(rpx) {
    return rpx * this.factor;
  },/*换行并多行隐藏*/
  wrapText(that, context, text, x, y, oriY, maxWidth, lineNum, lineHeight) {
    // 字符分隔为数组
    var arrText = text.split('');
    var line = '';

    for (var n = 0; n < arrText.length; n++) {
      var testLine = line + arrText[n];
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = arrText[n];
        if (y < (oriY + (lineNum - 1) * lineHeight)) {
          y += lineHeight;
        } else {
          return;
        }
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }
})