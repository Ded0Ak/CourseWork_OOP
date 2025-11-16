import { Dormitory } from "../Entities/Dormitory";
import { DormitoryRoom } from "../Entities/DormitoryRoom";
import { Student } from "../Entities/Student";
import { IRepository } from "../../DAL/IRepository";
import {
  ValidationException,
  EntityNotFoundException,
  CapacityExceededException,
  DuplicateEntityException,
} from "../../Common/Exceptions";
import { v4 as uuidv4 } from "uuid";

export class DormitoryService {
  constructor(
    private dormitoryRepository: IRepository<Dormitory>,
    private roomRepository: IRepository<DormitoryRoom>,
    private studentRepository: IRepository<Student>
  ) {}

  async createDormitory(name: string, address: string): Promise<Dormitory> {
    this.validateDormitoryData(name, address);

    const dormitory = new Dormitory(uuidv4(), name, address);

    await this.dormitoryRepository.add(dormitory);
    await this.dormitoryRepository.saveChanges();

    return dormitory;
  }

  async updateDormitory(
    id: string,
    name: string,
    address: string
  ): Promise<Dormitory> {
    const dormitory = await this.dormitoryRepository.getById(id);
    if (!dormitory) {
      throw new EntityNotFoundException("Dormitory", id);
    }

    this.validateDormitoryData(name, address);

    dormitory.name = name;
    dormitory.address = address;

    await this.dormitoryRepository.update(dormitory);
    await this.dormitoryRepository.saveChanges();

    return dormitory;
  }

  async createRoom(
    dormitoryId: string,
    roomNumber: string,
    floor: number,
    maxCapacity: number
  ): Promise<DormitoryRoom> {
    const dormitory = await this.dormitoryRepository.getById(dormitoryId);
    if (!dormitory) {
      throw new EntityNotFoundException("Dormitory", dormitoryId);
    }

    this.validateRoomData(roomNumber, floor, maxCapacity);

    const existingRooms = await this.roomRepository.getAll();
    const duplicate = existingRooms.find(
      (r) => r.roomNumber === roomNumber && dormitory.roomIds.includes(r.id)
    );
    if (duplicate) {
      throw new DuplicateEntityException("Room", roomNumber);
    }

    const room = new DormitoryRoom(uuidv4(), roomNumber, floor, maxCapacity);

    dormitory.addRoom(room.id);

    await this.roomRepository.add(room);
    await this.dormitoryRepository.update(dormitory);

    await this.roomRepository.saveChanges();
    await this.dormitoryRepository.saveChanges();

    return room;
  }

  async updateRoom(
    id: string,
    roomNumber: string,
    floor: number,
    maxCapacity: number
  ): Promise<DormitoryRoom> {
    const room = await this.roomRepository.getById(id);
    if (!room) {
      throw new EntityNotFoundException("Room", id);
    }

    this.validateRoomData(roomNumber, floor, maxCapacity);

    if (maxCapacity < room.getResidentCount()) {
      throw new ValidationException(
        `Cannot reduce capacity below current resident count (${room.getResidentCount()})`
      );
    }

    room.roomNumber = roomNumber;
    room.floor = floor;
    room.maxCapacity = maxCapacity;

    await this.roomRepository.update(room);
    await this.roomRepository.saveChanges();

    return room;
  }

  async checkInStudent(studentId: string, roomId: string): Promise<void> {
    const student = await this.studentRepository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException("Student", studentId);
    }

    const room = await this.roomRepository.getById(roomId);
    if (!room) {
      throw new EntityNotFoundException("Room", roomId);
    }

    if (student.isInDormitory()) {
      throw new ValidationException("Student is already living in a dormitory");
    }

    if (room.isFull()) {
      throw new CapacityExceededException(
        "Room",
        room.getResidentCount(),
        room.maxCapacity
      );
    }

    room.addResident(studentId);
    student.dormitoryRoomId = roomId;

    await this.roomRepository.update(room);
    await this.studentRepository.update(student);

