const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{231A}\u{23F3}\u{2328}\u{23F0}\u{2B50}\u{1F004}]/gu;

function walkDir(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stats) => {
                if (stats.isDirectory()) {
                    walkDir(filePath);
                } else if (filePath.endsWith('.jsx')) {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) return console.error(err);
                        if (emojiRegex.test(data)) {
                            const updatedData = data.replace(emojiRegex, '');
                            fs.writeFile(filePath, updatedData, 'utf8', err => {
                                if (err) console.error(err);
                                else console.log(`Removed emojis from ${filePath}`);
                            });
                        }
                    });
                }
            });
        });
    });
}

walkDir(directoryPath);
