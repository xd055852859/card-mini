// pages/index/newItem.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        newItemArray: {
            "5": { name: "QQ", value: "", state: false },
            "6": { name: "微信", value: "", state: false },
            "7": { name: "Skype", value: "", state: false },
            "8": { name: "新浪微博", value: "", state: false },
            "9": { name: "Twitter", value: "", state: false },
            "10": { name: "Facebook", value: "", state: false },
            "11": { name: "添加URL", value: "", state: false },
        },
        customArray: {},
        disable: true,
        lastKey: 0,
        itemType: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //newItem
        if (options.itemType) {
            this.data.itemType = options.itemType;
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let newItem = {};
        let customArray = {};
        if (this.data.itemType == 0) {
            //加载数据
            newItem = wx.getStorageSync("newItem");
            customArray = wx.getStorageSync("customItem");
        } else if (this.data.itemType == 1) {
            newItem = wx.getStorageSync("newCard");
            customArray = wx.getStorageSync("customCard");
        }
        for (let i in newItem) {
            this.data.newItemArray[i].state = true;
            this.data.newItemArray[i].value = newItem[i].value
        }
        for (let i in customArray) {
            this.data.customArray[i] = customArray[i];
            this.data.lastKey = parseInt(i);
        }
        this.setData({
            newItemArray: this.data.newItemArray,
            customArray: this.data.customArray,
        })

    },
    chooseItem: function (e) {
        this.data.newItemArray[e.currentTarget.dataset.id].state = this.data.newItemArray[e.currentTarget.dataset.id].state ? false : true;
        this.setData({
            newItemArray: this.data.newItemArray
        })
    },
    getName: function (e) {
        this.data.customArray[e.currentTarget.dataset.id].name = e.detail.value;
    },
    addItem: function () {
        if (this.data.lastKey < 500) {
            this.data.lastKey = 499;
        }
        this.data.lastKey++;
        this.data.customArray[(this.data.lastKey++) + ""] = { name: "", value: "", defaultVisible: true };
        this.setData({
            customArray: this.data.customArray
        })
    },
    delItem: function (e) {
        delete this.data.customArray[e.currentTarget.dataset.id];
        this.setData({
            customArray: this.data.customArray
        })
    },
    saveItem: function () {
        this.setData({ disable: false });
        let pages = getCurrentPages(); //当前页面
        let prevPage = pages[pages.length - 2]; //上一页面
        let obj = {};
        for (let i in this.data.newItemArray) {
            if (this.data.newItemArray[i].state) {
                obj[i] = this.data.newItemArray[i]
            }
        }
        if (this.data.itemType == 0) {
            prevPage.setData({ //直接给上移页面赋值
                newItem: obj,
                customItem: this.data.customArray,
                addItemDisable: true
            });
        } else {
            prevPage.setData({ //直接给上移页面赋值
                newCard: obj,
                customCard: this.data.customArray,
                addCardDisable: true
            });
        }
        wx.navigateBack({ //返回
            delta: 1
        })
    }
})