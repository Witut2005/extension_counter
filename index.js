const walk = require('walk');
const { parser } = require('args-command-parser');
const files = [];

const argv = parser().data;

let directoryToWalk = argv.longSwitches.path;
const extensionToIgnore = argv.longSwitches.ignore;

const presentExtensions = new Set();
const filesExtensions = [];

let filesTotal = 0;

directoryToWalk = directoryToWalk[0];

if (!directoryToWalk) {
    console.error('You must specify a directory');
    return;
} else {

    const walker = walk.walk(directoryToWalk);
    walker.on('file', function(root, entry, next) {
        // files.push(root + '/' + entry.name);

        fileExtension = entry.name.split('.')[1]

        addToFiles = true;
        for (x in extensionToIgnore) {
            if (fileExtension == extensionToIgnore[x]) {
                addToFiles = false;
            }
        }

        if (addToFiles) {
            if (fileExtension == undefined) {
                fileExtension = 'no extension'
            }

            presentExtensions.add(fileExtension);

            filesExtensions.push(fileExtension)
            filesTotal++;
        }

        next();
    });

    walker.on('end', () => {



        let filesExtensionData = new Map();

        for (x of presentExtensions) {
            filesExtensionData.set(x, filesExtensions.filter((a) => {
                if (a == x) return true;
                else false;
            }).length)
        }

        console.log('\nFiles total: ', filesTotal, '\n')

        filesExtensionData = new Map([...filesExtensionData.entries()].sort((a, b) => {
            if (b[1] >= a[1])
                return 1;
            else
                return -1;
        }))

        for (let [key, value] of filesExtensionData)
            console.log((key + ': ').padEnd(20, ' ') + (((value / filesTotal) * 100).toFixed(2) + '%'))


    });
}