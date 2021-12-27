import {
    formatJSONResponse,
    ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import {CommercetoolsClientService} from "../../services/commercetoolsClientService";
import {
    createRequestBuilder,
} from '@commercetools/api-request-builder'

export class PlaceOrderHandler {
    constructor(
        private commercetoolsClientService: CommercetoolsClientService
    ) {
    }

    placeOrder: ValidatedEventAPIGatewayProxyEvent<void> = async (event: any) => {
        try {
            let cart: any
            {
                const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
                const uri = requestBuilder.carts.build()
                const request = {
                    uri,
                    method: 'POST',
                    body: {
                        currency: "EUR",
                        taxMode: "Disabled",
                        lineItems: event.body.items.map(item => ({
                            productId: item.productId,
                            quantity: item.count
                        })),
                        shippingAddress: {
                            firstName: event.body.address.firstName,
                            lastName: event.body.address.lastName,
                            additionalAddressInfo: event.body.address.comment,
                            additionalStreetInfo: event.body.address.address,
                            country: "DE"
                        }
                    }
                }

                const {body} = await this.commercetoolsClientService.execute(request)
                cart = body
                console.log('got cart', JSON.stringify(cart))
            }

            {
                const requestBuilder = createRequestBuilder({projectKey: process.env.CTP_PROJECT_KEY})
                const uri = requestBuilder.orders.build()
                const request = {
                    uri,
                    method: 'POST',
                    body: {
                        cart: {
                            id: cart.id,
                            type: "Cart"
                        },
                        version: cart.version,
                        orderState: "Confirmed"
                    }
                }

                const {body: order} = await this.commercetoolsClientService.execute(request)
                console.log('got order', JSON.stringify(order))
                return formatJSONResponse(200, order)
            }
        } catch (e) {
            console.log(JSON.stringify(e))
            throw e
        }
    }
}
