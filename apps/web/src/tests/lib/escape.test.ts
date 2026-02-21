import { escapeJsonForHtml } from "@/lib/escape";

describe("escapeJsonForHtml", () => {
  it("should escape <, >, &, Line Separator, Paragraph Separator", () => {
    const input = `<script>alert("XSS")</script>&\u2028\u2029`;
    const expected = `\\u003cscript\\u003ealert("XSS")\\u003c/script\\u003e\\u0026\\u2028\\u2029`;
    expect(escapeJsonForHtml(input)).toBe(expected);
  });

  it("should not modify safe characters", () => {
    const input = `Hello, World! 12345`;
    const expected = `Hello, World! 12345`;
    expect(escapeJsonForHtml(input)).toBe(expected);
  });
});
