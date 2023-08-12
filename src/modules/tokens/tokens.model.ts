import { Column, DataType, ForeignKey, Table, Model, BelongsTo } from "sequelize-typescript";
import UserEntity from "../users/user.model";

@Table({
    tableName: "tokens"
})
class TokenEntity extends Model<TokenEntity> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => UserEntity)
    @Column({type: DataType.INTEGER})
    userId: number;

    @BelongsTo(() => UserEntity)
    user: UserEntity; 

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    refreshToken: string

    @Column({ type: DataType.DATE, allowNull: false })
    expiresAt: Date;
}

export default TokenEntity; 