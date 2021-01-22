// pages/saveOrder/saveorder.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    toast: false,
    totalMsg: "",
    userMobile: wx.getStorageSync("userNamePhone").userMobile, //手机号
    userName: wx.getStorageSync("userNamePhone").userName, //购买人
    userIdcard: wx.getStorageSync("userNamePhone").userIdcard, //身份证
    details: {},
    array: ["海口美兰机场", "三亚凤凰机场", "琼海博鳌机场", "海口火车站", "秀英港", "新海港", "其他"],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var actid = options.actid;
    var carmun = options.carmun;
    var testdb = wx.cloud.database();
    testdb.collection('items').doc(actid).get({
      success: function (res) {
        // res.data 包含该记录的数据
        var obj = res.data;
        var payPrice = 0.00;
        payPrice = parseInt(carmun) * (obj.item_price);
        payPrice = new Number(payPrice).toFixed(2);

        var picArry = new Array();
        var picObj = {
          "pic": res.data.pic
        };
        picArry.push(picObj);
        that.setData({
          details: res.data,
          payPrice: payPrice,
          carmun: carmun,
          channelbg: picArry
        });
      }
    });
  },
  saveOrder: function () {
    var that = this;
    var userMobile = that.data.userMobile;
    var userName = that.data.userName;
    var userRemark = that.data.userRemark;
    var userIdcard = that.data.userIdcard;
    var orderPameters = {};
    if (userName == "" || userName == null) {
      app.showErrorMsg("购买人不能为空");
      return;
    }
    if (userMobile == "" || userMobile == null) {
      app.showErrorMsg("手机号不能为空");
      return;
    }
    var str = /^1\d{10}$/;
    if (!str.test(userMobile)) {
      app.showErrorMsg("手机号格式错误");
      return;
    }
    if (userIdcard == "" || userIdcard == null) {
      app.showErrorMsg("身份证号不能为空");
      return;
    }
    if (userIdcard.length != 18) {
      app.showErrorMsg("身份证号格式错误");
      return;
    }

    wx.setStorageSync("userNamePhone", {
      userMobile: userMobile,
      userName: userName,
      userIdcard: userIdcard
    });
    orderPameters.userMobile = userMobile;
    orderPameters.userRemark = userRemark;
    orderPameters.userName = userName;
    orderPameters.item_price = that.data.details.item_price;
    orderPameters.itemid = that.data.details._id;
    orderPameters.num = that.data.num;
    orderPameters.payPrice = that.data.payPrice;
    orderPameters.userIdcard = that.data.userIdcard
    orderPameters.pickAdress = that.data.array[that.data.index];
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    var testdb = wx.cloud.database();
    testdb.collection('order').add({
      data: orderPameters,
      success: function () {
        setTimeout(function () {
          wx.hideLoading();
          that.setData({
            toast: true,
            totalMsg: "提交订单成功"
          });
          setTimeout(function () {
            wx.hideLoading();
            that.setData({
              toast: false,
              totalMsg: ""
            });
            wx.switchTab({
              url: "../index/index"
            });
          }, 2000);
        }, 2000);
      }
    });
  },
  //购买人输入值
  getUserName: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  //手机号输入值
  getUserMobile: function (e) {
    this.setData({
      userMobile: e.detail.value
    })
  },
  //身份证输入
  getUserIdcard: function (e) {
    this.setData({
      userIdcard: e.detail.value
    })
  },
  //订单备注
  getUserRemark: function (e) {
    this.setData({
      userRemark: e.detail.value
    })
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
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

  }
})