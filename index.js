const fs = require('fs');
const walk = require('walk');
const util = require('util');
const { parser } = require('args-command-parser');
const files = [];

const argv = parser().data;

let directoryToWalk = argv.longSwitches.path;
const extensionToIgnore = argv.longSwitches.ignore;
const sortMethod = argv.longSwitches.sort == undefined ? 'files' : argv.longSwitches.sort;
const howManyDigits = argv.shortSwitches.a == undefined ? 2 : Number(argv.shortSwitches.a);
const presentExtensions = new Set();
const filesExtensions = [];
let linesWithGivenExtension = new Map();

let filesTotal = 0;
let linesTotal = 0;

if(argv.shortSwitches.h || argv.longSwitches.help)
{
    console.log('FileCount help\n');
    console.log('available switches:');
    console.log('--path'.padEnd(15, ' ') + 'folder to exam');
    console.log('--ignore'.padEnd(15, ' ') + 'extensions to ignore');
    console.log('--sort'.padEnd(15, ' ') + 'method of sorting (files or lines)');
    console.log('-a'.padEnd(15, ' ') + 'how many digits of float part to print\n');
    return;
}

try
{
    directoryToWalk = directoryToWalk[0];
}

catch
{
    console.error('You must specify a directory');
    return;
}


const walker = walk.walk(directoryToWalk);
walker.on('file', function(root, entry, next) {


    fileExtension = entry.name.split('.')[1]

    if (fileExtension == undefined) 
        fileExtension = 'no extension'

    addToFiles = true;
    for (x in extensionToIgnore) {
        if (fileExtension == extensionToIgnore[x]) {
            addToFiles = false;
        }
    }

    if (addToFiles) {
        
        presentExtensions.add(fileExtension);
        filesExtensions.push(fileExtension)
        filesTotal++;

        const file = fs.readFileSync(root + '/' + entry.name);
        let lines = (file.filter((a)=>{if(a == 0xA) return true; else return false;})).length;

        linesTotal = linesTotal + lines;

        if(linesWithGivenExtension.get(fileExtension) != undefined)
            lines = lines + Number(linesWithGivenExtension.get(fileExtension));

        linesWithGivenExtension.set(fileExtension, Number(lines));
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

    console.log(util.format('\n%d lines in %d files', linesTotal, filesTotal));
    console.log(util.format('within your folder are %d diffrent extensions\n', presentExtensions.size))

    filesExtensionData = new Map([...filesExtensionData.entries()].sort((a, b) => {
        if (b[1] >= a[1])
            return 1;
        else
            return -1;
    }))

    linesWithGivenExtension = new Map([...linesWithGivenExtension.entries()].sort((a, b) => {
        if(b[1] >= a[1])
            return 1;
        else 
            return -1;
    }))

    if(sortMethod == 'lines')
        for(let [key, value] of linesWithGivenExtension)
            console.log((key + ': ').padEnd(20, ' ') + (((value / linesTotal) * 100).toFixed(howManyDigits) + '%'))
    else 
        for (let [key, value] of filesExtensionData)
            console.log((key + ': ').padEnd(20, ' ') + (((value / filesTotal) * 100).toFixed(howManyDigits) + '%'))
        
    console.log('');

});
