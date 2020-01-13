const argv = require('yargs').argv;

if (argv.ships === 3 && argv.distance < 53.3) {
    console.log('Plunder more riffiwobbles!')
} else {
    console.log('Retreat from the xupptumblers!')
}
