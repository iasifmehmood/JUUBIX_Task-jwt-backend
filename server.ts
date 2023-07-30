require('dotenv').config();
import express, { Application, Request, Response, urlencoded } from 'express';
import cors from 'cors';
import userRoute from './Route/userRoute';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('api running');
});

//swagger API Testing
const swaggerJsDocs = YAML.load('./Swagger/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDocs));

app.use('/users', userRoute);

app.listen(process.env.Port, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
