const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const query = req.params.id;
    const Doc = await Model.findByIdAndDelete(query);
    if (!Doc) {
      return next(new AppError('No documnet found !'));
    }
    res.status(204).json({
      status: 'success',
      data: {
        message: `${query} Deleted`
      }
    });
  });
