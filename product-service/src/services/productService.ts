import {
  createRequestBuilder,
} from '@commercetools/api-request-builder'

import {CommercetoolsClientService} from "./commercetoolsClientService";

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

export interface Product {
  price: number
  count: number
  description?: string
  title: string
  id?: string,
  image?: string,
  slug?: string
  sku?: string
}

export class ProductService {
  constructor(private commercetoolsClientService: CommercetoolsClientService) {}

  private readonly mapProductToDTO = p => ({
    title: p.masterData.current.name['en-US'],
    description: p.masterData.current.description?.['en-US'],
    id: p.id,
    price: p.masterData.current.masterVariant.prices[0].value.centAmount / 100,
    image: p.masterData.current.masterVariant.images?.[0]?.url,
    count: p.masterData.current.masterVariant.availability?.availableQuantity || 0,
  });

  async getProducts(): Promise<Product[]> {
    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.build()
    const request = {
      uri,
      method: 'GET',
    }

    const {body: {results}} = await this.commercetoolsClientService.execute(request)

    return (results as Array<Record<string, any>>).map(this.mapProductToDTO)
  }

  async getProductById(id: string): Promise<Product> {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(id)) {
      throw new ValidationError()
    }
    const product = await this.getStoredProduct(id);

    return this.mapProductToDTO(product)
  }

  private async getStoredProduct(id: string) {
    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.byId(id).build()
    const request = {
      uri,
      method: 'GET',
    }

    const {body: product} = await this.commercetoolsClientService.execute(request)
    return product;
  }

  private async getVersion(id: string): Promise<number> {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(id)) {
      throw new ValidationError()
    }

    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.byId(id).build()
    const request = {
      uri,
      method: 'GET',
    }

    const {body: product} = await this.commercetoolsClientService.execute(request)

    return product.version
  }

  async deleteProduct(id: string): Promise<void> {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(id)) {
      throw new ValidationError()
    }
    const updatedVersion = await this.unpublishProduct(id)

    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.byId(id).withVersion(updatedVersion).build()
    const request = {
      uri,
      method: 'DELETE',
    }

    await this.commercetoolsClientService.execute(request)
  }

  async unpublishProduct(id: string): Promise<number> {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(id)) {
      throw new ValidationError()
    }

    const version = await this.getVersion(id)
    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.byId(id).withVersion(1).build()
    const request = {
      uri,
      method: 'POST',
      body: {
        version,
        actions: [
          {
            action: "unpublish"
          }
        ]
      }
    }

    const {body: {version: updatedVersion}} = await this.commercetoolsClientService.execute(request)

    return updatedVersion
  }

  async createInventoryEntry(sku: string, quantityOnStock: number): Promise<any> {
    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.inventory.build()
    const request = {
      uri,
      method: 'POST',
      body: {
        sku,
        quantityOnStock
      }
    }

    const {body} = await this.commercetoolsClientService.execute(request)

    return body
  }

  // async updateProduct(product: Product): Promise<Product> {
  //   if (
  //       typeof product.id !== 'string' ||
  //       typeof product.title !== 'string' ||
  //       typeof product.sku !== 'string' ||
  //       typeof product.slug !== 'string' ||
  //       typeof product.description !== 'string' ||
  //       typeof product.count !== 'number' ||
  //       typeof product.price !== 'number' ||
  //       product.title.length < 5 ||
  //       product.id.length < 5 ||
  //       product.count < 0 ||
  //       product.slug.length < 5 ||
  //       product.sku.length < 1 ||
  //       product.description.length < 5 ||
  //       product.price < 0
  //   ) {
  //     throw new ValidationError('validation error happened')
  //   }
  //
  //   const storedProduct = await this.getStoredProduct(product.id)
  //
  //   const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
  //   const uri = requestBuilder.products.byId(product.id).withVersion(storedProduct.version).build()
  //   const requestBody = []
  //   const request = {
  //     uri,
  //     method: 'POST',
  //     body: JSON.stringify(requestBody)
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.name['en-US'],
  //       storedProduct.masterData.current.description?.['en-US'],
  //       storedProduct.id,
  //       storedProduct.masterData.current.masterVariant.prices[0].value.centAmount / 100,
  //       storedProduct.masterData.current.masterVariant.images?.[0]?.url,
  //       storedProduct.masterData.current.masterVariant.availability?.availableQuantity || 0,
  //   ) {
  //
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.name['en-US'] !== product.title
  //   ) {
  //     requestBody.push({
  //       action: "changeName",
  //       name: {'en-US': product.title},
  //       staged: false
  //     })
  //   }
  //
  //   if (
  //           storedProduct.masterData.current.description?.['en-US'] !== product.description
  //   ) {
  //     requestBody.push({
  //       action: "setDescription",
  //       description: {'en-US': product.description},
  //       staged: false
  //     })
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.slug?.['en-US'] !== product.slug
  //   ) {
  //     requestBody.push({
  //       action: "changeSlug",
  //       slug: {'en-US': product.slug},
  //       staged: false
  //     })
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.masterVariant.prices[0].value.centAmount / 100 !== product.price
  //   ) {
  //     requestBody.push({
  //       action: "changePrice",
  //       priceId: storedProduct.masterData.current.masterVariant.prices[0].id,
  //       price: {
  //         centAmount: product.price * 100,
  //         type: "centPrecision",
  //         currencyCode: "EUR"
  //       },
  //       staged: false
  //     })
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.name['en-US'],
  //           storedProduct.masterData.current.description?.['en-US'],
  //           storedProduct.id,
  //       storedProduct.masterData.current.masterVariant.prices[0].value.centAmount / 100,
  //           storedProduct.masterData.current.masterVariant.images?.[0]?.url,
  //       storedProduct.masterData.current.masterVariant.availability?.availableQuantity || 0,
  //   ) {
  //
  //   }
  //
  //   if (
  //       storedProduct.masterData.current.name['en-US'],
  //           storedProduct.masterData.current.description?.['en-US'],
  //           storedProduct.id,
  //       storedProduct.masterData.current.masterVariant.prices[0].value.centAmount / 100,
  //           storedProduct.masterData.current.masterVariant.images?.[0]?.url,
  //       storedProduct.masterData.current.masterVariant.availability?.availableQuantity || 0,
  //   ) {
  //
  //   }
  //
  //   try {
  //     const {body: createdProduct} = await this.commercetoolsClientService.execute(request)
  //
  //     const availability = await this.createInventoryEntry(createdProduct.masterData.staged.masterVariant.sku, product.count)
  //     console.log('got availability', JSON.stringify(availability))
  //     createdProduct.masterData.current.masterVariant.availability = availability
  //
  //     return this.mapProductToDTO(createdProduct)
  //   } catch (e) {
  //     console.log('error happened', JSON.stringify(e))
  //     throw e
  //   }
  // }


  async createProduct(product: Product): Promise<Product> {
    if (
      typeof product.title !== 'string' ||
      typeof product.sku !== 'string' ||
      typeof product.slug !== 'string' ||
      typeof product.description !== 'string' ||
      typeof product.count !== 'number' ||
      typeof product.price !== 'number' ||
      product.title.length < 5 ||
      product.count < 0 ||
      product.slug.length < 5 ||
      product.sku.length < 1 ||
      product.description.length < 5 ||
      product.price < 0
    ) {
      throw new ValidationError('validation error happened')
    }

    const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
    const uri = requestBuilder.products.build()
    const request = {
      uri,
      method: 'POST',
      body: JSON.stringify({
        name: {'en-US': product.title},
        slug: {'en-US': product.slug},
        productType: {
          typeId: "product-type",
          id: "fc5302e3-72b0-4d7d-9c3e-595fdf4949dc"
        },
        masterVariant: {
          id: 1,
          prices: [
            {
              value: {
                centAmount: product.price * 100,
                type: "centPrecision",
                currencyCode: "EUR"
              }
            }
          ],
          sku: product.sku
        },
        publish: true
      })
    }

    try {
      const {body: createdProduct} = await this.commercetoolsClientService.execute(request)

      const availability = await this.createInventoryEntry(createdProduct.masterData.staged.masterVariant.sku, product.count)
      console.log('got availability', JSON.stringify(availability))
      createdProduct.masterData.current.masterVariant.availability = availability

      return this.mapProductToDTO(createdProduct)
    } catch (e) {
      console.log('error happened', JSON.stringify(e))
      throw e
    }
  }
}
