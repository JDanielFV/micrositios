const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');
const uploadsPath = path.join(__dirname, '../public/uploads');

// Recursive function to get all files
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

try {
    const allFiles = getAllFiles(uploadsPath);
    let dbContent = fs.readFileSync(dbPath, 'utf8');
    let changesMade = false;

    allFiles.forEach(filePath => {
        const filename = path.basename(filePath);
        if (filename.includes(' ')) {
            const newFilename = filename.replace(/\s+/g, '-');
            const newFilePath = path.join(path.dirname(filePath), newFilename);

            // Rename file
            fs.renameSync(filePath, newFilePath);
            console.log(`Renamed: ${filename} -> ${newFilename}`);

            // Update db.json content
            // We need to be careful to match the relative path used in db.json
            // The paths in db.json usually start with /uploads/...

            const relativeOldPath = filePath.split('public')[1]; // e.g., /uploads/slug/file name.ext
            const relativeNewPath = newFilePath.split('public')[1];

            // Escape special regex characters in the old path
            const escapedOldPath = relativeOldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedOldPath, 'g');

            if (dbContent.match(regex)) {
                dbContent = dbContent.replace(regex, relativeNewPath);
                console.log(`Updated db.json: ${relativeOldPath} -> ${relativeNewPath}`);
                changesMade = true;
            } else {
                // Try URL encoded version just in case
                const encodedOldPath = encodeURI(relativeOldPath);
                const escapedEncodedOldPath = encodedOldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexEncoded = new RegExp(escapedEncodedOldPath, 'g');
                if (dbContent.match(regexEncoded)) {
                    dbContent = dbContent.replace(regexEncoded, relativeNewPath);
                    console.log(`Updated db.json (encoded): ${encodedOldPath} -> ${relativeNewPath}`);
                    changesMade = true;
                }
            }
        }
    });

    if (changesMade) {
        fs.writeFileSync(dbPath, dbContent, 'utf8');
        console.log('db.json updated successfully.');
    } else {
        console.log('No changes needed in db.json.');
    }

} catch (err) {
    console.error('Error:', err);
}
