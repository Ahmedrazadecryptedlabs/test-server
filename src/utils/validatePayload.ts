import { Schema } from "joi";
import { ValidationError } from "./AppError";

const validatePayload = (schema: Schema, payload: any): void => {
  const { error } = schema.validate(payload);

  if (error?.details && error.details.length > 0) {
    throw new ValidationError(error.details[0]?.message ?? "Validation error occurred.");
  }
};

export default validatePayload;
