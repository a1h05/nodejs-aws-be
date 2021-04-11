import { DbClientService } from './dbClientService'

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

export interface Product {
  price: number
  count: number
  description: string
  title: string
  id: string
}

export type NewProduct = Omit<Product, 'id'>

export class ProductService {
  constructor(private clientService: DbClientService) {}

  async getProducts(): Promise<Product[]> {
    const { rows: products } = await this.clientService
      .getClient()
      .query(
        'select * from products p left join stocks s on p.id = s.product_id'
      )

    return products
  }

  async getProductById(id: string): Promise<Product> {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(id)) {
      throw new ValidationError()
    }

    const text = `select * from products p left join stocks s on p.id = s.product_id where p.id = $1`
    const values = [id]
    const {
      rows: [product],
    } = await this.clientService.getClient().query(text, values)

    if (!product) {
      throw new NotFoundError()
    }

    return product
  }

  async createProduct(product: NewProduct): Promise<Product> {
    if (
      typeof product.title !== 'string' ||
      typeof product.description !== 'string' ||
      typeof product.count !== 'number' ||
      typeof product.price !== 'number' ||
      product.title.length < 5 ||
      product.description.length < 10 ||
      product.count < 0 ||
      product.price < 0
    ) {
      throw new ValidationError()
    }

    try {
      await this.clientService.getClient().query('BEGIN')

      const queryText =
        'INSERT INTO products(title, description, price) VALUES($1, $2, $3) RETURNING id'
      const res = await this.clientService
        .getClient()
        .query(queryText, [product.title, product.description, product.price])
      const id = res.rows[0].id
      const insertStockText =
        'INSERT INTO stocks(product_id, count) VALUES ($1, $2)'
      const insertStockValues = [id, product.count]
      await this.clientService
        .getClient()
        .query(insertStockText, insertStockValues)

      await this.clientService.getClient().query('COMMIT')

      return {
        title: product.title,
        count: product.count,
        description: product.description,
        price: product.price,
        id,
      }
    } catch (e) {
      await this.clientService.getClient().query('ROLLBACK')
      throw e
    }
  }
}
