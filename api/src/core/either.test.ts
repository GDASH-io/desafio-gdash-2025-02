import { describe, it, expect } from "vitest";
import { left, right } from "./either";

describe("Either", () => {
  it("should create a Left value", () => {
    const result = left("error");

    expect(result.isLeft()).toBe(true);
    expect(result.isRight()).toBe(false);
    expect(result.value).toBe("error");
  });

  it("should create a Right value", () => {
    const result = right("success");

    expect(result.isLeft()).toBe(false);
    expect(result.isRight()).toBe(true);
    expect(result.value).toBe("success");
  });

  it("should handle complex types", () => {
    type Error = { message: string };
    type Success = { data: number[] };

    const error = left<Error, Success>({ message: "Failed" });
    const success = right<Error, Success>({ data: [1, 2, 3] });

    expect(error.isLeft()).toBe(true);
    expect(success.isRight()).toBe(true);
  });
});
