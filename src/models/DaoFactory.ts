/**
 * TODO:
 * Add to `DaoItem` your model name
 * Add to the function `initDao` the Dao
 */

/**
 * the different Daos that can be initialized
 *
 * Touch this interface to define which key is linked to which Dao
 */
interface DaoItem {
}

/**
 * Class to get any DAO
 */
export default class DaoFactory {
	/**
	 * reference of the different Daos for a correct singleton implementation
	 */
	private static daos: Partial<DaoItem> = {}

	/**
	 * Get a a dao by its key
	 *
	 * it will throw an error if no Dao exists linked to the item key
	 *
	 * @param key the dao key to get
	 * @returns the Dao you want as a singleton
	 */
	public static get<Key extends keyof DaoItem>(key: Key): DaoItem[Key] {
		if (!(key in this.daos)) {
			const dao = this.initDao(key)
			if (!dao) {
				throw new Error(`${key} has no valid Dao`)
			}
			this.daos[key] = dao as DaoItem[Key]
		}
		return this.daos[key] as DaoItem[Key]
	}

	/**
	 * init a dao by its key, it does not care if it exists or not
	 *
	 * @param item the element to init
	 * @returns a new initialized dao or undefined if no dao is linked
	 */
	private static initDao(item: keyof DaoItem): any | undefined {
		switch (item) {
			default: return undefined
		}
	}
}
