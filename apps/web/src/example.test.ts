// vitest のサンプルコード。
// サンプルコードがないと vitest がエラーになるため用意している。
//
// TODO: 実際のテストコードができれば、このファイルは不要なので削除する。

function sum(a: number, b: number) {
  return a + b;
}

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
