import { IEntity } from '../../Common/IEntity';

export class Group implements IEntity {
  id: string;
  name: string;
  specialization: string;
  year: number;
  studentIds: string[];

  constructor(
    id: string,
    name: string,
    specialization: string,
    year: number,
    studentIds: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.specialization = specialization;
    this.year = year;
    this.studentIds = studentIds;
  }

  addStudent(studentId: string): void {
    if (!this.studentIds.includes(studentId)) {
      this.studentIds.push(studentId);
    }
  }

  removeStudent(studentId: string): boolean {
    const index = this.studentIds.indexOf(studentId);
    if (index !== -1) {
      this.studentIds.splice(index, 1);
      return true;
    }
    return false;
  }

  getStudentCount(): number {
    return this.studentIds.length;
  }

  hasStudent(studentId: string): boolean {
    return this.studentIds.includes(studentId);
  }

  static fromJSON(data: any): Group {
    return new Group(
      data.id,
      data.name,
      data.specialization,
      data.year,
      data.studentIds || []
    );
  }
}