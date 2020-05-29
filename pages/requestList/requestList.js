let app = getApp()
Page({
  data: {
    money: '',
    dialogFormVisible: false,
    showMask: false,
    requestList: [], //额外需求

    extraServiceDtoList: [], //额外服务
    requestNameList: [] //额外服务名称
  },
  successSubmit: function() {
    console.log(this.data)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    prevPage.setData({ 'formNext.extraServiceDtoList': this.data.extraServiceDtoList, 'formNext.requestNameList': this.data.requestNameList })
    wx.navigateBack({ delta: 1 })
  },
  submitMoney: function() {
    if (this.data.money === '') {
      this.setData({
        dialogFormVisible: false,
        showMask: false,
        money: ''
      })
    } else {
      if (/^[1-9][0-9]*$/g.test(this.data.money)) {
        let requestList = this.data.requestList
        requestList.forEach((item) => {
          if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
            item.selected = true;
            item.remark = this.data.money;
          }
        });
        this.setData({
          requestList,
          dialogFormVisible: false,
          showMask: false
        })
        this.addExtraServiceDtoList();
      } else {
        wx.showToast({
          title: '金额格式错误,必须是整数',
          icon: 'none',
          duration: 2000
        })
      }
    }

  },
  changeMoney: function(e) {
    let money = e.detail.value * 1
    if (money > 20000) {
      this.setData({
        money: 20000
      })
    } else {
      this.setData({
        money
      })
    }
  },
  closeMask2: function() {
    this.setData({
      dialogFormVisible: false,
      showMask: false,
      money: ''
    })
  },
  requestClick: function(e) {
    let item = e.currentTarget.dataset.item
    let i = e.currentTarget.dataset.index
    let up = "requestList[" + i + "]";
    let requestList = this.data.requestList
    if (item.extraId === "1b51fb332dac42da9f19092d275caf29") {
      item.selected = !item.selected;
      requestList.forEach((item1) => {
        if (item1.extraId === "2b988d6a75314914ae5fdf724e10b1c9") {
          item1.selected = false
        }
      })
      this.setData({
        requestList
      })
    } else if (item.extraId === "2b988d6a75314914ae5fdf724e10b1c9") {
      item.selected = !item.selected;
      requestList.forEach((item1) => {
        if (item1.extraId === "1b51fb332dac42da9f19092d275caf29") {
          item1.selected = false
        }
      })
      this.setData({
        requestList
      })
    } else if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
      item.selected = false;
      item.remark = '';
      this.setData({
        money: '',
        showMask: true,
        dialogFormVisible: true,
        [up]: item
      })
    } else {
      item.selected = !item.selected
    }

    this.setData({
      [up]: item
    })
    this.addExtraServiceDtoList();
  },
  addExtraServiceDtoList: function() {
    let extraServiceDtoList = [],
      requestNameList = [];
    let list = this.data.requestList.filter((item) => {
      return item.selected === true
    });
    list.forEach((item) => {
      extraServiceDtoList.push({
        extraId: item.extraId,
        remark: item.remark
      })
      if (item.extraId === "ee9b54d836a74924b43824b62c79c734") {
        requestNameList.push(`${item.extraName}￥（${item.remark}）`)
      } else {
        requestNameList.push(item.extraName)
      }

    });
    this.setData({
      requestNameList: requestNameList,
      extraServiceDtoList: extraServiceDtoList
    })
  },
  onLoad: function(options) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]
    console.log(prevPage.data.formNext)
    this.setData({ extraServiceDtoList: prevPage.data.formNext.extraServiceDtoList})
    app.xhr('GET', `/aflc-sm/aflcExtraPriceApi/findExtraPrice/${options.serviceCode}`, null, (res1) => {
      if (res1.data.status === 200) {
        let extraServiceDtoList = this.data.extraServiceDtoList
        if (extraServiceDtoList.length === 0) {
          res1.data.data.forEach((item) => {
            item.selected = false;
            item.remark = ''
          });
        } else {
          res1.data.data.forEach((item) => {
            extraServiceDtoList.forEach((item1) => {
              if (item.extraId === item1.extraId) {
                item.selected = true;
                item.remark = item1.remark
              }
            });
            if (!item.selected) {
              item.selected = false;
              item.remark = ''
            }
          });
        }
        this.setData({
          extraServiceDtoList,
          requestList: res1.data.data
        })
      }
    })
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