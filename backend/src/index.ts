import {app} from '../src/app'
import {logger} from './config/logger'
import {env} from './config/env'

const PORT = env.port

app.listen(PORT,()=>{
    logger.info("server is running on port:"+PORT)
})