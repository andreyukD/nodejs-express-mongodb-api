class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/(\b(gte|gt|lte|lt)\b)/g, match => `$${match}`); //added $ sign

    //FILTERING
    //было let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this; //чтобы использовать цепочку в контроллере .filter().sort() итп
  }

  sort() {
    if (this.queryString.sort) {
      //127.0.0.1:3000/api/v1/tours?sort=-price //desc
      //127.0.0.1:3000/api/v1/tours?sort=price //asc

      //sort('price')
      //sort('price ratingsAverage')
      const sortBy = this.queryString.sort.split(',').join(' ');
      //127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage

      this.query = this.query.sort(sortBy); //query sort - из монгуза метод
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields); //projecting
    } else {
      //у него монгуз создавал поле в базе данных для каждого элемента __v:0 (че-то для своих целей). и чтоб его не показывать, можно показать всё, за исключением его (добавить минус)
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //to number or default 1
    const limit = this.queryString.limit * 1 || 100; //to number or default 100
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
