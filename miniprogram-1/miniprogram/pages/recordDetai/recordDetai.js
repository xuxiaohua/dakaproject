// miniprogram/pages/recordDetai/recordDetai.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listObj: [],
    objId: "",
    inviteShow: false,
    isfocus: false,
    commentList: [],
    commentText: "",
    allPeopleStr: "",
    hava_fabulous: false //当前用户是否点赞
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    that.setData({
      objId: id
    });
    var db = wx.cloud.database();
    //动态详情
    db.collection('clockrecord').doc(id).get({
      success: function (res7) {
        that.setData({
          listObj: res7.data
        });
        console.log(res7.data);
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    });
    //点赞列表
    that.fabulousRequest();
    //评论列表
    that.commentRequest();

  },
  commentRequest: function () {
    var that = this;
    //评论列表
    var db = wx.cloud.database();
    db.collection('comment').where({
      clockrecordid: that.data.objId
    }).get({
      success: function (res7) {
        
        that.setData({
          commentList: res7.data
        });
        console.log(res7.data);
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    });
  },
  fabulousRequest: function () {
    var that = this;
    //获取点赞列表
    var db = wx.cloud.database();
    db.collection('fabulous').where({
      clockrecordid: that.data.objId
    }).get({
      success: function (res7) {
        var allPeopleStr = "";
        var b = false;
        for (var i = 0; i < res7.data.length; i++) {
          allPeopleStr = allPeopleStr + "," + res7.data[i].nickname;
          if (res7.data[i]._openid == wx.getStorageSync("_openid")) {
            b = true;
          }
        }
        that.setData({
          allPeopleStr: allPeopleStr,
          hava_fabulous: b
        });
        console.log(res7.data);
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    });
  },
  showInvite: function () {
    if (this.data.inviteShow) {
      this.setData({
        inviteShow: false
      });
    } else {
      this.setData({
        inviteShow: true
      });
    }
  },

  showText: function () {
    var that = this;
    that.setData({
      isfocus: true
    });
  },

  zan: function (e) {
    var that = this;
    var type = e.target.dataset.type;
    var id = that.data.listObj._id;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(1);
        if (res.authSetting['scope.userInfo']) {
          console.log(2);
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res1 => {
              console.log(res1);
              this.setData({
                islogin: true
              });
              app.globalData.userInfo = res1.userInfo;
              wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: function (res3) {
                  console.log('[云函数] [login] 调用成功', res3);
                  wx.setStorageSync("_openid", res3.result.userInfo.openId);
                  that.dianzan(id, type);
                },

                fail: function (err) {
                  console.error('[云函数] [login] 调用失败', err)
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


  dianzan: function (id, type) {
    var that = this;
    var db = wx.cloud.database();
    if (type == "1") {
      //点赞
      db.collection('fabulous').add({
        data: {
          clockrecordid: id,
          openid: wx.getStorageSync("_openid"),
          time: app.getCurrentDate(),
          nickname: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl
        },
        success: function (r) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          that.setData({
            hava_fabulous: true
          });
          setTimeout(function () {
            that.setData({
              inviteShow: false
            });
          }, 1000);
          that.fabulousRequest();
        }
      });
    } else {
      //取消赞
      db.collection('fabulous').where({
        _openid: wx.getStorageSync("_openid"),
        clockrecordid: id
      }).remove({
        success: function (res) {
          that.setData({
            hava_fabulous: false
          });
          setTimeout(function () {
            that.setData({
              inviteShow: false
            });
          }, 1000);
          that.fabulousRequest();
        }
      });
    }
  },

  pinglun: function () {
    var that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(1);
        if (res.authSetting['scope.userInfo']) {
          console.log(2);
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res1 => {
              console.log(res1);
              this.setData({
                islogin: true
              });
              app.globalData.userInfo = res1.userInfo;
              wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: function (res3) {
                  console.log('[云函数] [login] 调用成功', res3);
                  wx.setStorageSync("_openid", res3.result.userInfo.openId);
                  that.pinglunRequest();
                },

                fail: function (err) {
                  console.error('[云函数] [login] 调用失败', err)
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
  pinglunRequest: function () {
    var that = this;
    var commentText = that.data.commentText;
    var db = wx.cloud.database();
    //评论新增
    db.collection('comment').add({
      data: {
        clockrecordid: that.data.listObj._id,
        openid: wx.getStorageSync("_openid"),
        time: app.getCurrentDate(),
        comment: commentText,
        nickname: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl
      },
      success: function (r) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        that.setData({
          commentText: "",
          isfocus: false,
          inviteShow: false
        });
        that.commentRequest();
      }
    });
  },

  getCommentText: function (e) {
    this.setData({
      commentText: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

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