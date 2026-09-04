import { productRepository } from "@/lib/repositories";
import { generateProductCode } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  totalValue: number;
  categoriesCount: number;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt">;

export class ProductService {
  async getAll(): Promise<Product[]> {
    return productRepository.findAll();
  }

  async getById(id: string): Promise<Product | null> {
    return productRepository.findById(id);
  }

  async getNextCode(): Promise<string> {
    const codes = await productRepository.findAllCodes();
    return generateProductCode(codes);
  }

  async create(input: CreateProductInput): Promise<Product> {
    return productRepository.create(input);
  }

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    return productRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return productRepository.delete(id);
  }

  async getStats(): Promise<ProductStats> {
    const products = await this.getAll();
    const active = products.filter((p) => p.active);
    const inactive = products.filter((p) => !p.active);
    const totalValue = active.reduce((acc, p) => acc + p.unitValue * (p.currentStock ?? 0), 0);
    const categories = new Set(products.map((p) => p.category));

    return {
      total: products.length,
      active: active.length,
      inactive: inactive.length,
      totalValue,
      categoriesCount: categories.size,
    };
  }

  getByCategory(products: Product[], category: ProductCategory): Product[] {
    return products.filter((p) => p.category === category && p.active);
  }

  searchByName(products: Product[], query: string): Product[] {
    const lower = query.toLowerCase();
    return products.filter(
      (p) =>
        p.active &&
        (p.name.toLowerCase().includes(lower) ||
          p.code.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower))
    );
  }
}

export const productService = new ProductService();
