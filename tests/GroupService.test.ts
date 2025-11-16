import { GroupService } from '../src/BLL/Services/GroupService';
import { Group } from '../src/BLL/Entities/Group';
import { Student } from '../src/BLL/Entities/Student';
import { IRepository } from '../src/DAL/IRepository';
import { ValidationException, EntityNotFoundException } from '../src/Common/Exceptions';

jest.mock('uuid');

class MockGroupRepository implements IRepository<Group> {
  private groups: Group[] = [];

  async getAll(): Promise<Group[]> {
    return [...this.groups];
  }

  async getById(id: string): Promise<Group | null> {
    return this.groups.find(g => g.id === id) || null;
  }

  async add(entity: Group): Promise<void> {
    this.groups.push(entity);
  }

  async update(entity: Group): Promise<void> {
    const index = this.groups.findIndex(g => g.id === entity.id);
    if (index !== -1) {
      this.groups[index] = entity;
    }
  }

  async delete(id: string): Promise<void> {
    this.groups = this.groups.filter(g => g.id !== id);
  }

  async saveChanges(): Promise<void> {}

  clear(): void {
    this.groups = [];
  }
}

class MockStudentRepository implements IRepository<Student> {
  private students: Student[] = [];

  async getAll(): Promise<Student[]> {
    return [...this.students];
  }

  async getById(id: string): Promise<Student | null> {
    return this.students.find(s => s.id === id) || null;
  }

  async add(entity: Student): Promise<void> {
    this.students.push(entity);
  }

  async update(entity: Student): Promise<void> {
    const index = this.students.findIndex(s => s.id === entity.id);
    if (index !== -1) {
      this.students[index] = entity;
    }
  }

  async delete(id: string): Promise<void> {
    this.students = this.students.filter(s => s.id !== id);
  }

  async saveChanges(): Promise<void> {}

  clear(): void {
    this.students = [];
  }
}

describe('GroupService', () => {
  let service: GroupService;
  let groupRepository: MockGroupRepository;
  let studentRepository: MockStudentRepository;

  beforeEach(() => {
    groupRepository = new MockGroupRepository();
    studentRepository = new MockStudentRepository();
    service = new GroupService(groupRepository, studentRepository);
  });

  afterEach(() => {
    groupRepository.clear();
    studentRepository.clear();
  });

  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const name = 'КН-301';
      const specialization = 'Комп\'ютерні науки';
      const year = 3;

      const group = await service.createGroup(name, specialization, year);

      expect(group).toBeDefined();
      expect(group.name).toBe(name);
      expect(group.specialization).toBe(specialization);
      expect(group.year).toBe(year);
    });

    it('should throw ValidationException when year is invalid', async () => {
      const name = 'КН-301';
      const specialization = 'Комп\'ютерні науки';
      const year = 7;

      await expect(service.createGroup(name, specialization, year)).rejects.toThrow(ValidationException);
    });
  });

  describe('addStudentToGroup', () => {
    it('should add student to group', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      const student = new Student(
        'student-1',
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );
      await studentRepository.add(student);

      await service.addStudentToGroup(group.id, student.id);
      const updatedGroup = await service.getGroupById(group.id);

      expect(updatedGroup.hasStudent(student.id)).toBe(true);
    });
  });
});