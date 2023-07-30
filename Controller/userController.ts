import { Request, Response } from 'express';
import { UserService } from '../Services/userService';
import { UserDTO } from '../DTO/userDTO';
import { UserEntity } from '../Entity/userEntity';
import { hashPassword } from '../Decorators/hashPasswordDecorator';
import MailService from '../Services/mailService';
import { SendMailDTO } from '../DTO/sendMailDTO';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import AuthenticatedRequest from '../interfaces/AuthenticateRequest';
import { UserDataEntity } from '../Entity/userDataEntity';
import { UserDataDTO } from '../DTO/userDataDTO';
import createValidationDecorator from '../Decorators/validationDecorator';
import { loginSchema, signUpSchema } from '../Utils/zodValidationSchema';

const createUserValidation = createValidationDecorator(signUpSchema);
const loginUserValidation = createValidationDecorator(loginSchema);
export class UserController {
  private userService: UserService;
  private mailService: MailService; // Add an instance of the MailService class

  constructor() {
    this.userService = new UserService();
    //to solve type undefined method-1
    this.createUser = this.createUser.bind(this); // Bind the createUser method to the class instance
    //this.createUser = this.createUser.bind(this); ensures that the createUser method of the
    //UserController is bound to the class instance, allowing it to access instance properties,
    //such as userService, correctly when it is invoked from the route handler.
    this.mailService = MailService.getInstance(); // Create an instance of the MailService class
    this.loginUser = this.loginUser.bind(this);
    this.userProfile = this.userProfile.bind(this);
    this.createPost = this.createPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.getPost = this.getPost.bind(this);
    this.updatePost = this.updatePost.bind(this);
  }

  //to solve type undefined method-2 and method-3 from routes
  // createUser = async (req: Request, res: Response): Promise<void> => {

  @hashPassword
  @createUserValidation
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as UserDTO;
      const user: UserEntity = { name, email, password };

      const createdUser = await this.userService.createUser(user);

      if (createdUser) {
        const mailOptions: SendMailDTO = {
          requestId: 'User Creation',
          options: {
            from: 'hr@softoo.co',
            to: user.email,
            subject: 'Welcome to Our Website',
            text: `Dear ${user.name}, welcome to our website!`,
          },
        };

        await this.mailService.createConnection(); // Establish the email connection
        await this.mailService.sendMail(mailOptions); // Send the email
      }
      res.status(201).json(createdUser);
    } catch (error) {
      res.status(500).json({ err: 'Failed to add user', error });
    }
  }

  @loginUserValidation
  async loginUser(req: Request, res: Response): Promise<void | Response> {
    try {
      const { email, password } = req.body as UserDTO;
      const user: Omit<UserEntity, 'name' | 'id'> = { email, password };
      const validatedUser: UserEntity = user as UserEntity; // informing typescript compiler omitted name and id

      const loggedInUser = await this.userService.loginUser(validatedUser);

      const { password: passwordDB, id, name, email: emailDB } = loggedInUser;

      const passwordCheck = await bcrypt.compare(password, passwordDB);
      if (!passwordCheck) {
        return res.status(201).json({ error: 'Incorrect Password' });
      }

      const payload = {
        userId: id,
        username: name,
        email: email,
      };

      const secretKey: Secret = process.env.SECRETKEY as Secret;

      if (!secretKey) {
        throw new Error('JWT secret key not found in environment variables.');
      }

      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour

      // console.log(loggedInUser, 'services');
      res.status(201).json({ loggedUser: loggedInUser, Token: token });
    } catch (error) {
      res.status(500).json({ err: 'Failed to login user', error });
    }
  }

  async userProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Access the user ID from the request object (added by the verifyJwtMiddleware)
      const { userId, username, email } = req;

      // You can now use the userId to fetch the user's profile from the database or do any other protected operations.
      // For demonstration purposes, let's just send a response with the user ID.
      res.status(201).json({ userId, username, email });
    } catch (error) {
      res.status(500).json({ err: 'Error reading profile', error });
    }
  }

  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      // Check if userId is defined
      if (userId === undefined) {
        res.status(400).json({ error: 'User ID not provided in the request' });
        return;
      }
      const { title, description, article } = req.body as UserDataDTO;
      const userData: UserDataEntity = { title, description, article };

      const createdPost = await this.userService.createPost(userId, userData);

      res.status(201).json(createdPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add data' });
    }
  }

  async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      // Check if userId is defined
      if (userId === undefined) {
        res.status(400).json({ error: 'User ID not provided in the request' });
        return;
      }
      const postId = parseInt(req.params.id, 10);
      await this.userService.deletePost(userId, postId);

      res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete Post' });
    }
  }

  async getPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      // Check if userId is defined
      if (userId === undefined) {
        res.status(400).json({ error: 'User ID not provided in the request' });
        return;
      }
      const postId = parseInt(req.params.id, 10);
      const post = await this.userService.getPost(userId, postId);
      console.log(post, 'postttttttttttt');
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Post' });
    }
  }

  async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      // Check if userId is defined
      if (userId === undefined) {
        res.status(400).json({ error: 'User ID not provided in the request' });
        return;
      }

      const postId = parseInt(req.params.id, 10);

      const { title, description, article } = req.body as UserDataDTO;
      const userPost: UserDataEntity = { title, description, article };

      const updatedPost = await this.userService.updatePost(
        userId,
        postId,
        userPost
      );

      if (updatedPost) {
        res.json(updatedPost);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update Post' });
    }
  }
}
