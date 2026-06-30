export const PROPERTY_TYPES = ['house', 'apartment', 'unit', 'townhouse', 'studio', 'other']

export const AMENITIES_LIST = [
  'WiFi', 'Air Conditioning', 'Heating', 'Dishwasher', 'Washing Machine',
  'Dryer', 'Parking', 'Balcony', 'Garden', 'Pool', 'Gym', 'Elevator',
  'Furnished', 'Pet Friendly', 'Smoke Alarm', 'Security System',
]

export const STATUS_COLORS = {
  available: 'bg-green-100 text-green-700',
  rented:    'bg-red-100 text-red-700',
  pending:   'bg-yellow-100 text-yellow-700',
}

export const APPLICATION_STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
}

export const SORT_OPTIONS = [
  { value: 'newest',         label: 'Newest First' },
  { value: 'rentPrice_asc',  label: 'Price: Low to High' },
  { value: 'rentPrice_desc', label: 'Price: High to Low' },
  { value: 'rating',         label: 'Highest Rated' },
]