export default class AstroUtils {
	public static async wrap<T = void>(fn: () => T | Promise<T>) {
		return await fn()
	}
}
