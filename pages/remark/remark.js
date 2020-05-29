let app = getApp()
Page({
  data: {
    mobile:'',
    remark:'',
    goodsList: [],
    remarkList: [{ mobile: '', list: [] }],
    remarkIndex: 0
  },
  successSubmit: function(){
    if (this.data.remark === ''){
      prevPage.setData({ 'formNext.remark': '' })
      wx.navigateBack({ delta: 1 })
    } else {
      let reg = /^[0-9a-zA-Z\u4e00-\u9fa5 ,，.。]{1,60}$/;
      if (reg.test(this.data.remark)) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2]
        prevPage.setData({ 'formNext.remark': this.data.remark })
        wx.navigateBack({ delta: 1 })
      } else {
        wx.showToast({
          title: '只能输入汉字、英文、数字，。',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  selectHistory: function(e){
    let item = e.currentTarget.dataset.item1
    let i = e.currentTarget.dataset.index1
    this.setData({
      remarkIndex:i,
      remark: item.name
    })
  },
  selectedGoods: function(e){
    let item = e.currentTarget.dataset.item
    if (item.name === '不填') {
      this.setData({ remark: '' })
    } else {
      if (item.name.length + this.data.remark.length < 60) {
        let remark = this.data.remark.length === 0 ? item.name : `${this.data.remark},${item.name}`
        this.setData({ remark: remark })
      }
    }
  },
  checkInput: function(e){
    this.setData({ remark:e.detail.value})
  },
  onLoad: function (options) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    this.setData({ mobile: app.storage.get_s('userInfo').mobile, remark: prevPage.data.formNext.remark})
    app.xhr('GET', '/aflc-common/sysDict/getSysDictByCodeGet/AF00402', null, (res) => {
      if (res.data.status === 200) {
          this.setData({
            goodsList: res.data.data
          })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (app.storage.get_s('remarkList')) {
      this.setData({ remarkList: app.storage.get_s('remarkList')})
    }
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