var DB_FILENAME = './offers-db.json';

var fs = require("fs");

var db;

// Create and open file
function openDb() {
    var dbFileDescriptor = fs.openSync(DB_FILENAME, 'a+');
    fs.closeSync(dbFileDescriptor);
    var dbContent = fs.readFileSync(DB_FILENAME, 'utf-8') || '{}';
    db = JSON.parse(dbContent);
}

function saveOffer(key, offer) {
    var exists = db[key] || null;
    if (exists) {
        console.log(`Key ${key} already exist`);
        return false;
    } else {
        db[key] = true;
        return offer;
    }
}

function closeAndPersist() {
    fs.writeFileSync(DB_FILENAME, JSON.stringify(db), 'utf-8');
}

module.exports = {
    openDb: openDb,
    saveOffer: saveOffer,
    closeAndPersist: closeAndPersist
}
