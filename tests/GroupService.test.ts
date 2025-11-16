import { GroupService } from '../src/BLL/Services/GroupService';
import { Group } from '../src/BLL/Entities/Group';
import { Student } from '../src/BLL/Entities/Student';
import { IRepository } from '../src/DAL/IRepository';
import { ValidationException, EntityNotFoundException, DuplicateEntityException } from '../src/Common/Exceptions';

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

    it('should throw DuplicateEntityException when group name already exists', async () => {
      await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.createGroup('КН-301', 'Програмна інженерія', 3)
      ).rejects.toThrow(DuplicateEntityException);
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

  describe('Group Entity Methods', () => {
    it('should return correct student count', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      expect(group.getStudentCount()).toBe(0);

      const student1 = new Student(
        'student-1',
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );
      await studentRepository.add(student1);
      await service.addStudentToGroup(group.id, student1.id);

      const updatedGroup = await service.getGroupById(group.id);
      expect(updatedGroup.getStudentCount()).toBe(1);
    });

    it('should remove student from group', async () => {
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

      let updatedGroup = await service.getGroupById(group.id);
      expect(updatedGroup.removeStudent(student.id)).toBe(true);
      expect(updatedGroup.hasStudent(student.id)).toBe(false);
    });

    it('should return false when removing non-existent student', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      expect(group.removeStudent('non-existent')).toBe(false);
    });

    it('should not add duplicate student', async () => {
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
      
      group.addStudent(student.id);
      expect(group.getStudentCount()).toBe(1);
      
      group.addStudent(student.id); 
      expect(group.getStudentCount()).toBe(1); 
    });
  });

  describe('updateGroup', () => {
    it('should update group data', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      const updatedGroup = await service.updateGroup(group.id, 'КН-302', 'Програмна інженерія', 3);

      expect(updatedGroup.name).toBe('КН-302');
      expect(updatedGroup.specialization).toBe('Програмна інженерія');
    });

    it('should throw EntityNotFoundException when group does not exist', async () => {
      await expect(
        service.updateGroup('non-existent', 'КН-301', 'Комп\'ютерні науки', 3)
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw DuplicateEntityException when updating to existing name', async () => {
      await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      const group2 = await service.createGroup('КН-302', 'Програмна інженерія', 3);

      await expect(
        service.updateGroup(group2.id, 'КН-301', 'Програмна інженерія', 3)
      ).rejects.toThrow(DuplicateEntityException);
    });

    it('should throw ValidationException when year is invalid', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.updateGroup(group.id, 'КН-301', 'Комп\'ютерні науки', 10)
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when name is empty', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.updateGroup(group.id, '', 'Комп\'ютерні науки', 3)
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when specialization is empty', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.updateGroup(group.id, 'КН-301', '', 3)
      ).rejects.toThrow(ValidationException);
    });
  });

  describe('deleteGroup', () => {
    it('should delete group and unassign students', async () => {
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

      await service.deleteGroup(group.id);

      await expect(service.getGroupById(group.id)).rejects.toThrow(EntityNotFoundException);
      
      const updatedStudent = await studentRepository.getById(student.id);
      expect(updatedStudent?.groupId).toBeNull();
    });

    it('should throw EntityNotFoundException when group does not exist', async () => {
      await expect(
        service.deleteGroup('non-existent')
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getAllGroups', () => {
    it('should return all groups', async () => {
      await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      await service.createGroup('КН-302', 'Програмна інженерія', 3);

      const groups = await service.getAllGroups();
      expect(groups).toHaveLength(2);
    });
  });

  describe('removeStudentFromGroup', () => {
    it('should remove student from group', async () => {
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

      await service.removeStudentFromGroup(group.id, student.id);

      const updatedGroup = await service.getGroupById(group.id);
      const updatedStudent = await studentRepository.getById(student.id);

      expect(updatedGroup.hasStudent(student.id)).toBe(false);
      expect(updatedStudent?.groupId).toBeNull();
    });

    it('should throw EntityNotFoundException when group does not exist', async () => {
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

      await expect(
        service.removeStudentFromGroup('non-existent', student.id)
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityNotFoundException when student does not exist', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.removeStudentFromGroup(group.id, 'non-existent')
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getGroupStudents', () => {
    it('should return students of the group', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      const student1 = new Student(
        'student-1',
        'Іван',
        'Петренко',
        'Олександрович',
        new Date('2000-01-01'),
        'ivan@example.com',
        '+380501234567'
      );
      const student2 = new Student(
        'student-2',
        'Петро',
        'Сидоренко',
        'Іванович',
        new Date('2001-01-01'),
        'petro@example.com',
        '+380509876543'
      );
      await studentRepository.add(student1);
      await studentRepository.add(student2);
      await service.addStudentToGroup(group.id, student1.id);
      await service.addStudentToGroup(group.id, student2.id);

      const students = await service.getGroupStudents(group.id);
      expect(students).toHaveLength(2);
    });

    it('should throw EntityNotFoundException when group does not exist', async () => {
      await expect(
        service.getGroupStudents('non-existent')
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('addStudentToGroup with reassignment', () => {
    it('should move student from old group to new group', async () => {
      const group1 = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);
      const group2 = await service.createGroup('КН-302', 'Програмна інженерія', 3);
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
      
      await service.addStudentToGroup(group1.id, student.id);
      await service.addStudentToGroup(group2.id, student.id);

      const updatedGroup1 = await service.getGroupById(group1.id);
      const updatedGroup2 = await service.getGroupById(group2.id);
      const updatedStudent = await studentRepository.getById(student.id);

      expect(updatedGroup1.hasStudent(student.id)).toBe(false);
      expect(updatedGroup2.hasStudent(student.id)).toBe(true);
      expect(updatedStudent?.groupId).toBe(group2.id);
    });

    it('should throw EntityNotFoundException when group does not exist', async () => {
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

      await expect(
        service.addStudentToGroup('non-existent', student.id)
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityNotFoundException when student does not exist', async () => {
      const group = await service.createGroup('КН-301', 'Комп\'ютерні науки', 3);

      await expect(
        service.addStudentToGroup(group.id, 'non-existent')
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});