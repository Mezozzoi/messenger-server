import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import UserEntity from "../users/user.model";
import { DataTypes } from "sequelize";

type CreateFcmToken = {
    token: string,
    userId: number
}

@Table({
    tableName: "fcm_tokens",
    timestamps: true
})
class FcmTokenEntity extends Model<FcmTokenEntity, CreateFcmToken> {
    @Column({type: DataTypes.STRING, primaryKey: true})
    token: string;

    @ForeignKey(() => UserEntity)
    @Column({type: DataTypes.INTEGER})
    userId: number;

    @BelongsTo(() => UserEntity)
    user: UserEntity;
}

export default FcmTokenEntity;