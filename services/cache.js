class TabManagerCache extends Dexie {
  constructor() {
    super('TabManagerDB');
    
    this.version(1).stores({
      collections: 'id, name, lastUpdated',
      sessions: '[collectionId+timestamp], collectionId',
      syncQueue: '++id, type, data, timestamp'
    });
  }

  async initializeCache(collections) {
    const transaction = this.transaction('rw', this.collections, this.sessions, async () => {
      await this.collections.clear();
      await this.sessions.clear();
      
      for (const collection of collections) {
        await this.collections.put({
          ...collection,
          lastUpdated: Date.now()
        });
        
        if (collection.sessions) {
          await Promise.all(collection.sessions.map(session => 
            this.sessions.put({
              ...session,
              collectionId: collection.id
            })
          ));
        }
      }
    });
    
    return transaction;
  }

  async getCollections() {
    const collections = await this.collections.toArray();
    for (const collection of collections) {
      collection.sessions = await this.sessions
        .where('collectionId')
        .equals(collection.id)
        .toArray();
    }
    return collections;
  }

  async getCollection(id) {
    const collection = await this.collections.get(id);
    if (collection) {
      collection.sessions = await this.sessions
        .where('collectionId')
        .equals(id)
        .toArray();
    }
    return collection;
  }

  async addSession(collectionId, session) {
    await this.sessions.put({
      ...session,
      collectionId
    });
    await this.collections.update(collectionId, { lastUpdated: Date.now() });
    await this.syncQueue.add({
      type: 'ADD_SESSION',
      data: { collectionId, session },
      timestamp: Date.now()
    });
  }

  async deleteSession(collectionId, timestamp) {
    await this.sessions
      .where('[collectionId+timestamp]')
      .equals([collectionId, timestamp])
      .delete();
    await this.collections.update(collectionId, { lastUpdated: Date.now() });
    await this.syncQueue.add({
      type: 'DELETE_SESSION',
      data: { collectionId, timestamp },
      timestamp: Date.now()
    });
  }

  async getSyncQueue() {
    return this.syncQueue.toArray();
  }

  async clearSyncQueue() {
    return this.syncQueue.clear();
  }
}

export const cache = new TabManagerCache();
