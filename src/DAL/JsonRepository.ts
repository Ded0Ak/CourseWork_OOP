import * as fs from 'fs/promises';
import * as path from 'path';
import { IEntity } from '../Common/IEntity';
import { IRepository } from './IRepository';
import { DataAccessException } from '../Common/Exceptions';

/**
 * Репозиторій для роботи з JSON файлами
 */
export class JsonRepository<T extends IEntity> implements IRepository<T> {
  private data: T[] = [];
  private readonly filePath: string;

  constructor(fileName: string) {
    const dataDir = path.join(process.cwd(), 'data');
    this.filePath = path.join(dataDir, fileName);
    this.ensureDataDirectory();
  }

  /**
   * Переконується що директорія для даних існує
   */
  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      throw new DataAccessException(`Failed to create data directory: ${error}`);
    }
  }

  /**
   * Завантажує дані з файлу
   */
  private async loadData(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Файл не існує, ініціалізуємо порожнім масивом
        this.data = [];
      } else {
        throw new DataAccessException(`Failed to load data from file: ${error.message}`);
      }
    }
  }

  /**
   * Зберігає дані у файл
   */
  async saveChanges(): Promise<void> {
    try {
      const jsonData = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.filePath, jsonData, 'utf-8');
    } catch (error: any) {
      throw new DataAccessException(`Failed to save data to file: ${error.message}`);
    }
  }

  async getAll(): Promise<T[]> {
    await this.loadData();
    return [...this.data];
  }

  async getById(id: string): Promise<T | null> {
    await this.loadData();
    return this.data.find(item => item.id === id) || null;
  }

  async add(entity: T): Promise<void> {
    await this.loadData();
    this.data.push(entity);
  }

  async update(entity: T): Promise<void> {
    await this.loadData();
    const index = this.data.findIndex(item => item.id === entity.id);
    if (index !== -1) {
      this.data[index] = entity;
    } else {
      throw new DataAccessException(`Entity with id ${entity.id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    await this.loadData();
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    } else {
      throw new DataAccessException(`Entity with id ${id} not found`);
    }
  }
}