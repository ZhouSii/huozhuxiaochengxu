let app = getApp()
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})
let animationBottom = wx.createAnimation({
  duration: 200,
  timingFunction: 'ease-in-out',
})
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showMask: false,
    goodsListWindow: false,
    showAddressWindow: false,
    animationData: {},
    animationDataBottom: {},
    addr: {},
    goodsList: [],
    faWuLiuForm: {
      to:[{
        consignee: "",//收货人姓名
        consigneeMobile: "",//收货人电话
        isSms: 0,//是否短信通知(1为是，0为否)
        origin: "",//地点名称详细地址
        originCoordinate: "",//地点坐标(格式22.5253951835,114.0988813763纬度经度)
        originName: "",//地点名称
        provinceCityArea: "",//省市区（格式:广东省,广州市,天河区）
        shipperSort: 0,//线路排序号
        addressDetail: '', // 弹窗详细地址
        province: '',
        city: '',
        area: '',
        street: '', // 街道
        streetCode: '', // 街道code
        cityCode: '', // 发物流的城市编码
        code: '', //区code
        longitude: '',
        latitude: ''
      },
        {
          consignee: "",
          consigneeMobile: "",
          isSms: 0,
          origin: "",
          originCoordinate: "",
          originName: "",
          provinceCityArea: "",
          shipperSort: 1,
          addressDetail: '', // 弹窗详细地址
          province: '',
          city: '',
          area: '',
          street: '',
          streetCode: '',
          cityCode: '',
          code: '', //区code
          longitude: '',
          latitude: ''
        }
      ],
      agencyInfo:{}, // 区代信息
      _agencyInfos:[], // 区代信息 换一家
      calculateList: [], // 发物流区代计算价格
      estimatePrice: 0, // 预估
      reductionPrice: 0, // 减免
      number :'',
      weight: '',
      volume: '',
      goodsCode: '',
      goodsName: '',
      userCurrent: {
        userCurrentAddress: '', // 用户当前地址(长地址)
        userCurrentAddressName: '', // 用户当前地址名称(短地址)
        userCurrentAreaCode: '', // 用户当前区域代码值
        userCurrentLatitude: '', // 用户当前纬度
        userCurrentLongitude: '', // 用户当前经度
      },
      _selected: true // 契约条款
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toFaWuLiuNext: function(){
      wx.navigateTo({
        url: '/pages/ui2.0/faWuLiuNext/faWuLiuNext',
      })
    },
    openClause:function(){
      wx.navigateTo({
        url: '/pages/ui2.0/waybillClause/waybillClause',
      })
    },
    selectClause: function(){
      this.setData({
        'faWuLiuForm._selected': !this.data.faWuLiuForm._selected
      })
    },
    inputWeight: function(e){
      let value = e.detail.value
      if (value === '0') {
        this.setData({
          'faWuLiuForm.weight': '1'
        })
      } else if (value * 1 > 100000) {
        this.setData({
          'faWuLiuForm.weight': '100000'
        })
      } else {
        this.setData({
          'faWuLiuForm.weight': value
        })
      }
    },
    inputVolume: function(e){
      let value = e.detail.value.replace(/[^0-9.]/g, '').replace(/\./, '*').replace(/\./g, '').replace(/\*/, '.').replace(/^\./, '0.').replace(new RegExp('^(\\d+)\\.(\\d{' + Math.abs(2) + '}).*$'), '$1.$2')
      if (value * 1 > 1000) {
        this.setData({
          'faWuLiuForm.volume': '1000'
        })
      } else {
        this.setData({
          'faWuLiuForm.volume': value
        })
      }
    },
    inputBlur: function(e){
      let str = e.detail.value
      if(str.includes('.')){
        let list = str.split('.')
        if(list[1] === ''){
          this.setData({
            'faWuLiuForm.volume': list[0]
          })
        }
        if(this.data.faWuLiuForm.volume * 1 === 0){
          this.setData({
            'faWuLiuForm.volume': '0.01'
          })
        }
      }
    },
    inputNumber: function(e){
      let value = e.detail.value
      if (value === '0') {
        this.setData({
          'faWuLiuForm.number': '1'
        })
      } else if (value * 1 > 1000) {
        this.setData({
          'faWuLiuForm.number': '1000'
        })
      } else {
        this.setData({
          'faWuLiuForm.number': value
        })
      }
    },
    selectedGoods: function(e){
      let item = e.currentTarget.dataset.item
      this.setData({
        'faWuLiuForm.goodsCode': item.code,
        'faWuLiuForm.goodsName': item.name
      })
      this.closeBottomWindow()
    },
    showBottomWindow: function(){
      this.setData({
        showMask: !this.data.showMask,
        goodsListWindow: true,
      })
      animation.opacity(1).step()
      animationBottom.bottom(0).step()
      this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
    },
    closeBottomWindow: function () {
      animation.opacity(0).step()
      animationBottom.bottom('-68%').step()
      this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
      setTimeout(() => {
        this.setData({
          showMask: false,
          goodsListWindow: false,
        })
      }, 250)
    },
    toShowMap: function(e){
      let item = e.currentTarget.dataset.item;
      let originCoordinate = item.originCoordinate === "" ? "" : item.originCoordinate.split(',').reverse().join(',');
      wx.navigateTo({
        url: `/pages/ui2.0/showMap/showMap?item=${JSON.stringify(item)}&originCoordinate=${originCoordinate}&from=faWuLiu`
      })
    },
    submitWindow: function(){
      animation.opacity(0).step()
      this.setData({ animationData: animation.export() })
      this.setData({
        ["faWuLiuForm.to[" + this.data.addr.shipperSort + "].addressDetail"]: this.data.addr.addressDetail,
        ["faWuLiuForm.to[" + this.data.addr.shipperSort + "].consignee"]: this.data.addr.consignee,
        ["faWuLiuForm.to[" + this.data.addr.shipperSort + "].consigneeMobile"]: this.data.addr.consigneeMobile,
        ["faWuLiuForm.to[" + this.data.addr.shipperSort + "].isSms"]: this.data.addr.isSms
      })
      setTimeout(() => {
        this.setData({
          showAddressWindow: false
        })
      }, 250)
    },
    closeAddressWindow: function(){
      animation.opacity(0).step()
      this.setData({ animationData: animation.export() })
      setTimeout(() => {
        this.setData({
          showAddressWindow: false
        })
      }, 250)

    },
    showWindow: function(e){
      let item = e.currentTarget.dataset.item
      this.setData({
        addr: item,
        showAddressWindow: true
      })
      animation.opacity(1).step()
      this.setData({ animationData: animation.export() })
    },
    setAddressDetail: function(e){
      this.setData({
        'addr.addressDetail': e.detail.value
      })
    },
    setConsignee: function(e){
      this.setData({
        'addr.consignee': e.detail.value
      })
    },
    setConsigneeMobile: function(e){
      this.setData({
        'addr.consigneeMobile': e.detail.value
      })
    },
    test: function() {
      console.log(this.data.faWuLiuForm)
    }
  },
  lifetimes: {
    created: function() {
      app.xhr('GET', `/aflc-common/sysDict/getSysDictByCodeGet/AF034`, null, (res1) => {
        this.setData({
          goodsList: res1.data.data
        })
      })
    },
    ready: function() {
    }
  },
  pageLifetimes: {
    show: function() {
      animation.opacity(0).step()
      animationBottom.bottom('-72%').step()
      this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export(), showAddressWindow: false })
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  }
})
