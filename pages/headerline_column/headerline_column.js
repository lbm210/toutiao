// pages/headerline/headerline.js
//获取应用实例
const app = getApp();
var util = require("../../utils/util.js");
var api = require('../../config/api.js');
const res = wx.getSystemInfoSync();
const windowWidth = res.windowWidth;
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    isLoad: true,
    shieldIsOpen: 0, //是否开启屏蔽 0：否 1：是
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    detailId:'',// 文章ID
    detaileData:{ // 文章内容
    },
    pinglun: [ //文章评论列表
    ],
    itemsList: [ // 可能感兴趣的
    ],
    zhuanlan:{
      title:'',
      url:''
    },
    memoPart: '',
    type: 0, //0：内容较少 1：内容较多
    num: 1, //内容层数
    flag:false,
    saveBind:'savePoster',
    load_complete: false,//海报弹窗是否加载完成
    posterTip:'点击保存到手机相册',
    saveBtn:'保存',
    banner: '',
    logo: '',// 站点logo
    siteName:'',
    popTitle:'',
    ewx: '',
    avatar:'', //微信用户头像
    nickName: '', //微信用户昵称
    popSite:'',
    sharePic: '',
    shareRead: true
  },
  onLoad: function (option) {
    var that = this;

    // //二维码
    // var url = util.GetXCXInfoQRCode('id=' + option.id, 'pages/headerline_column/headerline_column', app.globalData.loginInfo.siteId, function (url) {
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

    let id = option.id;
    //console.log(id)
    this.setData({
      detailId: id,
      //detailId: 29555275,
      siteName: wx.getStorageSync('siteName'),
      popSite: wx.getStorageSync('siteName') +'精选头条'
    })
    
    wx.setStorageSync('site', app.globalData.loginInfo.siteName)
    this.setData({
      site: wx.getStorageSync('site'),
      shieldIsOpen: wx.getStorageSync('shieldIsOpen')
    })
    //utils.setPageTitle('站点地址请求URL');  //设置页面标题

    if (this.data.shieldIsOpen == 0) {
      wx.setNavigationBarTitle({
        title: '详情'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '帖子详情'
      })
    }

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
    
    // 获取详情,文章id
    that.GetCnewsInfoData();
  },
  onShareAppMessage: function (res) {

    var pages = getCurrentPages() //获取加载的页面 
    var currentPage = pages[pages.length - 1] //获取当前页面的对象 
    var url = currentPage.route //当前页面url 
    var sharePic = this.data.sharePic;
    //发送给好友
    return {
      title: this.data.detaileData.title,
      path: `${url}?id=${this.data.detailId}`,
      imageUrl: ''
    }
  },
  // 获取详情
  GetCnewsInfoData: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetCityNewsInfo";
    //console.log('id' + that.data.detailId)
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, newsID: that.data.detailId });
    
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        // var newUrl = res.ServerInfo.detaileData[0].Images.length > 0 ? res.ServerInfo.detaileData[0].Images.replace('http://imgref.ccoo.cn/ajax/imgref.ashx?dis=_500x300(w)&url=', '') : '';
        if (res.MessageList.code == 1000) {
          //信息不存在时
          if (res.ServerInfo == null) {
            wx.showLoading({
              title: '该信息已被删除',
              duration: 1500,
              success: function (e) {
                setTimeout(function () {
                  wx.navigateBack()
                }, 1000)
              }
            })
          }

          //if (res.ServerInfo) {
            that.setData({
              detaileData: res.ServerInfo.detaileData[0],
              type: res.ServerInfo.type,
              pinglun: res.ServerInfo.pinglun,
              itemsList: res.ServerInfo.itemsList,
              zhuanlan: res.ServerInfo.zhuanlan,
              popTitle: res.ServerInfo.detaileData[0].title,
              sharePic: res.ServerInfo.detaileData[0].Images.length > 0 ? res.ServerInfo.detaileData[0].Images : "http://img.pccoo.cn/headline-xcx/images/pop-ban.jpg",
              // banner: res.ServerInfo.detaileData[0].Images.length > 0 ? `https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${newUrl}` : "https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/pop-ban.jpg"  
              banner: "https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/pop-ban.jpg"   
            })
          // 设置查看更多
          let arr = that.data.pinglun.map(function (item, index) {
            item.moreTxt = `更多${item.moreLength}条回复`
            return item
          })
          that.setData({
            pinglun: arr
          })
           
          var article = that.data.detaileData.content;     // 这里是ajax请求数据
          //console.log(that.data.detaileData.content)
          WxParse.wxParse('article', 'html', article, that, 0);
         
          if (that.data.type == 1) {
            that.GetCnewsInfoDataPart();
          }

          wx.getImageInfo({
            src: that.data.banner,
            success: function (res) {
              console.log(res.path)
              that.setData({
                banner: res.path
              })
            }
          })
        } else {
          wx.showLoading({
            title: '网络出现故障',
            duration: 1500
          })
        }
        that.setData({
          isLoad: false
        })
      }
    });

  },
  //内容过多时，请求内容的下半部分
  GetCnewsInfoDataPart: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetCityNewsInfoModuleOne";
    //console.log('id' + that.data.detailId)
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, newsID: that.data.detailId, num: that.data.num });

    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        if (res.MessageList.code == 1000) {
          that.setData({
            num: res.ServerInfo.num,
            type: res.ServerInfo.type,
            memoPart: res.ServerInfo.content,
          })
          var memoPart = that.data.memoPart;     // 这里是ajax请求数据
          //console.log(memoPart)
          WxParse.wxParse('memoPart' + that.data.num, 'html', memoPart, that, 0);
          //多层请求
          if (that.data.type == 1) {
            that.GetCnewsInfoDataPart();
          }

          wx.getImageInfo({
            src: that.data.banner,
            success: function (res) {
              console.log(res.path)
              that.setData({
                banner: res.path
              })
            }
          })
        } else {
          wx.showLoading({
            title: '网络出现故障',
            duration: 1500
          })
        }
        that.setData({
          isLoad: false
        })
      }
    });

  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.shareFn()
  },
  more:function(e){
    let index = Number(e.currentTarget.id)
    console.log(this.data.pinglun[0].childMax)
    let arr = [];
    let query = wx.createSelectorQuery();

    if (this.data.pinglun[index].childMax != 2){
      arr = this.data.pinglun.map(function (item,index){
        if (index == e.currentTarget.id){
          item.childMax = 2
          item.moreTxt = `更多${item.moreLength}条回复`
        }
        return item
      })
    }else{
      arr = this.data.pinglun.map(function (item, index) {
        if (index == e.currentTarget.id) {
          item.childMax = item.length
          item.moreTxt = '收起'
        }
        return item
      })
    }
    this.setData({
      pinglun: arr
    })
  },/*海报弹窗*/
  shareFn: function (e) {
    var times = 100;
    var that = this;
    var banner = this.data.banner;
    var logo = this.data.logo;
    //var ewx = this.data.ewx;
    var ewx = '';
    //二维码
    var url = util.GetXCXInfoQRCode('id=' + that.data.detailId, 'pages/headerline_bbs/headerline_bbs', app.globalData.loginInfo.siteId, function (url) {
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
    var avatar

    //如果有用户信息调用户信息
    if (this.data.userInfo != undefined) {
      this.setData({
        avatar: this.data.userInfo.avatarUrl,
        nickName: this.data.userInfo.nickName
      })
    }
    //如果没有用户信息调调默认头像
    avatar = this.data.avatar;
    var nickName = this.data.nickName;
    wx.getImageInfo({
      src: `https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${avatar}`,
      success: function (res) {
        avatar = res.path
      }
    })
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000
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
    // }, 1000);
  },/*海报保存*/
  savePoster (e){
    if (!this.data.shareRead) return
    this.setData({
      shareRead: false
    })
    var _this = this
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 3000
    }) 
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(result) {
              _this.setData({
                shareRead: true
              })
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
    }, 3000)
  },/*px转rpx*/
  toPx(rpx) {
    return rpx * this.factor;
  },/*换行并多行隐藏*/
  wrapText(that, context, text, x, y,oriY,maxWidth,lineNum,lineHeight) {
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