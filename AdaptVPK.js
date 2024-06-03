// thanks gpt

const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

fs.readdir(directoryPath, function(err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const vpkFiles = files.filter(file => file.endsWith('.vpk'));

    vpkFiles.forEach(vpkFile => {
        const txtFileName = path.parse(vpkFile).name + '.txt';
        fs.writeFile(txtFileName, '', function(err) {
            if (err) {
                return console.log('Error creating file ' + txtFileName + ': ' + err);
            }
            console.log(txtFileName + ' created successfully!');
            fs.unlink(vpkFile, function(err) {
                if (err) {
                    return console.log('Error deleting file ' + vpkFile + ': ' + err);
                }
                console.log(vpkFile + ' deleted successfully!');
            });
        });
    });
});
