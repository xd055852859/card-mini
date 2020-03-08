// pages/card/search.js
let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    radioArr: [{ name: 'all', value: '全站', checked: 'true' },
    { name: 'local', value: '本地' }],
    radioArrCheck:"all",
    isIptValue:false, //是否显示删除
    searchValue:"",     //搜索
    currpage:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _that=this;
     wx.setNavigationBarTitle({ title: '搜索'})
  },
  //获取数据列表
getDataList:function(){
  var _that=this;
 
    var Url = _that.data.radioArrCheck == "local" ? "/friend/search" : "/user/searchNoFriend", parm = {};
    parm.nickName = _that.data.searchValue;
    parm.curPage = _that.data.currpage;
    if (_that.data.searchValue!=""){
      utils.getAjaxToken(Url, parm, (data) => {
        _that.setData({ "dataList": data })
      }) 
    }
    
},
radioChange: function (e) {
  this.setData({ "radioArrCheck": e.detail.value })
  this.getDataList();
},
  //输入搜索关键字
  schIptHanlder:function(e){
    var sval = e.detail.value;
    this.data.isIptValue = sval.length>0?true:false
    this.setData({
      "isIptValue": this.data.isIptValue,
      "searchValue": sval
      })
    if (sval&&sval!=""){
      this.getDataList();
    }else{
      this.setData({
        "isIptValue": false,
        "dataList": ""
      })
    }
      
   
    
  },
  //清除删除
  clearIptHanlder:function(){
    this.setData({
      "isIptValue": false,
      "searchValue": "",
      "dataList":""
    })
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