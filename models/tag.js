const {mongoose} = require('../core/mongodb')
const autoIncrement = require('mongoose-auto-increment')

const tagSchema = new mongoose.Schema({
    name: {type: String, required: true, validate: /\S+/},
    desc: String,
    icon: String,
    create_time: {type: Date, default: Date.now},
    update_time: {type: Date, default: Date.now}
})
tagSchema.plugin(autoIncrement.plugin, {
    model: 'Tag',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})
module.exports = mongoose.model('Tag', tagSchema)
