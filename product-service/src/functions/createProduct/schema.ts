export default {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 5 },
    sku: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 5 },
    description: { type: 'string', minLength: 5 },
    price: { type: 'integer', minimum: 0 },
    count: { type: 'integer', minimum: 0 },
    // id: { type: 'string', minLength: 0 },
  },
  required: ['title', 'description', 'count', 'price', 'slug', 'sku'],
} as const
