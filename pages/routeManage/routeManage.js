let app = getApp()
Page({
  data: {
    showEdit: false,
    tableData: undefined
  },
  del: function(e) {
    let item = e.currentTarget.dataset.item;
    console.log(item)
    wx.showModal({
      title: '提示',
      content: '确定删除此路线吗',
      confirmText:'删除',
      success:(res) =>{
        if (res.confirm) {
          app.xhr('POST', `/aflc-uc/aflcShipperLineApi/deleteAflcShipperLine/${item[0].shipperNo}?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, null, (res) => {
            if (res.data.status === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 2000
              })
              this.getList();
            } else {
              wx.showToast({
                title: res.data.errorInfo,
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  edit: function (e) {
    let item = e.currentTarget.dataset.item;
    let list = [];
    item.forEach((item1, i) => {
      list.push({
        contactsPhone: item1.contactsPhone,
        contacts: item1.contacts,
        addressDetail: item1.addressDetail,
        cityCode: item1.cityCode,
        origin: item1.address,
        originCoordinate: `${item1.latitude},${item1.longtitude}`,
        originName: item1.name,
        provinceCityArea: item1.provinceCityArea,
        shipperSort: i,
        shipperNo: item1.shipperNo,
      })
    });
    let form = { lineName: item[0].lineName, addRoute: list };
    app.storage.set('routeLineDetail', form);
    wx.navigateTo({ url: '/pages/handleManage/handleManage' })
  },
  toOrder: function(e) {
    let item = e.currentTarget.dataset.item;
    console.log(item)
    let to = [];
    item.forEach((item1) => {
      to.push({
        consignee: item1.contacts ? item1.contacts : '',
        consigneeMobile: item1.contactsPhone ? item1.contactsPhone : '',
        addressDetail: item1.addressDetail ? item1.addressDetail: '', //地址详情 门牌
        isSms: 0,
        origin: item1.address,
        originCoordinate: `${item1.latitude},${item1.longtitude}`,
        originName: item1.name,
        provinceCityArea: item1.provinceCityArea,
        shipperSort: item1.shipperSort
      })
    });
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    prevPage.setData({ 'form.belongCity': item[0].cityCode, 'form.to': to, fromCity: true })
    wx.navigateBack({ delta: 1 })
  },
  addSubmit: function () {
    wx.navigateTo({url: '/pages/handleManage/handleManage'})
  },
  showEdit: function() {
    this.setData({ showEdit: !this.data.showEdit })
  },
  getList: function () {
    app.xhr('GET', `/aflc-uc/aflcShipperLineApi/findAflcShipperLine?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, null, (res) => {
      if (res.data.status === 200) {
        this.setData({ tableData: res.data.data})
      } else {
        wx.showToast({
          title: res.data.errorInfo,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
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
    app.storage.remove('routeLineDetail')
    this.getList()
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