const mongoose = require('mongoose')
const stuSchema = new mongoose.Schema({
    fname: {type: String, required: true, default: 'yao'},
    lname: {type: String, required: true, default: 'song'},
    age: {type: Number, min: 18, max: 29}
})
const Stu = mongoose.model('Stu', stuSchema)
const yao = new Stu({fname: 'yao', age: 24})
//实例方法
stuSchema.methods.findSimilarNames = function (cb) {
    return this.model('Stu').find({fname: this.fname}, cb)
}
yao.findSimilarNames(function (err, fnames) {
    console.log(fnames)
})
//静态方法
stuSchema.statics.findByName = function (fname, cb) {
    return this.find({fname: new RegExp(fname, 'i')}, cb)
}
Stu.findByName('yao', function (err, fnames) {
    console.log(fnames)
})
//查询助手
stuSchema.query.ByName = function (fname) {
    return this.find({fname: new RegExp(fname, 'i')})
}
Stu.find().ByName('yao').exec(function (err, fnames) {
    console.log(fnames)
})
//虚拟值
stuSchema.virtual('fullname').get(function () {
    return this.fname + ' ' + this.lname
})
console.log(yao.fullname)
