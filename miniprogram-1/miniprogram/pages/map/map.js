// miniprogram/pages/map/map.js
var QQMapWX = require('../../qqmap-wx-jssdk.js');
var qqmapsdk = null;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapdetails: null,
    markers: [],
    covers: [],
    userRemark: "",
    latitude: "",
    longitude: "",
    address: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.globalData.cloudPath = "";
    app.globalData.fileID = "";
    app.globalData.filePath = "";
    //this.onLoad();

    var that = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res1 => {
              this.setData({
                islogin: true
              });
              app.globalData.userInfo = res1.userInfo;
              wx.getLocation({
                type: "gcj02",
                success(res2) {
                  var latitude = res2.latitude;
                  var longitude = res2.longitude;
                  var avatarUrl = app.globalData.userInfo.avatarUrl;
                  var address = that.returnAddress(latitude, longitude);
                  that.setData({
                    latitude: latitude,
                    longitude: longitude,
                    address: address
                  });
                },
                fail: function (xhy) {
                  console.log(xhy);
                }
              });

              wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: function (res3) {
                  console.log('[云函数] [login] 调用成功', res3);
                  wx.setStorageSync("_openid", res3.result.userInfo.openId);
                },
                fail: function (err) {
                  console.error('[云函数] [login] 调用失败', err)
                }
              });

              var db = wx.cloud.database();
              const todos = db.collection('clockrecord').where({
                "_openid": wx.getStorageSync("_openid")
              }).get({
                success: function (res4) {
                  that.setData({
                    maprecord: res4.data
                  });
                  that.initMap();
                },
                fail: function (xhy) {
                  console.log(xhy);
                }
              });
            }
          });
        } else {
          console.log(3);
          wx.showModal({
            title: "提示",
            content: "请先到我的页面登录",
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: "/pages/mine/mine"
                });
              }
            }
          });
        }
      }
    });
  },
  initMap: function () {
    var that = this;
    var maprecord = that.data.maprecord;
    var markersArr = new Array();

    for (var i = 0; i < maprecord.length; i++) {
      var obj = maprecord[i];
      var markers = {};
      markers.id = "-1";
      markers.latitude = obj.latitude;
      markers.longitude = obj.longitude;
      markers.iconPath = obj.avatarUrl;
      markers.width = 50;
      markers.height = 50;
      markers.circles = true;
      markersArr.push(markers);
    }
    that.setData({
      markers: markersArr
    });
  },
  returnAddress: function (latitude, longitude) {
    var that = this;
    var address = "";
    /**var db = wx.cloud.database();
    const todos = db.collection('clockset').get({
      success: function (res) {
        that.setData({
          mapdetails: res.data
        });
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    })**/
    // 实例化腾讯地图API核心类QQMapWX
    qqmapsdk = new QQMapWX({
      key: 'H4JBZ-FDN3D-WJ24S-P3AN7-6XC7E-C2FJ2' // 必填
    });
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (addressRes) {
        console.log("代理地址")
        console.log(addressRes);
        address = addressRes.result.formatted_addresses.recommend;
        that.setData({
          address: address
        });
        return address;
      },
      fail: function (xhy) {
        console.log(xhy);
        return "";
      }
    });
  },

  // 上传图片
  doUpload: function () {
    var that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        app.globalData.fileID = "";
        app.globalData.cloudPath = "";
        app.globalData.filePath = "";

        const filePath = res.tempFilePaths[0];
        console.log("filePath:" + filePath);
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`;
        console.log("cloudPath:" + cloudPath);

        wx.getFileSystemManager().readFile({
          filePath: filePath, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res1 => { //成功的回调
            wx.cloud.callFunction({
              name:'file',
              data:{
                path: 'pictures/' + new Date()+'.png',
                file: res1.data
              },
              success(_res){
               
                console.log(_res)
              },fail(_res){
                console.log(_res)
              }
            })
          }
        })





        return;
        
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res2 => {
            console.log('[上传文件] 成功：', res2)
            app.globalData.fileID = res2.fileID;
            app.globalData.cloudPath = cloudPath;
            app.globalData.filePath = filePath;
            that.setData({
              imgUrl: filePath
            });
            wx.hideLoading();
          },
          fail: e => {
            console.error('1[上传文件] 失败：', e);
            wx.showModal({
              title: "提示",
              content: e + "-",
              showCancel: false,
            });
            // wx.showToast({
            //   icon: 'none',
            //   title: '上传失败',
            // })
          },
          complete: (eeee) => {
            console.log(eeee);
            wx.hideLoading();
          }
        });
      },
      fail: e1 => {
        console.error(e1)
      }
    })
  },

  //备注
  getUserRemark: function (e) {
    this.setData({
      userRemark: e.detail.value
    })
  },
  clock: function () {
    var that = this;
    var userRemark = that.data.userRemark;
    var fileID = app.globalData.fileID;
    if (that.data.latitude == null || that.data.latitude == '' || that.data.longitude == null || that.data.longitude == '') {
      wx.showModal({
        title: "提示",
        content: "获取位置失败",
        showCancel: false
      });
      return;
    }
    if (fileID == null || fileID == '') {
      wx.showModal({
        title: "提示",
        content: "不拍点照片记录一下么？",
        showCancel: false
      });
      return;
    }
    if (userRemark == null || userRemark == '') {
      wx.showModal({
        title: "提示",
        content: "说点什么吧~",
        showCancel: false
      });
      return;
    }

    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.setStorageSync("_openid", res.result.userInfo.openId);
        var db = wx.cloud.database();
        db.collection('clockrecord').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
            avatarUrl: app.globalData.userInfo.avatarUrl,
            clocktime: app.getCurrentDate(),
            // 为待办事项添加一个地理位置（113°E，23°N）
            cloudPath: app.globalData.cloudPath,
            fileID: app.globalData.fileID,
            filePath: app.globalData.filePath,
            latitude: that.data.latitude,
            longitude: that.data.longitude,
            remark: userRemark,
            nickname: app.globalData.userInfo.nickName,
            openid: res.result.userInfo.openId,
            adress: that.data.address
          },
          success: function (r) {
            that.integralRequest();
          }
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    });

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //积分累加
  integralRequest: function () {
    var that = this;
    var db = wx.cloud.database();
    db.collection('integral').add({
      data: {
        openid: wx.getStorageSync("_openid"),
        time: app.getCurrentDate(),
        num: 1,
        nickname: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl
      },
      success: function (r) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        wx.showModal({
          title: "提示",
          content: "打卡成功，积分+1",
          showCancel: false,
          success(s) {
            if (s.confirm) {
              app.globalData.fileID = "";
              app.globalData.cloudPath = "";
              app.globalData.filePath = "";
              that.setData({
                imgUrl: "",
                userRemark: ""
              });
              wx.switchTab({
                url: "/pages/index/index"
              });
            }
          }
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})