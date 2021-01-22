// pages/details/details.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    details: {},
    type: "1",
    dialog: false,
    num: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var actid = options.actid;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res);
              this.setData({
                islogin: true
              });
              app.globalData.userInfo = res.userInfo;
              var testdb = wx.cloud.database();
              testdb.collection('items').doc(actid).get({
                success: function (res) {
                  // res.data 包含该记录的数据
                  var picArry = new Array();
                  var picObj = {
                    "pic": res.data.pic
                  };
                  picArry.push(picObj);
                  that.setData({
                    details: res.data,
                    channelbg: picArry
                  });
                  console.log(res.data);
                }
              })
            }
          });
        }
      }
    });
  },
  gotoHome: function () {
    wx.switchTab({
      url: "/pages/index/index",
      fail: function (x) {
        console.log(x);
      }
    });
  },
  //确认订单
  queryOk: function () {
    var that = this;
    var details = that.data.details;
    var type = that.data.type;
    var cartNum = 0;
    var carmun = cartNum + parseInt(that.data.num);
    wx.navigateTo({
      url: "../saveorder/saveorder?actid=" + details._id + "&carmun=" + carmun
    });
  },

  openDialog: function (e) {
    var userInfo = app.globalData.userInfo;
    if (userInfo != null && userInfo != '') {
      var type = e.currentTarget.dataset.type;
      this.setData({
        type: type,
        dialog: true
      });
    } else {
      wx.showModal({
        title: "提示",
        content: "请先到我的页面登录",
        showCancel: false
      });
    }

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
    var that = this;
    var obj = that.data.details;

    return {
      title: obj.name,
      path: '/pages/details/details?itemid=' + obj._id,
      imageUrl: obj.pic //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径。支持PNG及JPG。显示图片长宽比是 5:4。
    }

  },
  close: function () {
    this.setData({
      dialog: false
    });
  },
  jia: function () {
    var num = this.data.num;
    if (num == 99) {
      return
    }
    this.setData({
      num: num + 1
    });

  },
  jian: function () {
    var num = this.data.num;
    if (num == 1) {
      return
    }
    this.setData({
      num: num - 1
    });
  }


})