    await this.roomRepository.saveChanges();
    await this.studentRepository.saveChanges();
  }

  async checkOutStudent(studentId: string): Promise<void> {
    const student = await this.studentRepository.getById(studentId);
    if (!student) {
      throw new EntityNotFoundException("Student", studentId);
    }

    if (!student.isInDormitory()) {
      throw new ValidationException("Student is not living in a dormitory");
    }

    const room = await this.roomRepository.getById(student.dormitoryRoomId!);
    if (!room) {
      throw new EntityNotFoundException("Room", student.dormitoryRoomId!);
    }

    room.removeResident(studentId);
    student.dormitoryRoomId = null;

    await this.roomRepository.update(room);
    await this.studentRepository.update(student);

    await this.roomRepository.saveChanges();
    await this.studentRepository.saveChanges();
  }

  async getAllDormitories(): Promise<Dormitory[]> {
    return await this.dormitoryRepository.getAll();
  }
  
  async getDormitoryById(id: string): Promise<Dormitory> {
    const dormitory = await this.dormitoryRepository.getById(id);
    if (!dormitory) {
      throw new EntityNotFoundException("Dormitory", id);
    }
    return dormitory;
  }

  async getDormitoryRooms(dormitoryId: string): Promise<DormitoryRoom[]> {
    const dormitory = await this.dormitoryRepository.getById(dormitoryId);
    if (!dormitory) {
      throw new EntityNotFoundException("Dormitory", dormitoryId);
    }

    const allRooms = await this.roomRepository.getAll();
    return allRooms.filter((r) => dormitory.roomIds.includes(r.id));
  }

  async getRoomById(id: string): Promise<DormitoryRoom> {
    const room = await this.roomRepository.getById(id);
    if (!room) {
      throw new EntityNotFoundException("Room", id);
    }
    return room;
  }
  
  async getRoomResidents(roomId: string): Promise<Student[]> {
    const room = await this.roomRepository.getById(roomId);
    if (!room) {
      throw new EntityNotFoundException("Room", roomId);
    }

    const allStudents = await this.studentRepository.getAll();
    return allStudents.filter((s) => s.dormitoryRoomId === roomId);
  }

  async getAllResidents(dormitoryId: string): Promise<Student[]> {
    const dormitory = await this.dormitoryRepository.getById(dormitoryId);
    if (!dormitory) {
      throw new EntityNotFoundException("Dormitory", dormitoryId);
    }

    const allStudents = await this.studentRepository.getAll();
    const rooms = await this.getDormitoryRooms(dormitoryId);
    const roomIds = rooms.map((r) => r.id);

    return allStudents.filter(
      (s) => s.dormitoryRoomId && roomIds.includes(s.dormitoryRoomId)
    );
  }

  async getAvailableSpaces(dormitoryId: string): Promise<{
    totalCapacity: number;
    occupied: number;
    available: number;
    rooms: Array<{ roomNumber: string; available: number; capacity: number }>;
  }> {
    const rooms = await this.getDormitoryRooms(dormitoryId);

    let totalCapacity = 0;
    let occupied = 0;
    const roomInfo = [];

    for (const room of rooms) {
      totalCapacity += room.maxCapacity;
      occupied += room.getResidentCount();
      roomInfo.push({
        roomNumber: room.roomNumber,
        available: room.getAvailableSpaces(),
        capacity: room.maxCapacity,
      });
    }

    return {
      totalCapacity,
      occupied,
      available: totalCapacity - occupied,
      rooms: roomInfo,
    };
  }

  private validateDormitoryData(name: string, address: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException("Dormitory name cannot be empty");
    }
    if (!address || address.trim().length === 0) {
      throw new ValidationException("Address cannot be empty");
    }
  }

  private validateRoomData(
    roomNumber: string,
    floor: number,
    maxCapacity: number
  ): void {
    if (!roomNumber || roomNumber.trim().length === 0) {
      throw new ValidationException("Room number cannot be empty");
    }
    if (floor < 1) {
      throw new ValidationException("Floor must be at least 1");
    }
    if (maxCapacity < 1) {
      throw new ValidationException("Max capacity must be at least 1");
    }
  }
}
