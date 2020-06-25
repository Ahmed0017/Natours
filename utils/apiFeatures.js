module.exports = class {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filtering() {
    const queryObj = { ...this.queryStr };

    const execludedFields = ['sort', 'page', 'limit', 'fields'];

    execludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));

    // REGEX
    if (queryStr.name) {
      queryStr.name = { $regex: queryStr.name, $options: 'i' };
    }

    if (queryStr.difficulty) {
      queryStr.difficulty = { $regex: queryStr.difficulty, $options: 'i' };
    }

    if (queryStr.summary) {
      queryStr.summary = { $regex: queryStr.summary, $options: 'i' };
    }

    if (queryStr.review) {
      queryStr.review = { $regex: queryStr.review, $options: 'i' };
    }

    if (queryStr.role) {
      queryStr.role = { $regex: queryStr.role, $options: 'i' };
    }

    this.query = this.query.find(queryStr);

    return this;
  }

  sorting() {
    if (this.queryStr.sort) {
      const sort = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sort);
    } else {
      this.query.sort('-createdAt');
    }

    return this;
  }

  limiting() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const limit = +this.queryStr.limit || 100;
    const page = +this.queryStr.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
