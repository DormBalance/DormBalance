function JSONifyBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, val) =>
      typeof val === 'bigint' ? val.toString() : val
    )
  );
}

export default JSONifyBigInt;