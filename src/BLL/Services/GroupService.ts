import { Group } from '../Entities/Group';
import { Student } from '../Entities/Student';
import { IRepository } from '../../DAL/IRepository';
import { ValidationException, EntityNotFoundException, DuplicateEntityException } from '../../Common/Exceptions';
import { v4 as uuidv4 } from 'uuid';

export class GroupService {
  constructor(
    private groupRepository: IRepository<Group>,
    private studentRepository: IRepository<Student>
  ) {}

  async createGroup(
    name: string,
    specialization: string,
    year: number
  ): Promise<Group> {
    this.validateGroupData(name, specialization, year);

    const existingGroups = await this.groupRepository.getAll();
    const duplicate = existingGroups.find(g => g.name === name);
    if (duplicate) {
      throw new DuplicateEntityException('Group', name);
    }

    const group = new Group(
      uuidv4(),
      name,
      specialization,
      year
    );

    await this.groupRepository.add(group);
    await this.groupRepository.saveChanges();

    return group;
  }

  async updateGroup(
    id: string,
    name: string,
    specialization: string,
    year: number
  ): Promise<Group> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new EntityNotFoundException('Group', id);
    }

    this.validateGroupData(name, specialization, year);

    const existingGroups = await this.groupRepository.getAll();
    const duplicate = existingGroups.find(g => g.name === name && g.id !== id);
    if (duplicate) {
      throw new DuplicateEntityException('Group', name);
    }

    group.name = name;
    group.specialization = specialization;
    group.year = year;

    await this.groupRepository.update(group);
    await this.groupRepository.saveChanges();

    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new EntityNotFoundException('Group', id);
    }

    const students = await this.studentRepository.getAll();
    for (const student of students) {
      if (student.groupId === id) {
        student.groupId = null;
        await this.studentRepository.update(student);
      }
    }
    await this.studentRepository.saveChanges();

    await this.groupRepository.delete(id);
    await this.groupRepository.saveChanges();
  }

  async getGroupById(id: string): Promise<Group> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new EntityNotFoundException('Group', id);
    }
    return group;
  }

  async getAllGroups(): Promise<Group[]> {
    return await this.groupRepository.getAll();
  }

  async addStudentToGroup(groupId: string, studentId: string): Promise<void> {
    const group = await this.groupRepository.getById(groupId);
    if (!group) {
      throw new EntityNotFoundException('Group', groupId);
    }

    const student = await this.studentRepository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException('Student', studentId);
    }

    if (student.groupId) {
      const oldGroup = await this.groupRepository.getById(student.groupId);
      if (oldGroup) {
        oldGroup.removeStudent(studentId);
        await this.groupRepository.update(oldGroup);
      }
    }

    group.addStudent(studentId);
    student.groupId = groupId;

    await this.groupRepository.update(group);
    await this.studentRepository.update(student);
    
    await this.groupRepository.saveChanges();
    await this.studentRepository.saveChanges();
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
    const group = await this.groupRepository.getById(groupId);
    if (!group) {
      throw new EntityNotFoundException('Group', groupId);
    }

    const student = await this.studentRepository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException('Student', studentId);
    }

    group.removeStudent(studentId);
    student.groupId = null;

    await this.groupRepository.update(group);
    await this.studentRepository.update(student);
    
    await this.groupRepository.saveChanges();
    await this.studentRepository.saveChanges();
  }

  async getGroupStudents(groupId: string): Promise<Student[]> {
    const group = await this.groupRepository.getById(groupId);
    if (!group) {
      throw new EntityNotFoundException('Group', groupId);
    }

    const allStudents = await this.studentRepository.getAll();
    return allStudents.filter(s => s.groupId === groupId);
  }

  private validateGroupData(name: string, specialization: string, year: number): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Group name cannot be empty');
    }
    if (!specialization || specialization.trim().length === 0) {
      throw new ValidationException('Specialization cannot be empty');
    }
    if (year < 1 || year > 6) {
      throw new ValidationException('Year must be between 1 and 6');
    }
  }
}