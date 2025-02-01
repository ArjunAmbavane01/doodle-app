import 'dotenv/config'
import express,{Application, Request,Response} from "express";
import cors from "cors";
import Routes from './routes/index'

const PORT = process.env.PORT || 8001;

const app:Application = express();

app.use(cors());
app.use(express.json());

app.use('/api', Routes);

app.get('/', ()=> console.log('Hello World!'))

app.listen(PORT,()=> console.log(`Listening on port ${PORT}`) )