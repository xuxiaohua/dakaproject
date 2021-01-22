//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    islogin: false,
    integralNum: 0
  },

  onLoad: function () {

  },
  getintegral: function () {
    var that = this;
    var db = wx.cloud.database();
    db.collection('integral').where({
      "_openid": wx.getStorageSync("_openid")
    }).limit(1000).get({
      success: function (res) {
        var integralNum = 0;
        for (var i = 0; i < res.data.length; i++) {
          integralNum = integralNum + parseInt(res.data[i].num);
        }
        that.setData({
          integralNum: integralNum
        });
      }
    })




    // db.collection('integral').where({
    //   "_openid": wx.getStorageSync("_openid")
    // }).orderBy('clocktime', 'desc').get({
    //   success: function (res) {
    //     console.log(res.data.list)


    //     that.setData({
    //       listArr: 1
    //     });
    //   },
    //   fail: function (xhy) {
    //     console.log(xhy);
    //   }
    // });
  },
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        islogin: true
      });
      app.globalData.userInfo = e.detail.userInfo;
    }
  },

  onGetOpenid: function (e) {
    var that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log(res);
        wx.setStorageSync("_openid", res.result.userInfo.openId);
        console.log(res.result.userInfo.openId);
        that.onShow();
        // wx.getUserInfo({
        //   success(res1) {
        //     console.log(11111111);
        //     console.log(res1);

        //     that.setData({
        //       logged: true,
        //       avatarUrl: res1.result.userInfo.avatarUrl,
        //       userInfo: res1.result.userInfo,
        //       islogin: true
        //     });
        //     app.globalData.userInfo = res1.result.userInfo;
        //   }
        // });

      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  onShow: function () {
    var that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                islogin: true
              });
              app.globalData.userInfo = res.userInfo;
              that.getintegral();
            }
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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