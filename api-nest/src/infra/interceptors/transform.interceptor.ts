import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return data;
        }

        // Se for um array, transformar cada item
        if (Array.isArray(data)) {
          return data.map((item) => this.transformItem(item));
        }

        // Se for um objeto com propriedade 'data' (paginação), transformar os itens dentro
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((item: any) => this.transformItem(item)),
          };
        }

        // Transformar objeto único
        return this.transformItem(data);
      }),
    );
  }

  private transformItem(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // Se for um documento do Mongoose
    if (item.toObject) {
      item = item.toObject();
    }

    // Criar novo objeto com id em vez de _id
    const transformed: any = {};

    for (const key in item) {
      if (key === '_id') {
        transformed.id = item._id?.toString() || item._id;
      } else if (key === '__v') {
        // Ignorar __v do Mongoose
        continue;
      } else if (Array.isArray(item[key])) {
        // Transformar arrays recursivamente
        transformed[key] = item[key].map((subItem: any) => this.transformItem(subItem));
      } else if (item[key] && typeof item[key] === 'object' && item[key].constructor === Object) {
        // Transformar objetos aninhados recursivamente
        transformed[key] = this.transformItem(item[key]);
      } else {
        transformed[key] = item[key];
      }
    }

    return transformed;
  }
}

