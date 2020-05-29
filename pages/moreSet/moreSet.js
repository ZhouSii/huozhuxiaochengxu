let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible2:false,
    actions2: [
      {
        name: '确定',
        color: '#ed3f14'
      }
    ]
  },
  handleClickItem2() {
    // app.xhr('POST', '/uaa/app/oauth/logout', {}, (res) => {
      app.storage.remove('28kytoken');
      app.storage.remove('userInfo');
      app.storage.remove('openId');
      wx.reLaunch({
        url: '/pages/ui2.0/index/index'
      })
    // })
  },
  handleCancel2() {
    this.setData({
      visible2: false
    });
  },
  loginOut: function(){
    this.setData({
      visible2: true
    });
  },
  onLoad: function (options) {

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