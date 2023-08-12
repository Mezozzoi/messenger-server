import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import MessageEntity from "../messages/message.model";
import * as mimejs from "mime";

export enum AttachmentTypes {
    VIDEO = "VIDEO",
    IMAGE = "IMAGE",
    AUDIO = "AUDIO",
    FILE = "FILE"
}

export type AttachmentCreateType = {
    key: string,
    filename: string,
    type: AttachmentTypes,
    messageId: number,
    size: number
}

@Table({
    tableName: "attachments",
    timestamps: true
})
class AttachmentEntity extends Model<AttachmentEntity, AttachmentCreateType> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({type: DataType.STRING, allowNull: false})
    key: string;

    @Column({ type: DataType.STRING, allowNull: false })
    filename: string;

    @Column({ type: DataType.ENUM(...Object.values(AttachmentTypes)) })
    type: AttachmentTypes;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    size: number;

    @ForeignKey(() => MessageEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    messageId: number;

    @BelongsTo(() => MessageEntity)
    message: MessageEntity;

    get mime(): string {
        const mime = mimejs.getType(this.filename);
        return mime ? mime : "application/octet-stream";
    }
}

export default AttachmentEntity;