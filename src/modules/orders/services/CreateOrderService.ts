import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError("Costumer doesn't exists.");
    }

    const productsDb = await this.productsRepository.findAllById(products);

    if (!productsDb) {
      throw new AppError('No products found.');
    }

    const produtsToPersist = productsDb.map(product => {
      const pd = products.find(pd => pd.id == product.id);

      return {
        product_id: product.id,
        price: product.price,
        quantity: pd ? pd.quantity : 0,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: produtsToPersist,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
