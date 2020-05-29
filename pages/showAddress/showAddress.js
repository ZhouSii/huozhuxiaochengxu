// pages/showAddress/showAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressData: { //对应form.to数据
      consignee: '', //收货人姓名
      consigneeMobile: '', //收货人电话
      isSms: false, //是否短信通知(1为是，0为否)
      origin: '', //地点名称详细地址
      originCoordinate: '', //地点坐标(格式22.5253951835,114.0988813763纬度经度)
      originName: '', //地点名称
      provinceCityArea: '', //省市区（格式:广东省,广州市,天河区）
      shipperSort: '', //线路排序号
      _floorHousenum: '', //楼层 不用提交
    },
    addressTempData: {},
    checkBox: {
      name: 'gou'
    }
  },
  back: function(){
    wx.navigateBack({
      delta: 1
    })
  },
  checkData: function() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 3]
    prevPage.data.form.to.forEach((item, i) => {
      if (item.shipperSort === this.data.addressData.shipperSort) {
        let to = "form.to[" + i + "]";
        prevPage.setData({
          [to]: {
            consignee: this.data.addressData.consignee,
            consigneeMobile: this.data.addressData.consigneeMobile,
            isSms: this.data.addressData.isSms === true ? 1 : 0,
            origin: this.data.addressData._floorHousenum === '' ? this.data.addressData.origin : `${this.data.addressData.origin} ${this.data.addressData._floorHousenum}`,
            originCoordinate: this.data.addressData.originCoordinate,
            originName: this.data.addressData.originName,
            provinceCityArea: this.data.addressData.provinceCityArea,
            shipperSort: this.data.addressData.shipperSort * 1,
          },
          fromCity: true,
        })
      }
    })
    //刷新carList
    if (this.options.shipperSort === '0' && this.options.cityAdcode1 !== prevPage.data.form._cityAdcode[1]) {
      prevPage.setData({
        'form._cityAdcode': [this.options.cityAdcode0, this.options.cityAdcode1]
      })
    }
    wx.navigateBack({
      delta: 2
    })
  },
  toOrder: function() {
    let reg = /^[0-9a-zA-Z\u4e00-\u9fa5 ]{1,10}$/;
    if (this.data.addressData._floorHousenum !== '' && !reg.test(this.data.addressData._floorHousenum)) {
      wx.showToast({
        title: '详细地址只能输入汉字、英文、数字',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.addressData.consignee !== '' && !reg.test(this.data.addressData.consignee)) {
      wx.showToast({
        title: '详细地址只能输入汉字、英文、数字',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let re = /^1[3-9]\d{9}$/;
    if (this.options.shipperSort * 1 === 0) {
      if (this.data.addressData.consigneeMobile !== '') {
        if (re.test(this.data.addressData.consigneeMobile)) {
          this.checkData()
        } else {
          wx.showToast({
            title: '手机号码不正确',
            icon: 'none',
            duration: 2000
          })
        }
      } else {
        wx.showToast({
          title: '手机号码必须填写',
          icon: 'none',
          duration: 2000
        })
      }

    } else {
      if (this.data.addressData.consigneeMobile !== '') {
        if (re.test(this.data.addressData.consigneeMobile)) {
          this.checkData()
        } else {
          wx.showToast({
            title: '手机号码不正确',
            icon: 'none',
            duration: 2000
          })
        }
      } else {
        this.checkData()
      }
    }
  },
  checkFloorHousenum: function(e) {
    this.setData({
      'addressData._floorHousenum': e.detail.value
    })
  },
  checkConsignee: function(e) {
    this.setData({
      'addressData.consignee': e.detail.value
    })
  },
  checkConsigneeMobile: function(e) {
    this.setData({
      'addressData.consigneeMobile': e.detail.value
    })
  },
  clickCheckBox: function(e) {
    if (e.detail.value[0] === 'gou') {
      this.setData({
        'addressData.isSms': true
      })
    } else {
      this.setData({
        'addressData.isSms': false
      })
    }
  },
  onLoad: function(options) {
    if (this.options.shipperSort * 1 === 0) {
      wx.setNavigationBarTitle({
        title: '发货人信息'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '收货人信息'
      })
    }
    this.setData({
      addressData: {
        consignee: this.options.consignee, //收货人姓名
        consigneeMobile: this.options.consigneeMobile, //收货人电话
        isSms: (this.options.isSms * 1 === 1) ? true : false, //是否短信通知(1为是，0为否)
        origin: this.options.origin, //地点名称详细地址
        originCoordinate: this.options.originCoordinate, //地点坐标(格式22.5253951835,114.0988813763纬度经度)
        originName: this.options.originName, //地点名称
        provinceCityArea: this.options.provinceCityArea, //省市区（格式:广东省,广州市,天河区）
        shipperSort: this.options.shipperSort * 1, //线路排序号
        _floorHousenum: this.options.origin.split(' ')[1] === undefined ? '' : this.options.origin.split(' ')[1], //楼层 不用提交
      },
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