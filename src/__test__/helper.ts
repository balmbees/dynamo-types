export function toJS<R, E = Error>(promise: Promise<R>): Promise<[null, R] | [E, null]> {
  return promise.then((v) => [null, v] as [null, R])
    .catch((e) => [e, null] as [E, null]);
}
