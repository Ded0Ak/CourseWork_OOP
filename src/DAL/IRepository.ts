import { IEntity } from '../Common/IEntity';

export interface IRepository<T extends IEntity> {
  getAll(): Promise<T[]>;

  getById(id: string): Promise<T | null>;

  add(entity: T): Promise<void>;

  update(entity: T): Promise<void>;

  delete(id: string): Promise<void>;

  saveChanges(): Promise<void>;
}