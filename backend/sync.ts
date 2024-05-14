/* used by Expo Router API Routes */

import storage from "node-persist";
import { unionBy } from "lodash";

const dataset = "crdt4"

type CrdtRecord = {
  recordId: string;
  rowId: string;
  column: string;
  value: string;
  tombstone?: boolean;
  timestamp: string;
  clientName: string
};

  async function initIfNeeded() {
    await storage.init({
      dir: "./storage",
      expiredInterval: 0,
    });
  }

  export async function syncCrdtRecords(newRecords: CrdtRecord[]) {
    await initIfNeeded();
    const currentCrdtRecords = (await storage.getItem(dataset)) || [];
    const updatedCrdtRecords = unionBy(currentCrdtRecords, newRecords, "recordId");
    await storage.setItem(dataset, updatedCrdtRecords);
    return updatedCrdtRecords;
  }

