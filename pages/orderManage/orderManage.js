let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    from: '',
    down_url: '',
    tabStatus: 'AF00806HZ',
    p: {
      page: 1,
      size: 20,
      total: 0
    },
    searchForm: {
      orderSerial: '',
      startAddress: '',
      endAddress: '',
      driverKeyWord: '',
      startDate: '',
      endDate: '',
    },
    tableData: '',
    showOs: ''
  },
  getAppUrl: function(int) {
    //安卓货主 : 1  IOS货主：3
    app.xhr('GET', `/aflc-common/common/aflcAppDownload/v1/getAppNewVersion/${int}?access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, null, (res) => {
      if (res.data.data) {
        this.setData({
          down_url: res.data.data.appDownloadUrl
        })
      }
    })

  },
  postMyOrderList: function(currentPage, pageSize, status, searchForm) {
    app.xhr('POST', `/aflc-order/aflcMyOrderApi/myOrderList?currentPage=${currentPage}&pageSize=${pageSize}&status=${status}&startAddress=${searchForm.startAddress}&endAddress=${searchForm.endAddress}&driverKeyWord=${searchForm.driverKeyWord}&startDate=${searchForm.startDate}&endDate=${searchForm.endDate}&orderSerial=${searchForm.orderSerial}&access_token=${app.storage.get_s('28kytoken')}&user_token=${app.storage.get_s('userInfo').userToken}`, null, (res) => {
      if (res.data.status === 200) {
        this.setData({
          tableData: res.data.data.list
        })
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.from === 'order') {
      this.setData({
        from: 'order'
      })
    } else {
      this.setData({
        from: ''
      })
    }
    try {
      const res = wx.getSystemInfoSync()
      console.log(res.system)
      if (/Android/.test(res.system)) {
        this.setData({
          showOs: 'Android'
        })
        this.getAppUrl(1);
      } else if (/iOS/.test(res.system)) {
        this.setData({
          showOs: 'iPhone'
        })
        // this.getAppUrl(3);
        this.down_url = 'https://itunes.apple.com/cn/app/28%E5%BF%AB%E8%BF%90/id1441371511?mt=8'
      } else {
        this.setData({
          showOs: 'Android'
        })
      }

    } catch (e) {

    }
    this.postMyOrderList(this.data.p.page, 1000, this.data.tabStatus, this.data.searchForm)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})