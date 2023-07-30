import { log } from 'console';
import { UserDataEntity } from '../Entity/userDataEntity';
import { UserEntity } from '../Entity/userEntity';
import { UserModel } from '../Model/userModel';

export class UserService {
  private userModel: UserModel;
  constructor() {
    this.userModel = new UserModel();
  }
  async createUser(user: UserEntity): Promise<UserEntity> {
    const createdUser = await this.userModel.createUser(user);

    return createdUser;
  }

  async loginUser(user: UserEntity): Promise<UserEntity> {
    const loggedInUser = await this.userModel.loginUser(user);

    return loggedInUser;
  }

  async createPost(
    userId: number,
    userData: UserDataEntity
  ): Promise<UserDataEntity> {
    const createdPost = await this.userModel.createPost(userId, userData);
    return createdPost;
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    console.log('delete');
    await this.userModel.deletePost(userId, postId);
  }

  async getPost(
    userId: number,
    postId: number
  ): Promise<UserDataEntity | null> {
    const post = await this.userModel.getPost(userId, postId);
    return post;
  }

  async updatePost(
    userId: number,
    postId: number,
    userPost: UserDataEntity
  ): Promise<UserDataEntity | null> {
    const updatedPost = await this.userModel.updatePost(
      userId,
      postId,
      userPost
    );
    return updatedPost;
  }
}
