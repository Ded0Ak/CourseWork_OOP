import { IEntity } from '../../Common/IEntity';

export class Student implements IEntity {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: Date;
  groupId: string | null;
  dormitoryRoomId: string | null;
  email: string;
  phone: string;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    middleName: string,
    dateOfBirth: Date,
    email: string,
    phone: string,
    groupId: string | null = null,
    dormitoryRoomId: string | null = null
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.dateOfBirth = dateOfBirth;
    this.groupId = groupId;
    this.dormitoryRoomId = dormitoryRoomId;
    this.email = email;
    this.phone = phone;
  }

  getFullName(): string {
    return `${this.lastName} ${this.firstName} ${this.middleName}`;
  }

  isInDormitory(): boolean {
    return this.dormitoryRoomId !== null;
  }

  isInGroup(): boolean {
    return this.groupId !== null;
  }

  static fromJSON(data: any): Student {
    return new Student(
      data.id,
      data.firstName,
      data.lastName,
      data.middleName,
      new Date(data.dateOfBirth),
      data.email,
      data.phone,
      data.groupId,
      data.dormitoryRoomId
    );
  }
}