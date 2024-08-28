/**
 * the Dao is the object that connect the Database or source to the application layer
 *
 * you MUST call it through the `DaoFactory` file
 */
export default abstract class Dao<Object extends { id: any } = { id: any }> {

	/**
	 * insert a new object into the source
	 *
	 * @param obj the object to create
	 * @returns the object with it's id filled if create or null otherwise
	 */
	abstract create(obj: Omit<Object, 'id' | 'created' | 'updated'>): Promise<Object | null>

	/**
	 * insert a new object into the source
	 *
	 * @param obj the object to create
	 * @returns the object with it's id filled if create or null otherwise
	 */
	public insert: Dao<Object>['create'] = (obj: Parameters<Dao<Object>['create']>[0]) => this.create(obj)

	/**
	 * find the list of objects having elements from the query
	 *
	 * @param query a partial object which filter depending on the elements, if not set it will fetch everything
	 * @returns an array containing the list of elements that match with the query
	 */
	abstract findAll(query?: Partial<Object>): Promise<Array<Object>>

	/**
	 * find the list of objects having elements from the query
	 *
	 * @param query a partial object which filter depending on the elements, if not set it will fetch everything
	 * @returns an array containing the list of elements that match with the query
	 */
	public find: Dao<Object>['findAll'] = (query: Parameters<Dao<Object>['findAll']>[0]) => this.findAll(query)

	/**
	 * find an object by it's id
	 *
	 * (shortcut to findOne({id: id}))
	 *
	 * @param id the id of the object
	 * @returns
	 */
	public findById(id: Object['id']): Promise<Object | null> {
		return this.findOne({id: id} as Partial<Object>)
	}

	/**
	 * find an object by it's id
	 *
	 * (shortcut to findOne({id: id}))
	 *
	 * @param id the id of the object
	 * @returns
	 */
	public get(id: Object['id']) {
		return this.findById(id)
	}

	/**
	 * find the first element that match `query`
	 *
	 * @param query a partial object which filter depending on the elements, if not set it will fetch everything
	 * @returns the first element matching with the query or null otherwise
	 */
	public async findOne(query?: Partial<Object>): Promise<Object | null> {
		return (await this.findAll(query))[0] ?? null
	}

	/**
	 * update the remote reference of the object
	 *
	 * note: it will not try to insert an item (use `upsert` to handle this)
	 *
	 * @param obj the object to update
	 * @returns an object if it was able to update or null otherwise
	 */
	abstract update(obj: Object): Promise<Object | null>

	/**
	 * change some elements from the object and return the object updated
	 * @param id the id of the object
	 * @param changegs the change to make
	 */
	public async patch(id: string, changes: Partial<Object>): Promise<Object | null> {
		const query = await this.findById(id)
		if (!query) {
			return null
		}
		return await this.update({...query, ...changes})
	}
	/**
	 * update the remote reference of the object or create it if not found
	 * @param obj the object to update/insert
	 * @returns the object is updated/inserted or null otherwise
	 */
	public async upsert(object: Object | Omit<Object, 'id' | 'created' | 'updated'>): Promise<Object | null> {
		if ('id' in object) {
			return this.update(object)
		}
		return this.insert(object)
	}

	/**
	 * Delete the object
	 * @param obj the object to delete
	 *
	 * @returns if the object was deleted or not (if object is not in db it will return true)
	 */
	abstract delete(obj: Object): Promise<boolean>
}
