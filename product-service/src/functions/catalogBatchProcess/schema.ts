export default {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 10 },
    description: { type: 'string', minLength: 5 },
    count: { type: 'integer', minimum: 0 },
    price: { type: 'integer', minimum: 0 },
  },
  required: ['title', 'description', 'count', 'price'],
} as const
