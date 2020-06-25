const sharp = require('sharp');
const mkdirp = require('mkdirp');
const { uuid } = require('uuidv4');

module.exports = async (file, folderName, width, height, ext = '') => {
  try {
    /*
     *** Create NEW folder if NOT exists
     */
    await mkdirp(`public/img/${folderName}`);

    const defaultExt = file.mimetype.split('/')[1];
    file.filename = `${uuid()}.${ext || defaultExt}`;

    await sharp(file.buffer)
      .resize(width, height)
      .toFormat(ext || defaultExt)
      .toFile(`public/img/${folderName}/${file.filename}`);
  } catch (err) {
    throw new Error('Error Writing file! Please try again later.');
  }
};
