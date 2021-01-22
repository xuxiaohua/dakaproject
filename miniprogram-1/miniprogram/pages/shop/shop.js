//index.js
const app = getApp()

Page({
  data: {
    currentTab: 0, //对应样式变化
    scrollTop: 0, //用作跳转后右侧视图回到顶部
    islogin: false,
    screenArray: [{
        screenId: 1,
        screenName: '热搜推荐'
      },
      {
        screenId: 2,
        screenName: '美妆'
      },
      {
        screenId: 3,
        screenName: '香水'
      },
      {
        screenId: 4,
        screenName: '酒类'
      },
      {
        screenId: 5,
        screenName: '生活'
      }
    ], //左侧导航栏内容
    screenId: "1", //后台查询需要的字段
    childrenArray: {
      showImageUrl: 'http://img3.imgtn.bdimg.com/it/u=1798233457,4143585420&fm=26&gp=0.jpg',
      childrenScreenArray: [{
          screenName: '休闲零食',
          childrenScreenArray: [{
            screenId: 1,
            showImageUrl: 'http://img0.imgtn.bdimg.com/it/u=921197123,1741426939&fm=26&gp=0.jpg',
            screenName: '糖果'
          }, ]
        },
        {
          screenName: '手机数码',
          childrenScreenArray: [{
            screenId: 1,
            showImageUrl: 'http://img0.imgtn.bdimg.com/it/u=1138662413,2627006305&fm=26&gp=0.jpg',
            screenName: 'vivo手机'
          }, ]
        },
      ]
    }
  },

  onLoad: function () {
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
            }
          });
        }
      }
    });

    const testdb = wx.cloud.database();
    const todos = testdb.collection('items').get({
      success: function (res) {
        that.setData({
          childrenArray: res.data
        });
        console.log(res);
      },
      fail: function (xhy) {
        console.log(xhy);
      }
    });
  },

  ToSearchResult: function (e) {
    var actid = e.currentTarget.dataset.actid;
    wx.navigateTo({
      url: "../details/details?actid=" + actid
    });
  },
  /**
   * 导航切换
   */
  navbarTap: function (e) {
    var that = this;
    this.setData({
      currentTab: e.currentTarget.id, //按钮CSS变化
      screenId: e.currentTarget.dataset.screenid,
      scrollTop: 0, //切换导航后，控制右侧滚动视图回到顶部
    })
    //刷新右侧内容的数据
    var screenId = this.data.screenId;
  },
  gotoMap: function () {
    wx.navigateTo({
      url: "../map/map"
    });
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
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    });
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

})