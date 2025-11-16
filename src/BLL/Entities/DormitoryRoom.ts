import { IEntity } from "../../Common/IEntity";

export class DormitoryRoom implements IEntity {
  id: string;
  roomNumber: string;
  floor: number;
  maxCapacity: number;
  residentIds: string[];

  constructor(
    id: string,
    roomNumber: string,
    floor: number,
    maxCapacity: number,
    residentIds: string[] = []
  ) {
    this.id = id;
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.maxCapacity = maxCapacity;
    this.residentIds = residentIds;
  }

  addResident(studentId: string): void {
    if (!this.residentIds.includes(studentId)) {
      this.residentIds.push(studentId);
    }
  }

  removeResident(studentId: string): boolean {
    const index = this.residentIds.indexOf(studentId);
    if (index !== -1) {
      this.residentIds.splice(index, 1);
      return true;
    }
    return false;
  }

  getAvailableSpaces(): number {
    return this.maxCapacity - this.residentIds.length;
  }

  hasAvailableSpace(): boolean {
    return this.residentIds.length < this.maxCapacity;
  }

  getResidentCount(): number {
    return this.residentIds.length;
  }

  isFull(): boolean {
    return this.residentIds.length >= this.maxCapacity;
  }
}
