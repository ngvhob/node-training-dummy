const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const queryVerifyNotFound = async (bool, res, next) => {
  if (!bool) {
    return next(new AppError('No documnet found!', 404));
  } else {
    res.status(201).json({
      Status: 'success',
      Results: bool.length,
      Document: bool
    });
  }
};

const queryVerifyNotCreated = async (bool, res, next, message) => {
  if (!bool) {
    return next(new AppError(message, 500));
  } else {
    res.status(201).json({
      Status: 'success',
      Results: bool.length,
      Document: bool
    });
  }
};

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const Doc = await features.query;
    // const Doc = await features.query.explain();
    await queryVerifyNotFound(Doc, res, next);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const Doc = await query;
    if (!Doc) {
      return next(new AppError('No document found by this id.', 404));
    } else {
      res.status(200).json({
        status: 'success',
        requestedAt: requestedAt,
        data: {
          Document: Doc
        }
      });
    }
  });

exports.createOne = (Model, message = 'Document not created!') =>
  catchAsync(async (req, res, next) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.status(500).json({
        message: {
          status: ['fail'],
          message: 'No data Given'
        }
      });
      return;
    }
    const headers = req.body;
    const Doc = await Model.create(headers);
    await queryVerifyNotCreated(Doc, res, next, message);
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const query = req.params.id;
    const Doc = await Model.findByIdAndDelete(query);
    await queryVerifyNotFound(Doc, res, next);
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      res.status(500).json({
        message: {
          status: ['fail'],
          message: 'No data Given'
        }
      });
      return;
    }
    const query = req.params.id;
    const Doc = await Model.findByIdAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });
    await queryVerifyNotFound(Doc, res, next);
  });
