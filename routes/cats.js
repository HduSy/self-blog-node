const consola = require('consola')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
mongoose.set('useUnifiedTopology', true);
const db = mongoose.connection;
db.on('err', consola.log.bind(consola, 'Got problem'));
db.once('open', function () {
    consola.success("We've connected")
})
var kittySchema = mongoose.Schema({
    name: String
});
kittySchema.methods.speak = function () {
    var greeting = this.name
        ? 'Meow name is ' + this.name : 'I don\'t have a name';
    consola.info(greeting);
}
var Kitten = mongoose.model('Kitten', kittySchema);

var felyne = new Kitten({name: 'Felyne'})
consola.info(felyne.name)
felyne.speak()
// felyne.save((err, fluffy) => {
//     if (err) consola.error(err);
//     fluffy.speak();
// });

Kitten.find((err, kittens) => {
    if (err) consola.error(err);
    consola.info(kittens);
});
