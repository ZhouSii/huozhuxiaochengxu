// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    checkBox: {name:'gou',checked:true}

  },
  next:function() {
    let re = /^1[3-9]\d{9}$/, isOk;
    if (re.test(this.data.phone)) {
      isOk = true
    } else {
      isOk = false
    }
    if (this.data.checkBox.checked) {
      if (isOk) {
        wx.navigateTo({
          url: `/pages/loginCode/loginCode?phone=${this.data.phone}`,
          success: () => {

          }
        })
      } else {
        if (this.data.phone.length < 11) {
          wx.showToast({
            title: '手机号请输入11位数字',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '手机号格式不正确',
            icon: 'none',
            duration: 2000
          })
        }
      }
    }
  },
  clickCheckBox: function(e){
    if (e.detail.value[0] === 'gou'){
      this.setData({ checkBox: { name: 'gou', checked: true } })
    } else{
      this.setData({ checkBox: { name: 'gou', checked: false } })
    }
  },
  checkPhone: function(e){
    this.setData({ phone: e.detail.value})
  },
  clearPhone: function(){
    this.setData({ phone: '' })
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