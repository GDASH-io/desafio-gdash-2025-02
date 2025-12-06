import { model, models, Schema } from "mongoose"

export interface IInsight {
  _id?: string
  time: Date
  insight: string
}

const InsightSchema = new Schema<IInsight>({
  time: {type: Date, required: true},
  insight: {type: String, required: true}
})

const Insight = models.Insight || model("Insight", InsightSchema)

export async function insertInsight(data: IInsight): Promise<IInsight> {
  try {
    const newRecord = await Insight.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`Insert insight error: ${error}`);
  }
}

export async function findInsightsByTime(time: Date): Promise<IInsight[]> {
  try {
    const record = await Insight.find({time: time});
    return record;
  } catch (error) {
    throw new Error(`find session error: ${error}`);
  }
}

export async function deleteInsightsByTime(time: Date) {
  try {
    const record = await Insight.deleteMany({time: time});
    return record;
  } catch (error) {
    throw new Error(`find session error: ${error}`);
  }
}