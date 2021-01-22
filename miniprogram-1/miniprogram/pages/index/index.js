// miniprogram/pages/dynamic/dynamic.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var db = wx.cloud.database();
    db.collection('clockrecord').limit(10000).orderBy('clocktime', 'desc').get({
      success: function (res7) {
        that.setData({
          listArr: res7.data
        });
        console.log(res7.data);
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    });
    // const db = wx.cloud.database();

    // const result = db.collection('clockrecord').aggregate()
    //   .lookup({
    //     from: 'fabulous',
    //     localField: '_id',
    //     foreignField: 'clockrecordid',
    //     as: 'z'
    //   })
    //   .end()
    //   .then(res => console.log(res))
    //   .catch(err => console.error(err))

    // db.collection('clockrecord').aggregate()
    //   .lookup({
    //     from: 'fabulous',
    //     localField: '_id',
    //     foreignField: 'clockrecordid',
    //     as: 'bookList',
    //   })
    //   .end()
    //   .then(res => console.log(res))
    //   .catch(err => console.error(err))



  },

  zan: function (e) {
    var that = this
    var id = e.target.dataset.id;
    var type = e.target.dataset.type;
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
          that.tabZan(id, type);
        }
      });
    } else {
      //取消赞
      db.collection('fabulous').where({
        openid: wx.getStorageSync("_openid"),
        _id: id
      }).remove({
        success: function (res) {
          that.tabZan(id, type);
        }
      });
    }
  },

  tabZan: function (id, type) {
    var that = this;
    var newArr = new Array();
    //点赞
    var listArr = that.data.listArr;
    for (var i = 0; i < listArr.length; i++) {
      var obj = listArr[i];
      if (obj._id == id) {
        if (type == "1") {
          obj.zan = "yes";
        } else {
          //取消点赞
          obj.zan = "no";
        }
      }
      newArr.push(obj);
    }
    that.setData({
      listArr: newArr
    });
  },
  

  gotoDetails: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    wx.navigateTo({
      url: "../recordDetai/recordDetai?id=" + id
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
    this.onLoad();
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