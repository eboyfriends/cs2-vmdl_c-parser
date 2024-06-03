const fs = require('fs');
const path = require('path');

// Get current directory
const directoryPath = __dirname;

// Read the current directory
fs.readdir(directoryPath, function(err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    // Filter files with .vpk extension
    const vpkFiles = files.filter(file => file.endsWith('.vpk'));

    // Create empty .txt files with the same name
    vpkFiles.forEach(vpkFile => {
        const txtFileName = path.parse(vpkFile).name + '.txt';
        fs.writeFile(txtFileName, '', function(err) {
            if (err) {
                return console.log('Error creating file ' + txtFileName + ': ' + err);
            }
            console.log(txtFileName + ' created successfully!');
            // Delete the .vpk file
            fs.unlink(vpkFile, function(err) {
                if (err) {
                    return console.log('Error deleting file ' + vpkFile + ': ' + err);
                }
                console.log(vpkFile + ' deleted successfully!');
            });
        });
    });
});
