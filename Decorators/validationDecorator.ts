import { ZodError, ZodSchema, ZodTypeAny } from 'zod';
import { Request, Response } from 'express';

function createValidationDecorator<T>(schema: ZodSchema<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, req: Request, res: Response) {
      try {
        await schema.parseAsync(req.body as T);
        return originalMethod.apply(this, [req, res]);
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'Validation failed',
            details: `Error in ${error.errors[0].path} field : ${error.errors[0].message}`,
          });
        } else {
          res.status(500).json({ error: 'Failed to process request' });
        }
      }
    };

    return descriptor;
  };
}

export default createValidationDecorator;
