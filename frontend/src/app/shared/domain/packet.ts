import { v4 as uuidv4 } from 'uuid';

type PacketOptions = {
  content?: string;
};

export class Packet {
  content: string;
  readonly id: string;
  constructor(options: PacketOptions | null = null) {
    this.content = options?.content ?? '';
    this.id = uuidv4();
  }
}
