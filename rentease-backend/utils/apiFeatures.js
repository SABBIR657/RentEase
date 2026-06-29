// Helper class for search, filter, sort, pagination on mongoose queries
class APIFeatures {
  constructor(query, queryString) {
    this.query       = query;
    this.queryString = queryString;
  }

  filter() {
    const excludeFields = ['page', 'limit', 'sort', 'search'];
    const queryObj = { ...this.queryString };
    excludeFields.forEach(f => delete queryObj[f]);

    // Price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.rentPrice = {};
      if (queryObj.minPrice) queryObj.rentPrice.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) queryObj.rentPrice.$lte = Number(queryObj.maxPrice);
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Amenities (comma-separated → $all)
    if (queryObj.amenities) {
      queryObj.amenities = { $all: queryObj.amenities.split(',').map(a => a.trim()) };
    }

    // Numeric fields
    ['bedrooms', 'bathrooms', 'parking'].forEach(f => {
      if (queryObj[f]) queryObj[f] = Number(queryObj[f]);
    });

    this.query = this.query.find(queryObj);
    return this;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({ $text: { $search: this.queryString.search } });
    }
    return this;
  }

  sort() {
    const sortMap = {
      rentPrice_asc:  'rentPrice',
      rentPrice_desc: '-rentPrice',
      newest:         '-createdAt',
      rating:         '-averageRating',
    };
    const sortBy = sortMap[this.queryString.sort] || '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page  = Math.max(1, Number(this.queryString.page)  || 1);
    const limit = Math.min(50, Number(this.queryString.limit) || 12);
    this.query  = this.query.skip((page - 1) * limit).limit(limit);
    this.page   = page;
    this.limit  = limit;
    return this;
  }
}

module.exports = APIFeatures;
