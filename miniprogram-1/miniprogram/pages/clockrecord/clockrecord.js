// miniprogram/pages/clockrecord/clockrecord.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: function (res) {
        wx.setStorageSync("_openid", res.result.userInfo.openId);
        var db = wx.cloud.database();
        db.collection('clockrecord').where({
          "_openid": wx.getStorageSync("_openid")
        }).orderBy('clocktime', 'desc').get({
          success: function (res) {
            that.setData({
              listArr: res.data
            });
            console.log(res.data)
          },
          fail: function (xhy) {
            console.log(xhy);
          }
        });
      },
      fail: function (err) {
        console.error('[云函数] [login] 调用失败', err)
      }
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