import { test as base } from '@playwright/test';
import { DatabaseSession } from "../infra/database/DatabaseSession.js"

type DatabaseFixtures = {
    db: DatabaseSession;
}

export const test = base.extend<DatabaseFixtures>({

    db: async ({}, use)=>{

        const session = new DatabaseSession();

        await session.beginTransaction();

        try{
            await use(session);
        } finally{
            await session.rollbackAndRelease();
        }

    }


});

export { expect } from '@playwright/test';