import { UserDataEntity } from '../Entity/userDataEntity';
import { UserEntity } from '../Entity/userEntity';
import QueryDB from '../Providers/DatabaseProvider';
export class UserModel {
  async createUser(user: UserEntity): Promise<UserEntity> {
    const { name, email, password } = user;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const values = [name, email, password];
    try {
      let result = await QueryDB(query, values);
      const insertedId = (result as any).insertId as number;
      return { id: insertedId, ...user };
    } catch (error) {
      throw new Error('Failed to add user');
    }
  }

  async loginUser(user: UserEntity): Promise<UserEntity> {
    const { email: reqEmail } = user;
    const findEmail = 'SELECT * FROM users WHERE email = ?';
    const emailValue = [reqEmail];
    try {
      let chkEmailFromDB = await QueryDB(findEmail, emailValue);
      // console.log(chkEmailFromDB[0].email);
      const { password, email, id, name } = chkEmailFromDB[0];

      const user = { id, name, email, password };
      return user;
    } catch (error) {
      console.log(error);

      throw new Error('Failed to login user');
    }
  }

  async createPost(
    userId: number,
    userData: UserDataEntity
  ): Promise<UserDataEntity> {
    const { title, description, article } = userData;

    const query =
      'INSERT INTO user_data (user_id, title, description, article) VALUES (?, ?, ?, ?)';
    const values = [userId, title, description, article];

    try {
      let result = await QueryDB(query, values);

      const insertedId = (result as any).insertId as number | undefined;
      if (insertedId === undefined) {
        throw new Error('Failed to get the inserted ID');
      }

      return { id: insertedId, ...userData };
    } catch (error) {
      throw new Error('Failed to add user data');
    }
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const query = 'DELETE FROM user_data WHERE id = ? AND user_id = ?';
    const values = [postId, userId];

    try {
      const deletePost = await QueryDB(query, values);
      // logger.info('deleteuser', deleteUser);
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }

  async getPost(
    userId: number,
    postId: number
  ): Promise<UserDataEntity | null> {
    const query = 'SELECT * FROM user_data WHERE id = ? AND user_id = ?';
    const values = [postId, userId];

    try {
      let rows = await QueryDB(query, values);
      // console.log(rows[0]);

      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      } //solve error
      const post = rows[0] as UserDataEntity; //row[0] contains data title etc
      return post;
    } catch (error) {
      throw new Error('Failed to get post');
    }
  }

  async updatePost(
    userId: number,
    postId: number,
    userPost: UserDataEntity
  ): Promise<UserDataEntity | null> {
    const { title, description, article } = userPost;
    const query =
      'UPDATE user_data SET title = ?, description = ?, article = ? WHERE id = ? AND user_id = ?';
    const values = [title, description, article, postId, userId];

    try {
      // Check if the post belongs to the specified user before performing the update
      const postBelongsToUser = await this.checkPostOwnership(userId, postId);
      if (!postBelongsToUser) {
        throw new Error(
          'Cannot update post: Post does not belong to the specified user'
        );
      }

      await QueryDB(query, values);
      return { id: postId, ...userPost };
    } catch (error) {
      throw new Error('Failed to update post');
    }
  }

  async checkPostOwnership(userId: number, postId: number): Promise<boolean> {
    const query =
      'SELECT COUNT(*) AS count FROM user_data WHERE id = ? AND user_id = ?';
    const values = [postId, userId];

    try {
      const result = await QueryDB(query, values);
      const postCount = (result as any)[0].count as number;
      return postCount === 1;
    } catch (error) {
      throw new Error('Failed to check post ownership');
    }
  }
}
