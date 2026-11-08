import { createServerFn } from "@tanstack/react-start";
import { goldQuestionSchema } from "./gold-question";
import { answerGoldQuestion } from "./gold-question.server";

export const askGoldQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => goldQuestionSchema.parse(input))
  .handler(async ({ data }) => answerGoldQuestion(data));