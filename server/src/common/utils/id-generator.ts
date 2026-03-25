// ========================
// ID 生成器（基于数据库序列，多实例安全）
// ========================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entity, Column, PrimaryColumn } from 'typeorm';

// 实体必须定义在 Service 之前
@Entity('id_sequences')
export class IdSequence {
  @PrimaryColumn({ name: 'seq_name', length: 30 })
  seqName: string;

  @PrimaryColumn({ name: 'seq_date', length: 8 })
  seqDate: string;

  @Column({ name: 'seq_value', type: 'int', unsigned: true })
  seqValue: number;
}

@Injectable()
export class IdGenerator {
  constructor(
    @InjectRepository(IdSequence)
    private seqRepo: Repository<IdSequence>,
  ) {}

  async nextId(prefix: string): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // 原子递增：INSERT ... ON DUPLICATE KEY UPDATE
    await this.seqRepo.query(
      `INSERT INTO id_sequences (seq_name, seq_date, seq_value)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE seq_value = seq_value + 1`,
      [prefix, date],
    );

    const row = await this.seqRepo.query(
      `SELECT seq_value FROM id_sequences WHERE seq_name = ? AND seq_date = ?`,
      [prefix, date],
    );

    const value = row[0]?.seq_value || 1;
    return `${prefix}${date}${String(value).padStart(4, '0')}`;
  }
}
