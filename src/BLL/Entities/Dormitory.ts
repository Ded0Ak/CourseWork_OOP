import { IEntity } from '../../Common/IEntity';

export class Dormitory implements IEntity {
  id: string;
  name: string;
  address: string;
  roomIds: string[];

  constructor(
    id: string,
    name: string,
    address: string,
    roomIds: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.roomIds = roomIds;
  }

  addRoom(roomId: string): void {
    if (!this.roomIds.includes(roomId)) {
      this.roomIds.push(roomId);
    }
  }

  removeRoom(roomId: string): boolean {
    const index = this.roomIds.indexOf(roomId);
    if (index !== -1) {
      this.roomIds.splice(index, 1);
      return true;
    }
    return false;
  }

  getRoomCount(): number {
    return this.roomIds.length;
  }
}