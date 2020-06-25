const mkdirp = require('mkdirp');
const sharp = require('sharp');
const { uuid } = require('uuidv4');

const handleImages = async (files, folderName, width, height, ext, key = '') => {
  let images = [];

  if (key) {
    await Promise.all(
      files[`${key}`].map(async image => {
        const defaultExt = image.mimetype.split('/')[1];
        const filename = `${uuid()}.${ext || defaultExt}`;

        await sharp(image.buffer)
          .resize(width, height)
          .toFormat(ext || defaultExt)
          .toFile(`public/img/${folderName}/${filename}`);

        images.push(filename);
      })
    );

    files[`${key}`] = images;
    images = [];
  }

  if (!key) {
    await Promise.all(
      files.map(async image => {
        const defaultExt = image.mimetype.split('/')[1];
        const filename = `${uuid()}.${ext || defaultExt}`;

        await sharp(image.buffer)
          .resize(width, height)
          .toFormat(ext || defaultExt)
          .toFile(`public/img/${folderName}/${filename}`);

        images.push(filename);
      })
    );

    return images;
  }
};

module.exports = async (files, folderName, type, width, height, ext = '') => {
  try {
    /*
     *** Create NEW folder if NOT exists
     */
    await mkdirp(`public/img/${folderName}`);

    if (type === 'fields') {
      // try {
      const imageKeys = Object.keys(files);

      await Promise.all(
        imageKeys.map(async key => {
          await handleImages(files, folderName, width, height, ext, key);
        })
      );
    }

    if (type === 'array') {
      return await handleImages(files, folderName, width, height, ext);
    }
  } catch (err) {
    throw new Error('Error Writing files! Please try again later.');
  }
};
