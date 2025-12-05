import { Module } from "@nestjs/common";
import { IaService } from "./ia.service";
import { GroqModule } from "@bytebitlabs/nest-groq";

@Module({
  imports: [
    GroqModule.registerAsync({
      useFactory: () => ({
        createGroqOptions() {
          return {
            apiKey: process.env.GROQ_API_KEY
          }
        },
      })
    }),
  ],
  providers: [IaService],
  exports: [IaService]
})
export class IaModule { }