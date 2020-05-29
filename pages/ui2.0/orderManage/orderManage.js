let app = getApp()
let animation = wx.createAnimation({
  duration: 250,
  timingFunction: 'ease-in-out',
})

let pageStart = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: app.globalData.navHeight,
    mask: false,
    animationData: {},
    animationRotate: {},
    itemLeft: 0, //滑块开始位置
    categoryCur: 0,// 当前数据列索引
    categoryData: [
      { id: 0, name: '全部' }, { id: 1, name: '待付款' }, { id: 2, name: '服务中' }, { id: 3, name: '已完成' }, { id: 4, name: '已取消' }
    ],// // 所有数据列
    titleList:['同城快车','零担专线','干线整车'],
    title:'同城快车'
  },
  clickTitle(){
    let mask = !this.data.mask
    if(mask){
      animation.rotate(180).step()
    } else {
      animation.rotate(360).step()
    }
    this.setData({mask, animationRotate: animation.export() })
  },
  clickItem(e){

  },
  getList(type, currentPage) {
    let currentCur = this.data.categoryCur;
		let pageData = this.getCurrentData(currentCur);

    if (type !== "refresh" && pageData.end) return;
    console.log(pageData)

		pageData.requesting = true;
    this.setCurrentData(currentCur, pageData);
    
    setTimeout(() => {
      pageData.requesting = false;
      this.setCurrentData(currentCur, pageData);
    }, 350);

  },

  	// 更新页面数据
	setCurrentData(currentCur, pageData) {
		let categoryData = this.data.categoryData
		categoryData[currentCur] = pageData
		this.setData({
			categoryData: categoryData
		})
	},

  	// 获取当前激活页面的数据
	getCurrentData() {
		return this.data.categoryData[this.data.categoryCur]
  },
  // 页面滑动切换事件
	bindchange(e) {
    let i = e.detail.current;
		setTimeout(() => {
			this.setData({
        categoryCur: i,
        itemLeft: this.data.categoryData[i].left
      });
      this.tabAnimation()
			let pageData = this.getCurrentData();
			if (pageData.listData.length === 0) {
				this.getList('refresh', pageStart);
			}
		}, 0);
  },
  	// 刷新数据
	refresh() {
		this.getList('refresh', pageStart);
  },
  	// 加载更多
	more() {
    console.log(12);
    
		// this.getList('more', this.getCurrentData(this.data.categoryCur).page);
	},
  selectTabItem(e){
    let i = e.currentTarget.dataset.i;
    let item = e.currentTarget.dataset.item;
    this.setData({
      categoryCur: i,
      itemLeft: item.left
    })
    this.tabAnimation()
  },
  tabAnimation(){
    animation.left(this.data.itemLeft).step()
    this.setData({ animationData: animation.export() })
  },
  navBack(){
    wx.navigateBack({
      delta: 2
    })
  },
  onLoad: function (options) {
        let categoryData = this.data.categoryData
        categoryData.forEach((item,index) => {
          item.requesting = false
					item.end = false
          item.emptyShow = false
          item.listData = [{},{},{},{}]
          item.page = pageStart
        })
        this.setData({
          categoryData
        })
        			// 第一次加载延迟 350 毫秒 防止第一次动画效果不能完全体验
			setTimeout(() => {
				this.refresh();
			}, 350);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery()
    query.selectAll('.tab-item').boundingClientRect()
    query.select('.slider').boundingClientRect()
    query.exec((res1)=> {
      let list = this.data.categoryData
      let l = 0;
      res1[0].forEach((item, i) => {
        list[i].width = item.width;
        l = l + item.width;
        list[i].left = l - item.width/2 - res1[1].width/2
      });
      this.setData({
        categoryData: list,
        itemLeft: list[0].left
      })
      this.tabAnimation()
    })
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