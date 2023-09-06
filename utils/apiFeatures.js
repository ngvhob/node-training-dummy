class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      const queryObj = { ...this.queryString };
      const excludeFields = ['limit', 'sort', 'page', 'fields'];
      excludeFields.forEach(el => delete queryObj[el]);
      let queryObjStr = JSON.stringify(queryObj);
      queryObjStr = queryObjStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        match => `$${match}`
      ); // \b to match exact value in regex
      console.log(JSON.parse(queryObjStr));
      this.query = this.query.find(JSON.parse(queryObjStr));
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join('');
        // const fields = this.queryString.fields.replace(/\b(,)\b/g, ` `);
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    paginate() {
      const paginate = {
        // skip: parseInt(req.query.page) || '',
        // limit:  parseInt(req.query.limit) || ''
        skip: ((this.queryString.page * 1 || 1) - 1) * this.queryString.limit,
        limit: this.queryString.limit * 1 || 100 
      };
  
      if (this.queryString.page || this.queryString.limit) {
        // const skipLog = (paginate.skip - 1)*paginate.limit;
        this.query = this.query.skip(paginate.skip).limit(paginate.limit);
      } else {
        // this.query = this.query.skip(paginate.skip).limit(paginate.limit);
      }
      return this;
    }
  }

  module.exports = APIFeatures;