import mongoose from "mongoose"

const CONNECITON_URl = process.env.CONNECITON_URl

export async function connect() {
  if(!CONNECITON_URl) {
    console.error("CONNECITON_URL IS EMPTY")
    return 
  }

  try {
    await mongoose.connect(CONNECITON_URl, {dbName: "Weather", timeoutMS: 5000})
    console.log("Conectado ao MongoDb!")
  }catch {
    console.warn("Falha ao conectar ao banco de dados! Tentando novamente")
    return connect()
  }
}