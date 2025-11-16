import { Student } from '../Entities/Student';
import { IRepository } from '../../DAL/IRepository';
import { ValidationException, EntityNotFoundException, DuplicateEntityException } from '../../Common/Exceptions';
import { v4 as uuidv4 } from 'uuid';

export class StudentService {
  constructor(private repository: IRepository<Student>) {}

  async createStudent(
    firstName: string,
    lastName: string,
    middleName: string,
    dateOfBirth: Date,
    email: string,
    phone: string
  ): Promise<Student> {
    this.validateStudentData(firstName, lastName, middleName, email, phone);

    const existingStudents = await this.repository.getAll();
    const duplicate = existingStudents.find(s => s.email === email);
    if (duplicate) {
      throw new DuplicateEntityException('Student', email);
    }

    const student = new Student(
      uuidv4(),
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      email,
      phone
    );

    await this.repository.add(student);
    await this.repository.saveChanges();

    return student;
  }

  async updateStudent(
    id: string,
    firstName: string,
    lastName: string,
    middleName: string,
    dateOfBirth: Date,
    email: string,
    phone: string
  ): Promise<Student> {
    const student = await this.repository.getById(id);
    if (!student) {
      throw new EntityNotFoundException('Student', id);
    }

    this.validateStudentData(firstName, lastName, middleName, email, phone);

    const existingStudents = await this.repository.getAll();
    const duplicate = existingStudents.find(s => s.email === email && s.id !== id);
    if (duplicate) {
      throw new DuplicateEntityException('Student', email);
    }

    student.firstName = firstName;
    student.lastName = lastName;
    student.middleName = middleName;
    student.dateOfBirth = dateOfBirth;
    student.email = email;
    student.phone = phone;

    await this.repository.update(student);
    await this.repository.saveChanges();

    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    const student = await this.repository.getById(id);
    if (!student) {
      throw new EntityNotFoundException('Student', id);
    }

    await this.repository.delete(id);
    await this.repository.saveChanges();
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await this.repository.getById(id);
    if (!student) {
      throw new EntityNotFoundException('Student', id);
    }
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return await this.repository.getAll();
  }

  async searchStudents(query: string): Promise<Student[]> {
    const allStudents = await this.repository.getAll();
    const lowerQuery = query.toLowerCase();
    
    return allStudents.filter(student =>
      student.firstName.toLowerCase().includes(lowerQuery) ||
      student.lastName.toLowerCase().includes(lowerQuery) ||
      student.middleName.toLowerCase().includes(lowerQuery)
    );
  }

  async assignToGroup(studentId: string, groupId: string): Promise<void> {
    const student = await this.repository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException('Student', studentId);
    }

    student.groupId = groupId;
    await this.repository.update(student);
    await this.repository.saveChanges();
  }

  async removeFromGroup(studentId: string): Promise<void> {
    const student = await this.repository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException('Student', studentId);
    }

    student.groupId = null;
    await this.repository.update(student);
    await this.repository.saveChanges();
  }

  private validateStudentData(
    firstName: string,
    lastName: string,
    middleName: string,
    email: string,
    phone: string
  ): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new ValidationException('First name cannot be empty');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationException('Last name cannot be empty');
    }
    if (!middleName || middleName.trim().length === 0) {
      throw new ValidationException('Middle name cannot be empty');
    }
    if (!email || !this.isValidEmail(email)) {
      throw new ValidationException('Invalid email format');
    }
    if (!phone || !this.isValidPhone(phone)) {
      throw new ValidationException('Invalid phone format');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  }
}