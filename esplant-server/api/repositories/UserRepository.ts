import { knex } from "../config/knex.js";
import UserEntity from "../entities/UserEntity.js";

export default class UserRepository {
  static async findById(id: number): Promise<UserEntity | undefined> {
    return await knex<UserEntity>("user")
      .select("id", "googleId")
      .where({ id })
      .first();
  }

  static async findByGoogleId(
    googleId: string
  ): Promise<UserEntity | undefined> {
    return await knex<UserEntity>("user")
      .select("id", "googleId")
      .where({ googleId })
      .first();
  }

  static async create(user: Omit<UserEntity, "id">): Promise<UserEntity> {
    return (await knex<UserEntity>("user")
      .insert(user)
      .returning(["id", "googleId"])
      .then((rows) => rows[0]))!;
  }

  static async findOrCreate(
    createUser: Omit<UserEntity, "id">
  ): Promise<UserEntity> {
    let user = await UserRepository.findByGoogleId(createUser.googleId);
    if (user == undefined) {
      user = await UserRepository.create(createUser);
    }
    return user;
  }
}
