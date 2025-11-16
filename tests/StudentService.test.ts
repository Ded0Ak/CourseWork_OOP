import { StudentService } from '../src/BLL/Services/StudentService';
import { Student } from '../src/BLL/Entities/Student';
import { IRepository } from '../src/DAL/IRepository';
import { ValidationException, EntityNotFoundException, DuplicateEntityException } from '../src/Common/Exceptions';

jest.mock('uuid');

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

  async saveChanges(): Promise<void> {
  }

  clear(): void {
    this.students = [];
  }
}

describe('StudentService', () => {
  let service: StudentService;
  let repository: MockStudentRepository;

  beforeEach(() => {
    repository = new MockStudentRepository();
    service = new StudentService(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('createStudent', () => {
    it('should create a student with valid data', async () => {
      const firstName = 'Іван';
      const lastName = 'Петренко';
      const middleName = 'Олександрович';
      const dateOfBirth = new Date('2000-01-01');
      const email = 'ivan@example.com';
      const phone = '+380501234567';

      const student = await service.createStudent(
        firstName,
        lastName,
        middleName,
        dateOfBirth,
        email,
        phone
      );

      expect(student).toBeDefined();
      expect(student.firstName).toBe(firstName);
      expect(student.lastName).toBe(lastName);
      expect(student.email).toBe(email);
    });

    it('should throw ValidationException when firstName is empty', async () => {
      const firstName = '';
      const lastName = 'Петренко';
      const middleName = 'Олександрович';
      const dateOfBirth = new Date('2000-01-01');
      const email = 'ivan@example.com';
      const phone = '+380501234567';

      await expect(
        service.createStudent(firstName, lastName, middleName, dateOfBirth, email, phone)
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when email is invalid', async () => {
      const firstName = 'Іван';
      const lastName = 'Петренко';
      const middleName = 'Олександрович';
      const dateOfBirth = new Date('2000-01-01');
      const email = 'invalid-email';
      const phone = '+380501234567';

      await expect(
        service.createStudent(firstName, lastName, middleName, dateOfBirth, email, phone)
      ).rejects.toThrow(ValidationException);
    });

    it('should throw DuplicateEntityException when email already exists', async () => {
      const firstName = 'Іван';
      const lastName = 'Петренко';
      const middleName = 'Олександрович';
      const dateOfBirth = new Date('2000-01-01');
      const email = 'ivan@example.com';
      const phone = '+380501234567';

      await service.createStudent(firstName, lastName, middleName, dateOfBirth, email, phone);

      await expect(
        service.createStudent('Петро', 'Сидоренко', 'Іванович', dateOfBirth, email, '+380509876543')
      ).rejects.toThrow(DuplicateEntityException);
    });
  });

  describe('updateStudent', () => {
    it('should update student data', async () => {
      const student = await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      const newFirstName = 'Петро';

      const updated = await service.updateStudent(
        student.id,
        newFirstName,
        student.lastName,
        student.middleName,
        student.dateOfBirth,
        student.email,
        student.phone
      );

      expect(updated.firstName).toBe(newFirstName);
    });

    it('should throw EntityNotFoundException when student does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(
        service.updateStudent(
          nonExistentId,
          'Іван',
          'Петренко',
          'Олександрович',
          new Date('2000-01-01'),
          'ivan@example.com',
          '+380501234567'
        )
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('deleteStudent', () => {
    it('should delete student', async () => {
      const student = await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      await service.deleteStudent(student.id);
      const allStudents = await service.getAllStudents();

      expect(allStudents).toHaveLength(0);
    });

    it('should throw EntityNotFoundException when student does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(service.deleteStudent(nonExistentId)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getStudentById', () => {
    it('should return student by id', async () => {
      const student = await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      const found = await service.getStudentById(student.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(student.id);
    });

    it('should throw EntityNotFoundException when student does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(service.getStudentById(nonExistentId)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getAllStudents', () => {
    it('should return all students', async () => {
      await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      await service.createStudent(
        'Петро',
        'Сидоренко',
        'Іванович',
        new Date('2001-01-01'),
        'petro@example.com',
        '+380509876543'
      );

      const allStudents = await service.getAllStudents();

      expect(allStudents).toHaveLength(2);
    });

    it('should return empty array when no students', async () => {
      const allStudents = await service.getAllStudents();

      expect(allStudents).toHaveLength(0);
    });
  });

  describe('searchStudents', () => {
    beforeEach(async () => {
      await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      await service.createStudent(
        'Петро',
        'Іваненко',
        'Сергійович',
        new Date('2001-01-01'),
        'petro@example.com',
        '+380509876543'
      );
    });

    it('should find students by first name', async () => {
      const results = await service.searchStudents('Іван');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should find students by last name', async () => {
      const results = await service.searchStudents('Петренко');

      expect(results).toHaveLength(1);
      expect(results[0].lastName).toBe('Петренко');
    });

    it('should return empty array when no matches', async () => {
      const results = await service.searchStudents('Неіснуючий');

      expect(results).toHaveLength(0);
    });
  });

  describe('assignToGroup', () => {
    it('should assign student to group', async () => {
      const student = await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      const groupId = 'test-group-id';

      await service.assignToGroup(student.id, groupId);
      const updated = await service.getStudentById(student.id);

      expect(updated.groupId).toBe(groupId);
    });
  });

  describe('removeFromGroup', () => {
    it('should remove student from group', async () => {
      const student = await service.createStudent(
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );

      await service.assignToGroup(student.id, 'test-group-id');

      await service.removeFromGroup(student.id);
      const updated = await service.getStudentById(student.id);

      expect(updated.groupId).toBeNull();
    });
  });
});