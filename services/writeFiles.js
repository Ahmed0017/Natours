const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdirp = require('mkdirp');
const { uuid } = require('uuidv4');

const handleFiles = async (files, folderName, key = '') => {
  let fileNames = [];

  if (key) {
    await Promise.all(
      files[`${key}`].map(async file => {
        const ext = path.extname(file.originalname);
        const filename = `${uuid()}${ext}`;

        const filePath = `${path.join(
          `${__dirname}/../`,
          `public/img/${folderName}/${filename}`
        )}`;

        await promisify(fs.writeFile)(filePath, file.buffer, 'base64');

        fileNames.push(filename);
      })
    );

    files[`${key}`] = fileNames;
    fileNames = [];
  }

  if (!key) {
    await Promise.all(
      files.map(async file => {
        const ext = path.extname(file.originalname);
        const filename = `${uuid()}${ext}`;

        const filePath = `${path.join(
          `${__dirname}/../`,
          `public/img/${folderName}/${filename}`
        )}`;

        await promisify(fs.writeFile)(filePath, file.buffer, 'base64');

        fileNames.push(filename);
      })
    );

    return fileNames;
  }
};

module.exports = async (files, folderName, type) => {
  try {
    /*
     *** Create NEW folder if NOT exists
     */
    await mkdirp(`public/img/${folderName}`);

    if (type === 'fields') {
      const fileKeys = Object.keys(files);

      await Promise.all(
        fileKeys.map(async key => {
          await handleFiles(files, folderName, key);
        })
      );
    }

    if (type === 'array') {
      return await handleFiles(files, folderName);
    }
  } catch (err) {
    throw new Error('Error Writing files! Please try again later.');
  }
};
