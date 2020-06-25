const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const checkValidation = require('../utils/checkValidation');
const resizeWriteImages = require('../services/resizeWriteImages');

const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(Model.find(), req.query)
      .filtering()
      .sorting()
      .limiting()
      .pagination();

    const docs = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      result: docs.length,
      data: {
        data: docs
      }
    });
  });

exports.getOne = (Model, populate) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populate) query = query.populate(populate);

    const doc = await query;

    if (!doc) return next(new AppError('No document found with that ID!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = (Model, populate) =>
  catchAsync(async (req, res, next) => {
    let data;

    if (Model === Tour) {
      if (!req.files) return next(new AppError('Please send just form data', 400));

      if (!req.files.imageCover)
        return next(new AppError('A tour must have a cover image', 400));

      data = checkValidation(req);

      await resizeWriteImages(req.files, 'tours', 'fields', 2000, 1333, 'png');

      data.imageCover = req.files.imageCover[0];

      if (req.files.images) data.images = req.files.images;
    }

    if (Model === Review) {
      data = checkValidation(req);
      data.user = req.user.id;
    }

    if (Model === Booking) {
      data = checkValidation(req);
      data.user = req.user.id;
    }

    let doc = await Model.create(data);

    doc.password = undefined;

    if (populate)
      // Populate when create
      doc = await Model.populate(doc, populate);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const data = checkValidation(req);

    if (req.files && Model === Tour) {
      await resizeWriteImages(req.files, 'tours', 'fields', 2000, 1333, 'png');
      if (req.files.imageCover) data.imageCover = req.files.imageCover[0];
      if (req.files.images) data.images = req.files.images;
    }

    if (Model === Review) {
      // Check if user try to update other users review
      const r = await Model.findOne({ _id: req.params.id, user: req.user.id });
      if (!r) return next(new AppError('No document found with that ID!', 404));
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!doc) return next(new AppError('No document found with that ID!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document found with that ID!', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
