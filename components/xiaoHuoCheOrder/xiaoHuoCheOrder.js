let app = getApp()
var amapFile = require('../../utils/amap-wx.js')
var myAmapFun = new amapFile.AMapWX({ key: 'cbb300a2c1e7820f0989eafee58db0ba' });
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
    //父页面的cityAdcode
    cityAdcode: {
      type: Array,
      value: []
    },
    tabTypeId:{
      type: Number,
      value: 1
    },
    xiaoHuocheDataJs: {
      type: Object,
      value: undefined
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _changeRun: true, // 运行一次 本页面index.js页面有调用
    fromCity: false, //是否来自城市页面
    animationData: {},
    animationDataBottom: {},
    _cityCoordinate:[], //当前城市坐标,高德地图定位,用于第一次进入地图定位中心点
    scrollLeft: 0, // 顶部车型滚动

    timeType: [{id: 0, name: "现在"}, {id: 1, name: "预约"}],
    showXiaoHuoCheTips: '',
    addr: {},
    showAddressWindow: false,
    showBottomWindow: false,
    form:{//主页表单
      belongCity:'',//发货地 订单所属区域(定位的城市id)
      carList:[],//车辆列表
      code:[],//城市code
      date: new Date(),//选择日期
      timeList:[],//时间列表
      time:'',//选择的时间
      _cityAdcode: [], //城市名与坐标
      carType:'',//滑块ID
      carTypeItemLeft:0,//滑块开始位置
      carTypeItemWidth:0,//滑块宽度
      initialIndex:0,//车型图片位置
  
      serviceCode:'',//额外服务要使用
      showSpecWindow:false,//显示车辆规格窗口
  
      priceId: '',//定价id
      priceType: '',//定价类型 1标准定价 2区域定价
      to:[{
        consignee: "",//收货人姓名
        consigneeMobile: app.storage.get_s('userInfo') ? app.storage.get_s('userInfo').mobile : "",//收货人电话
        isSms: 0,//是否短信通知(1为是，0为否)
        origin: "",//地点名称详细地址
        originCoordinate: "",//地点坐标(格式22.5253951835,114.0988813763纬度经度)
        originName: "",//地点名称
        provinceCityArea: "",//省市区（格式:广东省,广州市,天河区）
        shipperSort: 0,//线路排序号
        addressDetail: '' // 弹窗详细地址
      },
        {
          consignee: "",
          consigneeMobile: app.storage.get_s('userInfo') ? app.storage.get_s('userInfo').mobile : "",
          isSms: 0,
          origin: "",
          originCoordinate: "",
          originName: "",
          provinceCityArea: "",
          shipperSort: 1,
          addressDetail: ''
        }
      ],
      mathPriceList: {},
      _timeId: 0, // 选择时间 2.0
      _time: '' // 显示在小货车页面的时间 2.0
    },
    day: [],
    hour: [],
    minute: [],
    multiIndex: [0, 0, 0],
    _allHour:[], //24小时
    _allMinute: [{ id: "00", name: '00分' }, { id: "15", name: '15分' },{ id: "30", name: '30分' },{ id: "45", name: '45分' }],
    _haveMin:[], //余下的分钟
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindChange: function(e) {
      this.setData({
        multiIndex: e.detail.value
      })
      if(e.detail.value[0] === 0){
        this.getTime()
      } else {
        this.setData({
          hour:this.data._allHour,
          minute: this.data._allMinute
        })
        return //防止[0,0,x] 时 下面的minute: this.data.allMinute被重新赋值
      }

      if(e.detail.value[1] === 0){
        this.setData({
          minute: this.data._haveMin
        })
      } else {
        this.setData({
          minute: this.data._allMinute
        })
      }

    },
    timeOk: function() {
      let i = this.data.multiIndex
      this.setData({
        multiIndex: [0, 0, 0],
        'form._timeId': 1,
        'form._time': `${this.data.day[i[0]].name} ${this.data.hour[i[1]].id}:${this.data.minute[i[2]].id}`,
        'form.time': `${new Date(this.data.day[i[0]].id).format("yyyy-MM-dd")} ${this.data.hour[i[1]].id}:${this.data.minute[i[2]].id}:00`
      })
      this.closeBottomWindow()
    },
    closeBottomWindow: function () {
      animation.opacity(0).step()
      animationBottom.bottom('-72%').step()
      this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
      setTimeout(() => {
        this.setData({
          multiIndex: [0, 0, 0],
          showBottomWindow: false
        })
      }, 250)
    },
    getTime: function() {
      //第一列
      let timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) * 1;
      let day = [],hour = [],minute = []
      for (let i = 0; i < 7; i++) {
        let monthAdd = timeStamp + 86400000 * i
        if(i === 0){
          day.push({ id: monthAdd, name: '今天' })
        } else if (i === 1) {
          day.push({ id: monthAdd, name: '明天' })
        } else {
          day.push({ id: monthAdd, name: new Date(monthAdd).format("MM月dd号") })
        }
      }
      //今天余下多少小时 列 
      let now = new Date() * 1;
      let EndTime = timeStamp + 86400000;
      let haveTime = EndTime - now;
      let t1 = 60 * 1000 * 15;
      let timeList = [], hourList = [];
      let ii = Math.ceil(haveTime / t1) - 3;
      for (let i = ii; i >= 0; i--) {
        timeList.push([new Date(EndTime - t1 * i).format("hh"), new Date(EndTime - t1 * i).format("mm")])
      }
      timeList.forEach((item)=>{
        hourList.push(item[0])
      })
      hourList.pop()
      let newArrHour = Array.from(new Set(hourList))
      newArrHour.forEach((item)=>{
        hour.push({id:item, name:item+ '点'})
      })
      //今天余下多少分 列 
      timeList.forEach((item)=>{
        if (item[0] === newArrHour[0]) {
          minute.push({ id:item[1], name:item[1]+'分'})
        }
      })
      this.setData({
        day,
        hour,
        minute,
        _haveMin: minute
      })
    },
    changeTime: function(e) {
      let id = e.currentTarget.dataset.id
      if (id === 0) {
        this.setData({
          'form._timeId': id,
          'form.time': '',
          'form._time': ''
        })
      } else {
        this.setData({showBottomWindow: true})
        animation.opacity(1).step()
        animationBottom.bottom(0).step()
        this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export() })
        this.getTime()
      }
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
    closeAddressWindow: function(){
      animation.opacity(0).step()
      this.setData({ animationData: animation.export() })
      setTimeout(() => {
        this.setData({
          showAddressWindow: false
        })
      }, 250)

    },
    submitWindow: function(){
      animation.opacity(0).step()
      this.setData({ animationData: animation.export() })
      this.setData({
        ["form.to[" + this.data.addr.shipperSort + "].addressDetail"]: this.data.addr.addressDetail,
        ["form.to[" + this.data.addr.shipperSort + "].consignee"]: this.data.addr.consignee,
        ["form.to[" + this.data.addr.shipperSort + "].consigneeMobile"]: this.data.addr.consigneeMobile,
        ["form.to[" + this.data.addr.shipperSort + "].isSms"]: this.data.addr.isSms
      })
      setTimeout(() => {
        this.setData({
          showAddressWindow: false
        })
      }, 250)
    },
    addAddressList: function() {
      if (this.data.form.to.length >= 10) {
        wx.showToast({
          title: '最多只能添加十条目的地',
          icon: 'none',
          duration: 2000
        })
        return
      }
      let to = this.data.form.to
      to.push({
        consignee: "",
        consigneeMobile: app.storage.get_s('userInfo') ? app.storage.get_s('userInfo').mobile : "",
        isSms: 0,
        origin: "",
        originCoordinate: "",
        originName: "",
        provinceCityArea: "",
        shipperSort: this.data.form.to.length,
        addressDetail: ''
      })
      this.setData({
        'form.to': to
      })
      if(this.data.form.to.length === 3 && !app.storage.get_s('hasShowXiaoHuoCheTips')) {
        this.setData({
          showXiaoHuoCheTips: true
        })
      }
    },
    setTips: function() {
      this.setData({
        showXiaoHuoCheTips: false
      })
      app.storage.set('hasShowXiaoHuoCheTips', true)
    },
    updateAddressList: function(e) {
      let i = e.currentTarget.dataset.index
      let to = this.data.form.to
      to.splice(i, 1);
      to.forEach((item, i) => {
        item.shipperSort = i
      });
      this.setData({
        'form.to': to
      })
    },
    toShowMap: function(e) {
      let item = e.currentTarget.dataset.item, originCoordinate;
      if (item.originCoordinate === ''){
        originCoordinate = this.data._cityCoordinate
      } else{
        originCoordinate = item.originCoordinate.split(',').reverse().join(',')
      }
      wx.navigateTo({
        url: `/pages/ui2.0/showMap/showMap?item=${JSON.stringify(item)}&originCoordinate=${originCoordinate}`
      })
    },
    showWindow: function(e) {
      let item = e.currentTarget.dataset.item
      this.setData({
        addr: item,
        showAddressWindow: true
      })
      animation.opacity(1).step()
      this.setData({ animationData: animation.export() })
    },
    changeCarTypePicHandler: function(e) {
      let i = e.detail.current
      this.setData({
        'form.initialIndex': i,
        'form.carType': this.data.form.carList[i].carType,
        'form.carTypeItemLeft': this.data.form.carList[i].left,
        'form.carTypeItemWidth': this.data.form.carList[i].width,
        'form.priceId': this.data.form.carList[i].list[0].id,
        'form.priceType': this.data.form.carList[i].list[0].priceType,
        'form.specCode': this.data.form.carList[i].specNameSelected
      })
      this.triggerEvent('getCarChange', { form: this.data.form });

      this.carTypeScroll();
    },
    carTypeScroll: function(){
      let query = this.createSelectorQuery();
      query.select('#carTypeItem').boundingClientRect();
      query.exec(ele => {
        let carTypeWidth = ele[0].width
        let center = this.data.form.carTypeItemLeft - (carTypeWidth / 2) + (this.data.form.carTypeItemWidth / 2)
        this.setData({ scrollLeft: center })
      })
    },
    changeCarTypePicHandler2: function(e){
      let dir = e.currentTarget.dataset.dir;
      let initialIndex = this.data.form.initialIndex
      if (dir === 'left' && this.data.form.initialIndex > 0){
        --initialIndex
        this.setData({ 'form.initialIndex': initialIndex })
      }else if (dir === 'right' && this.data.form.initialIndex < (this.data.form.carList.length - 1)){
        ++initialIndex
        this.setData({ 'form.initialIndex': initialIndex })
      }
    },
    selectCarType: function(e) {
      let i = e.target.dataset.index;
      let item = e.target.dataset.item;
      this.setData({
        'form.initialIndex': i,
        'form.carType': item.carType,
        'form.carTypeItemLeft': item.left,
        'form.carTypeItemWidth': item.width
      })
    },
    getPriceList: function(code) {
    app.xhr('GET', `/aflc-sm/aflcPriceApi/getPriceByArea/${code}`, null, (res) => {
      if (res.data.status === 200) {
        let list = []
        res.data.data[0].list.forEach((item) => {
          item.list[0].show = false;
          item.specNameSelected = '';
          item.list[0].specName = item.list[0].specName.split(',');
          item.list[0].capacityTon = (item.list[0].capacityTon+'').indexOf('.')=== -1?item.list[0].capacityTon + '.0':item.list[0].capacityTon;
          item.list[0].capacitySquare = (item.list[0].capacitySquare+'').indexOf('.')=== -1?item.list[0].capacitySquare + '.0':item.list[0].capacitySquare;
          // list.push({
          //   couponId: '',
          //   orderDiscountAmount: 0,
          //   isUse: '',
          //   carType: item.carType,
          //   carTypeName: item.carTypeName
          // })
          //生成couponIdList
          // this.setData({'form.mathPriceList.couponIdList': list})
        });
        this.setData({ 
          'form.carList': res.data.data[0].list, 
          'form.serviceCode': res.data.data[0].serviceCode, 
          'form.carType': res.data.data[0].list[0].carType,
          'form.priceId': res.data.data[0].list[0].list[0].id,
          'form.priceType': res.data.data[0].list[0].list[0].priceType,
          'form.specCode': '',
          'form.initialIndex': 0
          })
        const query = this.createSelectorQuery()
        query.selectAll('.carType-item').boundingClientRect()
        query.exec((res1)=> {
          let list = res.data.data[0].list
          let l = 0;
          res1[0].forEach((item, i) => {
            list[i].width = item.width;
            l = l + item.width;
            list[i].left = l - item.width
          });
          this.setData({
            'form.carList': list,
            'form.carTypeItemLeft': list[0].left,
            'form.carTypeItemWidth': list[0].width
          })
        })
      }
    })
    },
    getCity: function(){
      myAmapFun.getRegeo({
        success: (data) => {
          // console.log(data)
          //初始化城市code,传送到城市选择页面的定们城市
        let adcode =  data[0].regeocodeData.addressComponent.adcode.substr(0, 4) + '00'
          app.storage.set('cityAdcodeFirst', [data[0].regeocodeData.addressComponent.city, adcode])
          this.setData({ 
            'form._cityAdcode': [data[0].regeocodeData.addressComponent.city, adcode],
            _cityCoordinate: [data[0].longitude, data[0].latitude]
            })
            this.triggerEvent('getCityAdcode', { _cityAdcode: this.data.form._cityAdcode });
          this.getPriceList(adcode)
        },
        fail: (info) => {
          wx.showModal({
            title: "请允许授权获取地理位置",
            success: () => {
              wx.openSetting({
                complete(res) {
                  console.log(res)
                }
              })
            }
          })
        }
      })
    },
    test (){
      console.log(this.data);
      
    }
  },
  lifetimes: {
    created: function() {
      let _allHour = [],b;
      for(let i = 0; i < 24; i++){
        i < 10 ? b = `0${i}` : b = i
        _allHour.push({ id: b+'', name: b+'点' })
      }
      this.setData({
        _allHour,
      })
    },
    ready: function() {
      // console.log(this.data)
      if(this.data.xiaoHuocheDataJs){
        // this.data.xiaoHuocheData从orderNext传入
        this.setData({
          form: this.data.xiaoHuocheDataJs.form
        })
        // 换了城市
        if (this.data.cityAdcode.length > 0 && this.data.form._cityAdcode.length > 0 && this.data.cityAdcode[1] !== this.data.form._cityAdcode[1]) {
          this.setData({
            'form._cityAdcode': this.data.cityAdcode
          })
          this.getPriceList(this.data.cityAdcode[1])
        }
      } else {
        // 初始化
        this.getCity()
      }
    }
  },
  pageLifetimes: {
    show: function() {
      animation.opacity(0).step()
      animationBottom.bottom('-72%').step()
      this.setData({ animationData: animation.export(), animationDataBottom: animationBottom.export(), showAddressWindow: false })
      if(this.data._changeRun){
        this.setData({
          _changeRun: false
        })
        return
      }
      // 从地图页面返回 换了城市
      if (this.data.cityAdcode.length > 0 && this.data.form._cityAdcode.length > 0 && this.data.cityAdcode[1] !== this.data.form._cityAdcode[1]) {
        //计算
        this.setData({
          'form._cityAdcode': this.data.cityAdcode
        })
        // 来自城市页面而且改了城市
        if(this.data.fromCity){
          this.setData({
            fromCity: false,
            'form.belongCity': '',
            'form.to': [{
              consignee: "",
              consigneeMobile: app.storage.get_s('userInfo') ? app.storage.get_s('userInfo').mobile : "",
              isSms: 0,
              origin: "",
              originCoordinate: "",
              originName: "",
              provinceCityArea: "",
              shipperSort: 0,
              addressDetail: ''
            },
              {
                consignee: "",
                consigneeMobile: app.storage.get_s('userInfo') ? app.storage.get_s('userInfo').mobile : "",
                isSms: 0,
                origin: "",
                originCoordinate: "",
                originName: "",
                provinceCityArea: "",
                shipperSort: 1,
                addressDetail: ''
              }]
          })
        }
        this.getPriceList(this.data.form._cityAdcode[1])
      }
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  }
})
