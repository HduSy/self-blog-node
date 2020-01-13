const mongoose = require('mongoose');
const consola = require('consola');
const CONFIG = require('../app.config');
const autoIncrement = require('mongoose-auto-increment');

// remove deprecatedWarnings
mongoose.set('useFindAndModify', false);
module.exports.mongoose = mongoose;
/**
 * 配置并连接Mongo数据库
 * @return {Mongoose}
 */
module.exports.connect = () => {
    mongoose.connect(CONFIG.MONGODB.uri, {
        useCreateIndex: true,
        useNewUrlParser: true
    });
    mongoose.connection.on('error', error => {
        consola.warn(`数据库连接失败!${error}`)
    });
    mongoose.connection.once('open', () => {
        consola.ready('数据库连接成功!')
    });
    autoIncrement.initialize(mongoose.connection);
    return mongoose;
}
