import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    console.log(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return product;
  }

  public async findAllById(productIds: IFindProducts[]): Promise<Product[]> {
    const products = await this.ormRepository.find({
      where: In(productIds),
    });

    return products;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const ids = products.map(product => {
      return { id: product.id };
    }) as IFindProducts[];

    const productsDb = await this.findAllById(ids);

    for (var i in productsDb) {
      var prod = products.find(product => product.id == productsDb[i].id);

      if (prod) {
        productsDb[i].quantity = productsDb[i].quantity - prod.quantity;
      }

      await this.ormRepository.save(productsDb[i]);
    }

    return productsDb;
  }
}

export default ProductsRepository;
