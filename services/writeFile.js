const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdirp = require('mkdirp');
const { uuid } = require('uuidv4');

module.exports = async (file, folderName) => {
  try {
    /*
     *** Create NEW folder if NOT exists
     */
    await mkdirp(`public/img/${folderName}`);

    const ext = path.extname(file.originalname);

    file.filename = `${uuid()}${ext}`;

    const filePath = `${path.join(
      `${__dirname}/../`,
      `public/img/${folderName}/${file.filename}`
    )}`;

    await promisify(fs.writeFile)(filePath, file.buffer, 'base64');
  } catch (err) {
    throw new Error('Error Writing file! Please try again later.');
  }
};
